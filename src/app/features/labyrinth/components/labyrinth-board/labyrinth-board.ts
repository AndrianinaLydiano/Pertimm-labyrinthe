import { Component, inject } from '@angular/core';
import { LabyrinthService } from '../../services/labyrinth.service';
import { Cell } from '../../../../core/models/labyrinth.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-labyrinth-board',
  imports: [CommonModule],
  templateUrl: './labyrinth-board.html',
  styleUrl: './labyrinth-board.css'
})
export class LabyrinthBoard {
  private labyrinthService = inject(LabyrinthService);
  cells = this.labyrinthService.cells;

  moveTo(cell: Cell) {
    this.labyrinthService.moveAndDiscover({ x: cell.x, y: cell.y });
  }
}
