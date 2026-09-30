import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';


interface CalendarDay{
  date : Date,
  currentMonth: boolean,
  available: boolean
}

@Component({
  selector: 'app-reservation',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './reservation.html',
  styleUrl: './reservation.scss',
})
export class Reservation {
  readonly weekdays = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  readonly today = this.startOfDay(new Date());

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
  readonly weeklySlots: Record<number, string[]> = {
    2: ['10:00', '14:00', '16:30'],
    4: ['14:00', '16:30', '18:00'],
    6: ['09:00', '10:30', '14:00'],
  };

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

    this.selectedDate = null;
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
    if(
      !this.selectedDate || !this.availableTimes.includes(this.selectedTime) || !this.studentName.trim() || !this.studentEmail.trim()
    ){
      return;
    }

    // Connexion à ASP.NET dans une prochaine etape
    this.submitted = true;
  }

  private getSlots(date: Date): string[]{
    const slots = this.weeklySlots[date.getDay()] ?? [];

    return slots.filter((time)=>{
      const [hours,minutes] = time.split(':').map(Number);
      const appointement = new Date(date);
      appointement.setHours(hours,minutes,0,0);

      return appointement.getTime() > Date.now();
    });
  }

  private startOfDay(date: Date): Date{
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }
}
