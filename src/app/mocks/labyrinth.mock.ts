import { Cell, StartGameResponse } from "../core/models/labyrinth.model";

export const mockStartGameResponse: StartGameResponse = {
  player: 'TestPlayer',
  message: '',
  position_x: 1,
  position_y: 2,
  dead: false,
  win: false,
  url_move: 'mock/move',
  url_discover: 'mock/discover'
};

export const mockDiscoverResponse: Cell[] = [
  { x: 1, y: 3, move: true, value: 'path' },
  { x: 2, y: 2, move: false, value: 'wall' },
  { x: 1, y: 1, move: false, value: 'wall' },
  { x: 0, y: 2, move: true, value: 'path' }
];
