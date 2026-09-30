import { Routes } from '@angular/router';
import { Reservation } from './pages/reservation/reservation';

export const routes: Routes = [
    {
        path: '',
        component : Reservation,
    },
    {
        path : '**',
        redirectTo: '',
    }
];
