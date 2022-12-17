export enum PlayerStatus {
  Joined,
  MadeChoice,
  OutOfGame,
}

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
  player1Status: PlayerStatus,
  player2Status: PlayerStatus,
  player1Choice: Choice | null,
  player2Choice: Choice | null,
  player1Wins: number,
  player2Wins: number,
}
