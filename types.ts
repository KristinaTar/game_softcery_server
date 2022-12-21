export enum Choice {
  Rock = 'rock',
  Paper = 'paper',
  Scissors = 'scissors',
}

export type Game = {
  player1Name: string,
  player2Name: string | null,
  player1ID: string,
  player2ID: string | null,
  player1Choice: Choice | null,
  player2Choice: Choice | null,
  player1Score: number,
  player2Score: number,
}

export enum Outcome {
  Win = 'win',
  Loss = 'loss',
  Draw = 'draw',
}
