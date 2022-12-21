

const express = require("express");
const app = express();
const favicon = require('serve-favicon')
const { createServer } = require("http");
const { Server } = require("socket.io");
const { instrument } = require("@socket.io/admin-ui");
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ["https://admin.socket.io"],
    credentials: true
  },
  maxHttpBufferSize: 1e6
});

instrument(io, {
  auth: false,
  mode: "development",
});

const gameState = {
  players: {},
  leaderboard: {}