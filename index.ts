import * as http from "http";
import express from 'express';

const app = express();
import { Server } from 'socket.io';
import { Choice, Game, Outcome } from "./types";
import { getWinnerId } from "./helpers";

const cors = require("cors");
const { generateId } = require("./helpers");

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "http://192.168.88.120:3000",
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
      player1Choice: null,
      player2Choice: null,
      player1Score: 0,
      player2Score: 0,
    };
    socket.emit("gameCreated", gameId);
  });

  socket.on('joinGame', ({ gameId, playerName }: { gameId: string, playerName: string }) => {
    console.log(`${socket.id} joined game`);
    if (!games[gameId]) {
      socket.emit("wrongGameId");
      return;
    }

    if (!games[gameId].player1ID && games[gameId].player2ID !== socket.id) {
      games[gameId].player1ID = socket.id;
      games[gameId].player1Name = playerName;
      playerGameId[socket.id] = gameId;

      if (games[gameId].player2ID) {
        socket.to(games[gameId].player2ID).emit('playerJoined', playerName);
        socket.emit('playerJoined', games[gameId].player2Name);
      }
    } else if (!games[gameId].player2ID && games[gameId].player1ID !== socket.id) {
      games[gameId].player2ID = socket.id;
      games[gameId].player2Name = playerName;
      playerGameId[socket.id] = gameId;

      if (games[gameId].player1ID) {
        socket.to(games[gameId].player1ID).emit('playerJoined', playerName);
        socket.emit('playerJoined', games[gameId].player1Name);
      }
    } else {
      // If Player is trying to connect to full game
      socket.emit("gameIsFull");
    }
  });

  socket.on('madeChoice', ({ gameId, choice }: { gameId: string, choice: Choice }) => {
    if(!games[gameId]) {
      socket.emit("wrongGameId");
      return;
    }

    if (socket.id === games[gameId].player1ID) {
      games[gameId].player1Choice = choice;
      if (!games[gameId].player2Choice) {
        socket.to(games[gameId].player2ID).emit('opponentMadeChoice');
      }
    } else if (socket.id === games[gameId].player2ID) {
      games[gameId].player2Choice = choice;
      if (!games[gameId].player1Choice) {
        socket.to(games[gameId].player1ID).emit('opponentMadeChoice');
      }
    }

    if (games[gameId].player1Choice && games[gameId].player2Choice) {
      // select winner
      const winner = getWinnerId(games[gameId].player1Choice, games[gameId].player2Choice);

      // emit game result
      let outcome1 = Outcome.Draw;
      let outcome2 = Outcome.Draw;
      if (winner === 1) {
        outcome1 = Outcome.Win;
        outcome2 = Outcome.Loss;
        games[gameId].player1Score++;
      } else if (winner === 2) {
        outcome1 = Outcome.Loss;
        outcome2 = Outcome.Win;
        games[gameId].player2Score++;
      }

      const player1Data = {
        outcome: outcome1,
        playerScore: games[gameId].player1Score,
        opponentScore: games[gameId].player2Score,
        yourChoice: games[gameId].player1Choice,
        opponentChoice: games[gameId].player2Choice,
      };
      const player2Data = {
        outcome: outcome2,
        playerScore: games[gameId].player2Score,
        opponentScore: games[gameId].player1Score,
        yourChoice: games[gameId].player2Choice,
        opponentChoice: games[gameId].player1Choice,
      };

      if (socket.id === games[gameId].player1ID) {
        socket.emit('gameResult', player1Data);
        socket.to(games[gameId].player2ID).emit('gameResult', player2Data);
      } else {
        socket.to(games[gameId].player1ID).emit('gameResult', player1Data);
        socket.emit('gameResult', player2Data);
      }

      games[gameId].player1Choice = null;
      games[gameId].player2Choice = null;
    }
  });

  socket.on('disconnect', () => {
    console.log(`${socket.id} disconnected`);

    const gameId = playerGameId[socket.id];
    if (!gameId || !games[gameId]) return;
    const game = games[gameId];
    if (game.player1ID === socket.id) {
      game.player1ID = null;
      game.player1Name = null;
      if (game.player2ID) {
        socket.to(game.player2ID).emit('opponentDisconnected');
      }
    } else if (game.player2ID === socket.id) {
      game.player2ID = null;
      game.player2Name = null;
      if (game.player1ID) {
        socket.to(game.player1ID).emit('opponentDisconnected');
      }
    }

    game.player1Score = 0;
    game.player2Score = 0;
    game.player1Choice = null;
    game.player2Choice = null;

    delete playerGameId[socket.id];
  });
});


server.listen(3001, () => {
  console.log("server is running")
});
