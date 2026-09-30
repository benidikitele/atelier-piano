import { Routes } from '@angular/router';
import { Reservation } from './pages/reservation/reservation';
import { Teacher } from './pages/teacher/teacher';

export const routes: Routes = [
    {
        path: '',
        component : Reservation,
    },
    { 
        path: 'teacher', 
        component: Teacher 
    },
    {
        path : '**',
        redirectTo: '',
    }
];
