import { Component, inject } from '@angular/core';
import { LabyrinthService } from '../../services/labyrinth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-game-controls',
  imports: [CommonModule, FormsModule],
  templateUrl: './game-controls.html',
  styleUrl: './game-controls.css'
})
export class GameControls {
  private labyrinthService = inject(LabyrinthService);

  playerName: string = '';
  nameError: string = '';

  get isAutoSolving() { return this.labyrinthService.isAutoSolving; }
  get autoSolveResult() { return this.labyrinthService.autoSolveResult; }

  onNameInput() {
    if (this.nameError) {
      this.nameError = '';
    }
  }

  startGame() {
    this.nameError = '';

    if (!this.playerName.trim()) {
      this.nameError = 'Le nom du joueur est requis';
      return;
    }

    if (this.playerName.trim().length < 2) {
      this.nameError = 'Le nom doit contenir au moins 2 caractères';
      return;
    }

    if (this.playerName) {
      this.labyrinthService.start(this.playerName.trim());
    }
  }

  discover() {
    this.labyrinthService.discover();
  }

  solveAutomatically() {
    this.labyrinthService.solveAutomatically();
  }

  dismissResult() {
    this.labyrinthService.autoSolveResult.set(null);
  }
}
