import { inject, Injectable, signal } from '@angular/core';
import { LabyrinthApi } from '../../../core/api/labyrinth.api';
import { Position, Cell } from '../../../core/models/labyrinth.model';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LabyrinthService {
  private api = inject(LabyrinthApi);

  player = signal<string | null>(null);
  position = signal<Position>({ x: 0, y: 0 });
  cells = signal<Cell[]>([]);
  moveUrl = signal<string>('');
  discoverUrl = signal<string>('');
  dead = signal(false);
  win = signal(false);

  start(player: string) {
    this.api.startGame(player).subscribe((res) => {
      this.player.set(res.player);
      this.position.set({ x: res.position_x, y: res.position_y });
      this.moveUrl.set(res.url_move);
      this.discoverUrl.set(res.url_discover);
      this.dead.set(res.dead);
      this.win.set(res.win);
    });
  }

  discover() {
    this.api.discover(this.discoverUrl()).subscribe((res) => {
      this.cells.set(res);
    });
  }

  move(pos: Position) {
    this.api.move(this.moveUrl(), pos).subscribe((res) => {
      this.position.set({ x: res.position_x, y: res.position_y });
      this.moveUrl.set(res.url_move);
      this.discoverUrl.set(res.url_discover);
      this.dead.set(res.dead);
      this.win.set(res.win);
    });
  }

  async solveAutomatically() {
    try {
      const visited = new Set<string>();
      const tabOfPathFromStartToActualPosition: { pos: Position; path: Position[] }[] = [];
      const start = this.position();

      tabOfPathFromStartToActualPosition.push({ pos: start, path: [start] });

      if (this.win()) {
        console.log('Le jeu est déjà gagné !');
        return;
      }

      while (tabOfPathFromStartToActualPosition.length > 0) {
        const { pos, path } = tabOfPathFromStartToActualPosition.shift()!;

        const moveResponse = await firstValueFrom(
          this.api.move(this.moveUrl(), pos)
        );

        this.position.set({
          x: moveResponse.position_x,
          y: moveResponse.position_y,
        });
        this.moveUrl.set(moveResponse.url_move);
        this.discoverUrl.set(moveResponse.url_discover);
        this.dead.set(moveResponse.dead);
        this.win.set(moveResponse.win);

        visited.add(`${start.x},${start.y}`);

        if (moveResponse.dead) {
          console.log('Partie terminée, on a atteri sur une piège');
          break;
        }

        if (moveResponse.win) {
          console.log(' Victoire ! Sortie atteinte automatiquement !');
          console.log('Chemin suivi :', path);
          break;
        }

        const neighbors = await firstValueFrom(
          this.api.discover(this.discoverUrl())
        );

        this.cells.set(neighbors);

        for (const neighbor of neighbors) {
          const key = `${neighbor.x},${neighbor.y}`;

          if (
            visited.has(key) ||
            neighbor.value === 'wall' ||
            neighbor.value === 'trap'
          ) {
            continue;
          }

          const newPath = [...path, { x: neighbor.x, y: neighbor.y }];

          if (neighbor.value === 'stop') {
            console.log(' Victoire ! Sortie atteinte automatiquement !');
            console.log('Chemin suivi :', path);
            return;
          }

          tabOfPathFromStartToActualPosition.push({ pos: { x: neighbor.x, y: neighbor.y }, path: newPath });
          visited.add(key);
        }
      }

      if (!this.win() && !this.dead()) {
        console.log("Aucune sortie trouvée avec l'algorithme automatique!");
      }
    } catch (error) {
      console.error('Erreur lors de la résolution automatique :', error);
    }
  }
}
