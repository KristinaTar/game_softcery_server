import { Socket } from "socket.io";

export function generateId(length: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }

  return result;
}

export function getRoom(socket: Socket): string {
  const rooms = [];

  const values = socket.rooms.values();
  let value = values.next().value;
  value = values.next().value;
  while(value) {
    rooms.push(value);
  }
}
