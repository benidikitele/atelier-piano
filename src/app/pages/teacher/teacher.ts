import { Component, computed, inject } from '@angular/core';
import { BookingRequest, BookingService } from '../../services/booking';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-teacher',
  standalone: true,
  imports: [FormsModule,RouterLink],
  templateUrl: './teacher.html',
  styleUrl: './teacher.scss',
})
export class Teacher {
   readonly booking = inject(BookingService);

  readonly slots = computed(() =>
    [...this.booking.slots()].sort((a, b) =>
      `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`)
    )
  );

  readonly requests = computed(() =>
    [...this.booking.requests()].reverse()
  );

  readonly pendingCount = computed(() =>
    this.booking.requests().filter(request =>
      request.status === 'pending'
    ).length
  );

  date = '';
  time = '';
  message = '';
  errorMessage = '';

  readonly today = this.booking.dateKey(new Date());

  addSlot(): void {
    this.message = '';
    this.errorMessage = '';

    try {
      this.booking.addSlot(this.date, this.time);
      this.message = 'Créneau ajouté.';
      this.time = '';
    } catch (error) {
      this.showError(error);
    }
  }

  removeSlot(id: string): void {
    this.message = '';
    this.errorMessage = '';

    try {
      this.booking.removeSlot(id);
      this.message = 'Créneau supprimé.';
    } catch (error) {
      this.showError(error);
    }
  }

  confirm(id: string): void {
    this.booking.updateStatus(id, 'confirmed');
  }

  reject(id: string): void {
    this.booking.updateStatus(id, 'rejected');
  }

  hasActiveRequest(slotId: string): boolean {
    return this.booking.requests().some(request =>
      request.slotId === slotId && request.status !== 'rejected'
    );
  }

  statusLabel(status: BookingRequest['status']): string {
    return {
      pending: 'En attente',
      confirmed: 'Confirmée',
      rejected: 'Refusée',
    }[status];
  }

  formatDate(date: string): string {
    return new Date(`${date}T12:00:00`).toLocaleDateString('fr-CA', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }

  private showError(error: unknown): void {
    this.errorMessage = error instanceof Error
      ? error.message
      : 'Une erreur est survenue.';
  }
}
