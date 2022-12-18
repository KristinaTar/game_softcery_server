import { Socket } from "socket.io";
import { Choice } from "./types";

export function generateId(length: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function getWinnerId(
  player1Choice: Choice,
  player2Choice: Choice,
): number {
  if (player1Choice === player2Choice) {
    return 0; //draw
  } else if (
    (player1Choice === Choice.Paper && player2Choice === Choice.Rock)
    || (player1Choice === Choice.Scissors && player2Choice === Choice.Paper)
    || (player1Choice === Choice.Rock && player2Choice === Choice.Scissors)
  ) {
    return 1; // player 1 won
  } else {
    return 2; // player 2 won
  }
}
