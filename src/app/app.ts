import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { GameControls } from './features/labyrinth/components/game-controls/game-controls';
import { LabyrinthBoard } from './features/labyrinth/components/labyrinth-board/labyrinth-board';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, GameControls, LabyrinthBoard],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
}
