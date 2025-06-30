export interface Position {
  x: number;
  y: number;
}

export interface Cell extends Position {
  move: boolean;
  value: 'wall' | 'path' | 'trap' | 'home' | 'stop';
}

export interface StartGameResponse {
  player: string;
  message: string;
  position_x: number;
  position_y: number;
  dead: boolean;
  win: boolean;
  url_move: string;
  url_discover: string;
}
