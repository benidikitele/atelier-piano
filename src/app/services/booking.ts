import { Injectable, signal } from '@angular/core';

export interface Slot {
  id: string;
  date: string;
  time: string;
}

export interface BookingRequest {
  id: string;
  slotId: string;
  date: string;
  time: string;
  name: string;
  email: string;
  status: 'pending' | 'confirmed' | 'rejected';
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {

  readonly slots = signal<Slot[]>([]);
  readonly requests = signal<BookingRequest[]>([]);

  constructor() {
    // Quelques créneaux de démonstration pour les prochains jours.
    const slots: Slot[] = [];

    for (let offset = 1; offset <= 14; offset++) {
      const date = new Date();
      date.setDate(date.getDate() + offset);

      if ([2, 4, 6].includes(date.getDay())) {
        for (const time of ['10:00', '14:00', '16:30']) {
          slots.push({
            id: crypto.randomUUID(),
            date: this.dateKey(date),
            time,
          });
        }
      }
    }

    this.slots.set(slots);
  }

  dateKey(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

   isFuture(slot: Pick<Slot, 'date' | 'time'>): boolean {
    return new Date(`${slot.date}T${slot.time}:00`).getTime() > Date.now();
  }

  availableSlots(date: string): Slot[] {
    return this.slots()
      .filter(slot =>
        slot.date === date &&
        this.isFuture(slot) &&
        !this.requests().some(request =>
          request.slotId === slot.id &&
          request.status !== 'rejected'
        )
      )
      .sort((a, b) => a.time.localeCompare(b.time));
  }

  addSlot(date: string, time: string): void {
    if (!date || !time || !this.isFuture({ date, time })) {
      throw new Error('Choisissez une date et un horaire futurs.');
    }

    if (this.slots().some(slot => slot.date === date && slot.time === time)) {
      throw new Error('Ce créneau existe déjà.');
    }

    this.slots.update(slots => [
      ...slots,
      { id: crypto.randomUUID(), date, time },
    ]);
  }

  removeSlot(id: string): void {
    if (this.requests().some(request =>
      request.slotId === id && request.status !== 'rejected'
    )) {
      throw new Error('Ce créneau possède une demande active.');
    }

    this.slots.update(slots => slots.filter(slot => slot.id !== id));
  }

  requestSlot(date: string, time: string, name: string, email: string): void {
    const slot = this.availableSlots(date).find(slot => slot.time === time);

    if (!slot) {
      throw new Error('Ce créneau n’est plus disponible.');
    }

    if (!name.trim() || !email.trim()) {
      throw new Error('Renseignez votre nom et votre courriel.');
    }

    this.requests.update(requests => [
      ...requests,
      {
        id: crypto.randomUUID(),
        slotId: slot.id,
        date,
        time,
        name: name.trim(),
        email: email.trim(),
        status: 'pending',
      },
    ]);
  }

  updateStatus(
    id: string,
    status: 'confirmed' | 'rejected',
  ): void {
    this.requests.update(requests =>
      requests.map(request =>
        request.id === id && request.status === 'pending'
          ? { ...request, status }
          : request
      )
    );
  }

}
