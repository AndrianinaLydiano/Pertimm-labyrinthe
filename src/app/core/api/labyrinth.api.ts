import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { StartGameResponse, Cell, Position } from '../models/labyrinth.model';
import { environment } from '../../../environments/environment';
import { of } from 'rxjs';
import { mockDiscoverResponse, mockStartGameResponse } from '../../mocks/labyrinth.mock';

const BASE_URL = 'https://hire-game-maze.pertimm.dev';

@Injectable({
  providedIn: 'root'
})
export class LabyrinthApi {
  private http = inject(HttpClient);


  startGame(player: string) {
    if (environment.useMockApi) {
      return of<StartGameResponse>({ ...mockStartGameResponse, player });
    }
    return this.http.post<StartGameResponse>(`${BASE_URL}/start-game/`, { player });
  }

  discover(url: string) {
    if (environment.useMockApi) {
      return of<Cell[]>(mockDiscoverResponse);
    }
    return this.http.get<Cell[]>(url);
  }

  move(url: string, position: Position) {
     if (environment.useMockApi) {
      return of({
        ...mockStartGameResponse,
        position_x: position.x,
        position_y: position.y
      });
    }
    return this.http.post<StartGameResponse>(url, { position_x: position.x, position_y: position.y });
  }
}
