import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { City } from './city';
import { WeatherService } from './weather.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent implements OnInit {
  title = 'trip10';
  modalOpened: boolean = false;
  cities: string[] = ['Kyiv', 'Lviv', 'Kharkiv', 'Odessa', 'Dnipro', 'Zaporizhzhia', 'Vinnytsia', 'Khmelnytskyi', 'Ivano-Frankivsk', 'Ternopil'];
  selectedCity: any;
  startWindowCities: City[] = [
    {
      id: 1,
      name: 'Kyiv',
      photoUrl: 'https://images.unsplash.com/photo-1576990543162-7e1df5effea4?q=80&w=2128&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
      startDate: new Date('03-03-2024'),
      endDate: new Date('05-03-2024')
    },
  ];
  startDate: any = new Date();
  endDate: any = new Date();
  searchText: string = '';
  currentWeather: any;
  selectedTrip: any;
  countdown: string = '';
  days: string = '';
  hours: string = '';
  minutes: string = '';
  seconds: string = '';
  intervalId: any;

  // Приймає об'єкт Date і повертає рядок у форматі "dd.mm.yyyy". 
  formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }

  // Фільтрація міст за текстом пошуку
  filterCities() {
    return this.startWindowCities.filter(city =>
      city.name.toLowerCase().includes(this.searchText.toLowerCase())
    );
  }

  // Видалення знайденого міста
  removeCity(id: number) {
    this.startWindowCities = this.startWindowCities.filter(city => city.id !== id);
  }

  // Обмеження по кількості днів в календарі
  get minStartDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
  
  get maxStartDate(): string {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 15);
    return maxDate.toISOString().split('T')[0];
  }
  
  get minEndDate(): string {
    if (this.startDate !== '') {
      const startDate = new Date(this.startDate);
      startDate.setDate(startDate.getDate() + 1);
      return startDate.toISOString().split('T')[0];
    }
    return '';
  }
  
  get maxEndDate(): string {
    if (this.startDate !== '') {
      const startDate = new Date(this.startDate);
      const maxDate = new Date(startDate);
      maxDate.setDate(startDate.getDate() + 15);
      return maxDate.toISOString().split('T')[0];
    }
    return '';
  }

  ngOnInit() {
  }

  // Відкриваємо модальне вікно
  openModal() {
    this.modalOpened = true;
  }
  // Закриваємо модальне вікно
  closeModal() {
    this.modalOpened = false;
  }

  // Додавання міста з модального вікна
  async addSelectedCity() {
    if (this.selectedCity !== '' && this.startDate !== '' && this.endDate !== '') {
      try {
        const photoUrl = await this.getCityPhoto(this.selectedCity);
        const city: City = {
          name: this.selectedCity, photoUrl: photoUrl,
          id: this.startWindowCities.length + 1, startDate: new Date(this.startDate), endDate: new Date(this.endDate)
        };
        this.startWindowCities.push(city);
        this.selectedCity = '';
        this.startDate = '';
        this.endDate = '';
        this.closeModal();
      } catch (error) {
        console.error('Error retrieving a photo of the city:', error);
        alert('An error occurred while adding the city. Please try again.');
      }
    } else {
      alert('Please fill in all fields.');
    }

  }

  cancel() {
    this.closeModal();
  }

  constructor(private http: HttpClient, private weatherService: WeatherService) { }

  // Отримання погоди
  getWeather(cityName: string) {

    this.weatherService.getCurrentWeather(cityName)
      .subscribe(data => {
        this.currentWeather = data;
      });
  }

  // Отримання фото міста
  async getCityPhoto(city: string): Promise<string> {
    try {
      const response: any = await this.http.get('https://api.unsplash.com/photos/random', {
        params: {
          query: city,
          client_id: 'SdEXjZMp4k_knusd5rTKPQtds6M2JJSK0m_tvsncAas',
          orientation: 'landscape'
        }
      }).toPromise();
      return response.urls.regular;
    } catch (error) {
      console.error('Error getting city photo:', error);
      throw new Error('An error occurred while retrieving a photo of the city');
    }
  }

  // 
  selectTrip(city: City) {
    this.selectedTrip = city;
    this.getDaysUntilTrip(city.startDate);
    this.getWeather(city.name);
  }

  // Метод з передачею дати початку подорожі
  getDaysUntilTrip(startDate: Date): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    } // Зупиняємо попередній таймер, якщо він був запущений
    this.intervalId = setInterval(() => {
      const today = new Date();
      const timeDiff = startDate.getTime() - today.getTime();
      if (timeDiff > 0) {
        const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
        this.days = `${days}`;
        this.hours = `${hours}`;
        this.minutes = `${minutes}`;
        this.seconds = `${seconds}`;
      } else {
        this.countdown = 'Trip has already started';
        clearInterval(this.intervalId); // Припиняємо відлік, якщо поїздка вже почалась
      }
    }, 1000);
  }
}
