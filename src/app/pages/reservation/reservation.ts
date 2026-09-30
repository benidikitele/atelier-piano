import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Inject } from '@angular/core';
import { BookingService } from '../../services/booking';
import { RouterLink } from '@angular/router';


interface CalendarDay{
  date : Date,
  currentMonth: boolean,
  available: boolean
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [FormsModule, RouterLink],
  templateUrl: './reservation.html',
  styleUrl: './reservation.scss',
})
export class Reservation {
  readonly weekdays = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  readonly today = this.startOfDay(new Date());

  private readonly booking = inject(BookingService);
  errorMessage = '';

  displayedMonth = new Date(
    this.today.getFullYear(),
    this.today.getMonth(),
    1
  );

  selectedDate : Date | null = null;
  selectedTime = '';

  studentName = '';
  studentEmail= '';
  studentNumber = '';
  submitted = false;

    // Disponibilités fictives pour construire le frontend.

  get monthLabel(): string{
    return this.displayedMonth.toLocaleDateString('fr-CA',{
      month : 'long',
      year: 'numeric',
    });
  }

  get selectedDateLabel(): string {
    return this.selectedDate?.toLocaleDateString('fr-CA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }) ?? '';
  }

  get calendarDays(): CalendarDay[]{
    const first = new Date(
      this.displayedMonth.getFullYear(),
      this.displayedMonth.getMonth(),
      1,
    );

    const offset = (first.getDay() + 6) % 7;
    const start = new Date(first);
    start.setDate(first.getDate() - offset);

    return Array.from({length:42}, (_, index)=>{
      const date = new Date(start);
      date.setDate(start.getDate() + index);

      const currentMonth = date.getMonth() === this.displayedMonth.getMonth();
      return {
        date,
        currentMonth,
        available :
          currentMonth && date >= this.today && this.getSlots(date).length > 0,
      };
    });

  }

  get availableTimes(): string[]{
    return this.selectedDate ? this.getSlots(this.selectedDate) : [];
  }

  get canGoPrevious(): boolean{
    return this.displayedMonth.getTime() > new Date(this.today.getFullYear(), this.today.getMonth(),1).getTime();
  }

  changeMonth(direction: number): void{
    if (direction < 0 && !this.canGoPrevious) return;

    this.displayedMonth = new Date(
      this.displayedMonth.getFullYear(),
      this.displayedMonth.getMonth()+direction,
      1,
    );

    this.selectedDate = null;
    this.selectedTime = '';
    this.submitted = false;
  }

  selectDate(day:CalendarDay): void{
    if(!day.available) return;

    this.selectedDate = day.date;
    this.selectedTime = '';
    this.submitted = false;
  }

  selectTime(time:string): void{
    this.selectedTime = time;
    this.submitted = false;
  }

  isSelected(date: Date): boolean{
    return this.selectedDate?.getTime() === date.getTime();
  }
  
  submitRequest(): void{
    this.errorMessage = '';
    this.submitted = false;


    if(!this.selectedDate || !this.selectedTime) return;

    try{
      this.booking.requestSlot(
        this.booking.dateKey(this.selectedDate),
        this.selectedTime,
        this.studentName,
        this.studentEmail,
      );
      this.submitted = true;
    }catch(error){
      this.errorMessage = error instanceof Error
      ? error.message
      : 'Impossible de créer la demande.';
    }
  }

  private getSlots(date: Date): string[]{
    return this.booking.availableSlots(this.booking.dateKey(date)).map(slot => slot.time);
  }

  private startOfDay(date: Date): Date{
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
