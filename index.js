const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const gameState = {
  players: {},
  leaderboard: {}
};
var defaults = {};
var currUserNum = 0;
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  socket.on("disconnect", () => {
    delete gameState.players[socket.id];
    delete gameState.leaderboard[socket.id];
  });

  socket.on("newPlayer", () => {
    currUserNum = socket.adapter.sids.size;
    gameState.players[socket.id] = {
      x: currUserNum * 100,
      y: 320,
      width: 70,
      height: 70,
      yVel: 0,
      xVel: 0,
      id: socket.id,
      num: currUserNum,
      lastTouched: null
    };

    gameState.leaderboard[socket.id] = 0;
    
    defaults = {
      gravity: 0.2,
      resistance: 0.95,
      speed: 6,
      pushForce: 2
    };
  });
  
  socket.on("playerMovement", (playerMovement) => {
    const player = gameState.players[socket.id];
    if (playerMovement.left) {
      if (player.xVel > -defaults.speed) {
        player.xVel--;
      }
    }
    
    if (playerMovement.right) {
      if (player.xVel < defaults.speed) {
        player.xVel++;
      }
    }

    if (playerMovement.down) {
      player.height += 0.2 * (35 - player.height);
      player.width += 0.2 * (90 - player.width);
      defaults.speed = 15;
    } else {
      player.height += 0.2 * (70 - player.height);
      player.width += 0.2 * (70 - player.width);
      defaults.speed = 6;
    }

    const g = 1000 - player.height;

    if (player.y >= g) {
      player.yVel = 0;
      player.xVel = 0;
      player.y = -500;
      player.x = 570;
      if (player.lastTouched !== null) {
        socket.broadcast.emit("add score", player.lastTouched);
        player.lastTouched = null;
      }
    }

    for (let i = 0; i < playerMovement.platforms.length; i++) {
      var top = playerMovement.platforms[i].top;
      var bottom = playerMovement.platforms[i].bottom;
      var left = playerMovement.platforms[i].left;
      var right = playerMovement.platforms[i].right;
      var width = playerMovement.platforms[i].width;
      var height = playerMovement.platforms[i].height;
      var type = playerMovement.platforms[i].type;
      var playerId = playerMovement.platforms[i].playerId;

      if (player.x + player.width > left) {
        if (player.x + player.width < left + (width / 2) && player.y < bottom - (height / 2) && player.y > top - player.height + (height / 2)) {
          if (type === "player") {
            if (Math.abs(player.xVel) > Math.abs(gameState.players[playerId].xVel)) {
              gameState.players[playerId].xVel = (player.xVel * defaults.pushForce) * defaults.resistance;
              player.xVel = 0 - (player.xVel * 0.8);
            } else {
              player.xVel = (gameState.players[playerId].xVel * defaults.pushForce) * defaults.resistance;
            }
            gameState.players[playerId].lastTouched = player.id;
          } else {
            player.xVel = 0;
          }
          player.x = left - player.width;
        }
      }

      if (player.x < right) {
        if (player.x > right - (width / 2) && player.y < bottom - (height / 2) && player.y > top - player.height + (height / 2)) {
          if (type === "player") {
            if (Math.abs(player.xVel) > Math.abs(gameState.players[playerId].xVel)) {
              gameState.players[playerId].xVel = (player.xVel * defaults.pushForce) * defaults.resistance;
              player.xVel = 0 - (player.xVel * 0.8);
            } else {
              player.xVel = (gameState.players[playerId].xVel * defaults.pushForce) * defaults.resistance;
            }
            gameState.players[playerId].lastTouched = player.id;
          } else {
            player.xVel = 0;
          }
          player.x = right;
        }
      }

      if (player.y > top - player.height - 2) {
        if (player.x < right && player.y < top + (height / 2) && player.x + player.width > left) {
          if (type === "player") {
            player.yVel = 0 - (player.yVel * 0.8);
            gameState.players[playerId].lastTouched = player.id;
            if (playerMovement.up) {
              player.yVel -= 10;
            }
          } else {
            player.yVel = 0;
          }
          player.y = top - player.height - 2;
        }
      }

      if (player.y < bottom) {
        if (player.x < right && player.y > bottom - (height / 2) && player.x + player.width > left) {
          if (type === "player") {
            gameState.players[playerId].yVel = player.yVel * defaults.resistance * defaults.pushForce;
            gameState.players[playerId].lastTouched = player.id;
            player.yVel = 1;
          } else {
            player.yVel = 1;
          }
          player.y = bottom;
        }
      }
    }
    
    if (playerMovement.up && player.yVel == 0) {
      player.yVel -= 10;
    }

    player.yVel += defaults.gravity;
    player.xVel *= defaults.resistance;
    player.y += player.yVel;
    player.x += player.xVel;
  });

  socket.emit("id", socket.id);

  socket.on("chat message", (message) => {
    io.emit("newMessage", [gameState.players[socket.id].num, message]);
  });

  socket.on("update leaderboard", (player) => {
    gameState.leaderboard[player] += 1;
    gameState.leaderboard = Object.entries(gameState.leaderboard)
    .sort(([,a],[,b]) => a - b)
    .reverse()
    .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
  });

  setInterval(() => {
    socket.emit("state", gameState);
  }, 1000 / 60);
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});