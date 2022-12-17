import * as http from "http";
import express from 'express';

const app = express();
import { Server } from 'socket.io';
import { Choice, Game, PlayerStatus } from "./types";

const cors = require("cors");
const { generateId } = require("./helpers");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://192.168.0.38:3000",
    methods: ["GET", "POST"],
  }
});

const games: {
  [key: string]: Game
} = {};

// list of players' games
const playerGameId: {
  [key: string]: string
} = {};

io.on("connection", (socket) => {
  console.log(`User Connected ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`User disconnected ${socket.id}`);
    // broadcast to everyone in game room

    const gameId = playerGameId[socket.id];
    if (!games[gameId]) return;
    if (games[gameId].player1ID === socket.id) {
      games[gameId].player1ID = null;
      games[gameId].player1Name = null;
      games[gameId].player1Status = PlayerStatus.OutOfGame;
    } else if (games[gameId].player2ID === socket.id) {
      games[gameId].player2ID = null;
      games[gameId].player2Name = null;
      games[gameId].player2Status = PlayerStatus.OutOfGame;
    }

    console.log(`Player ${socket.id} disconnected`);

    io.to(gameId).emit("playerDisconnected");
  });
  socket.on('createGame', () => {
    let gameId: string;
    do {
      gameId = generateId(5);
    } while (gameId in games);
    games[gameId] = {
      player1Name: null,
      player2Name: null,
      player1ID: null,
      player2ID: null,
      player1Status: PlayerStatus.OutOfGame,
      player2Status: PlayerStatus.OutOfGame,
      player1Choice: null,
      player2Choice: null,
      player1Wins: 0,
      player2Wins: 0,
    };
    playerGameId[socket.id] = gameId;
    socket.emit("gameCreated", gameId);
  });

  socket.on('joinGame', ({ gameId, playerName }: { gameId: string, playerName: string }) => {
    if (!games[gameId]) {
      socket.emit("wrongGameId");
      return;
    }

    if (!games[gameId].player1ID && games[gameId].player2ID != socket.id) {
      games[gameId].player1ID = socket.id;
      games[gameId].player1Name = playerName;
      games[gameId].player1Status = PlayerStatus.Joined;
      socket.join(gameId);
      console.log(`Player ${socket.id} joined game ${gameId}`);
    } else if (!games[gameId].player2ID && games[gameId].player1ID != socket.id) {
      games[gameId].player2ID = socket.id;
      games[gameId].player2Name = playerName;
      games[gameId].player2Status = PlayerStatus.Joined;
      socket.join(gameId);
      console.log(`Player ${socket.id} joined game ${gameId}`);
    }
  });

  socket.on('madeChoice', (data: { gameId: string, choice: Choice }) => {
    if(!games[data.gameId]) {
      socket.emit("wrongGameId");
      return;
    }

    if (socket.id === games[data.gameId].player1ID) {
      games[data.gameId].player1Choice = data.choice;
    } else if (socket.id === games[data.gameId].player2ID) {
      games[data.gameId].player2Choice = data.choice;
    }

    console.log(games[data.gameId])
  });
});


server.listen(3001, () => {
  console.log("server is running")
});
