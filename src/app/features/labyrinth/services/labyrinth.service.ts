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
  isAutoSolving = signal(false);
  autoSolveResult = signal<{
    success: boolean;
    message: string;
    path: Position[];
  } | null>(null);

  private resetAutoSolve() {
    this.isAutoSolving.set(false);
    this.autoSolveResult.set(null);
  }

  start(player: string) {
    this.api.startGame(player).subscribe((res) => {
      this.player.set(res.player);
      this.position.set({ x: res.position_x, y: res.position_y });
      this.moveUrl.set(res.url_move);
      this.discoverUrl.set(res.url_discover);
      this.dead.set(res.dead);
      this.win.set(res.win);
      this.resetAutoSolve();
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

  moveAndDiscover(pos: Position) {
    this.api.move(this.moveUrl(), pos).subscribe((res) => {
      this.position.set({ x: res.position_x, y: res.position_y });
      this.moveUrl.set(res.url_move);
      this.discoverUrl.set(res.url_discover);
      this.dead.set(res.dead);
      this.win.set(res.win);

      this.api.discover(this.discoverUrl()).subscribe((neighbors) => {
        this.cells.set(neighbors);
      });
    });
  }

  async solveAutomatically() {
    try {
      if (this.isAutoSolving()) {
        console.log('Auto-solving already in progress');
        return;
      }

      // Set loading state
      this.isAutoSolving.set(true);
      this.autoSolveResult.set(null);

      //liste des positions déjà visitées sans doublon
      const visited = new Set<string>();
      const tabOfPathFromStartToActualPosition: {
        pos: Position;
        path: Position[];
      }[] = [];
      const start = this.position();

      // file contenant des objets à explorer avec leur position et le chemin suivi pour y arriver
      tabOfPathFromStartToActualPosition.push({ pos: start, path: [start] });

      // On ajoute la position de départ comme premier élément à explorer
      tabOfPathFromStartToActualPosition.push({ pos: start, path: [start] });
      visited.add(`${start.x},${start.y}`);

      if (this.win()) {
        console.log('Le jeu est déjà gagné !');
        this.autoSolveResult.set({
          success: true,
          message: 'Le jeu est déjà gagné !',
          path: [this.position()],
        });
        return;
      }

      while (tabOfPathFromStartToActualPosition.length > 0) {
        // prend le premier élément de la file
        const { pos, path } = tabOfPathFromStartToActualPosition.shift()!;

        // explorer le chemin depuis le début jusqu'à la position actuelle
        for (let i = 1; i < path.length; i++) {
          const step = path[i];

          const response = await firstValueFrom(
            this.api.move(this.moveUrl(), step)
          );

          // Mise à jour de l’état local avec les infos reçues
          this.position.set({ x: response.position_x, y: response.position_y });
          this.moveUrl.set(response.url_move);
          this.discoverUrl.set(response.url_discover);
          this.dead.set(response.dead);
          this.win.set(response.win);

          // Ajout delay pour rendre l'animation visible
          await new Promise(resolve => setTimeout(resolve, 500));

          // Si on est mort, on arrête tout
          if (response.dead) {
            console.log('Partie terminée, on a atterri sur un piège');
            this.autoSolveResult.set({
              success: false,
              message: 'Partie terminée, on a atterri sur un piège',
              path: path,
            });
            return;
          }

          // Si on a gagné, on arrête et on affiche le chemin
          if (response.win) {
            console.log('Victoire ! Sortie atteinte automatiquement !');
            console.log('Chemin suivi :', path);
            this.autoSolveResult.set({
              success: true,
              message: `Victoire ! Sortie atteinte automatiquement!`,
              path: path,
            });
            return;
          }
        }

        // marque la position comme explorée
        visited.add(`${pos.x},${pos.y}`);

        // découvre les voisins de la position courante
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

          // Si la case voisine est la sortie, on s’arrête ici
          if (neighbor.value === 'stop') {
            // se déplacer vers la sortie
            const response = await firstValueFrom(
              this.api.move(this.moveUrl(), { x: neighbor.x, y: neighbor.y })
            );

            // Mise à jour de l'état
            this.position.set({ x: response.position_x, y: response.position_y });
            this.moveUrl.set(response.url_move);
            this.discoverUrl.set(response.url_discover);
            this.dead.set(response.dead);
            this.win.set(response.win);

            console.log('Victoire ! Sortie atteinte automatiquement !');
            console.log('Chemin suivi :', newPath);
            this.autoSolveResult.set({
              success: true,
              message: 'Victoire ! Sortie atteinte automatiquement !',
              path: newPath,
            });
            return;
          }

          // Sinon, on ajoute cette position à la file
          tabOfPathFromStartToActualPosition.push({
            pos: { x: neighbor.x, y: neighbor.y },
            path: newPath,
          });

          // On la marque comme visitée
          visited.add(key);
        }
      }

      if (!this.win() && !this.dead()) {
        console.log("Aucune sortie trouvée avec l'algorithme automatique!");
        this.autoSolveResult.set({
          success: false,
          message: "Aucune sortie trouvée avec l'algorithme automatique!",
          path: [],
        });
      }
    } catch (error) {
      console.error('Erreur lors de la résolution automatique :', error);
      this.autoSolveResult.set({
        success: false,
        message: 'Erreur lors de la résolution automatique',
        path: [],
      });
    } finally {
      this.isAutoSolving.set(false);
    }
  }
}
