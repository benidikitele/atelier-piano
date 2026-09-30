import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterLink],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('atelier-piano');
}
