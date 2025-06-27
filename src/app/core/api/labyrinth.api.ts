import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StartGameResponse, Cell, Position } from '../models/labyrinth.model';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

@Injectable({
  providedIn: 'root'
})
export class LabyrinthApi {
  private http = inject(HttpClient);

  startGame(player: string) {
    return this.http.post<StartGameResponse>(`${BASE_URL}/start-game/`, { player });
  }

  discover(url: string) {
    return this.http.get<Cell[]>(url);
  }

  move(url: string, position: Position) {
    return this.http.post<StartGameResponse>(url, { position_x: position.x, position_y: position.y });
  }
}
