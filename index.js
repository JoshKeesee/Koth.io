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
  mode: "production",
});

const gameState = {
  players: {},
  leaderboard: {},
  weather: ""
};
var defaults = {};
var currUserName = 0;
var playerNum = 0;
const port = process.env.PORT || 3000;
var regen;
var myId;
var weather = ["sunny", "rainy"];

app.use(express.static(__dirname + "/public"));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  myId = socket.id;
  
  gameState.players[socket.id] = {
    damage: 0,
    name: null,
    lt: null,
  };

  regen = setInterval(() => {
    if (gameState.players[socket.id].damage > 0) {
      gameState.players[socket.id].damage -= gameState.players[socket.id].regen;
    }
  }, 1000);

  socket.on("disconnect", () => {
    if (myId === socket.id) {
      clearInterval(regen);
    }
    
    for (var i = 0; i < Object.keys(gameState.players).length; i++) {
      if (gameState.players[Object.keys(gameState.players)[i]].lt === socket.id) {
        gameState.players[Object.keys(gameState.players)[i]].lt = null;
      }
    }

    delete gameState.players[socket.id];
    delete gameState.leaderboard[socket.id];
  });

  socket.on("newPlayer", (name) => {
    if (name === "") {
      currUserName = "Player " + (Object.keys(gameState.leaderboard).length + 1);
    } else {
      currUserName = name;
    }

    playerNum = Object.keys(gameState.leaderboard).length + 1;

    var x;
    
    if (playerNum <= 5) {
      x = playerNum * 100;
    } else if (playerNum <= 10) {
      x = (playerNum * 100) + 100;
    } else {
      x = (playerNum * 100) + 300;
    }
    
    gameState.players[socket.id] = {
      damage: 0,
      x: x,
      y: 320,
      w: 70,
      h: 70,
      yVel: 0,
      xVel: 0,
      id: socket.id,
      name: currUserName,
      num: playerNum,
      lt: null,
      pps: 100,
      jumps: 0,
      jumping: false,
      speed: 0,
      pushForce: 2,
      knockback: 1,
      touching: false,
      color: "#0095DD",
    };

    gameState.leaderboard[socket.id] = 0;

    switchColor(gameState.players[socket.id]);
  });

  socket.on("playerMovement", (data) => {
    updatePlayer(data, socket);
  });

  socket.on("chat message", (message) => {
    io.emit("newMessage", [gameState.players[socket.id].name, message]);
  });

  setInterval(() => {
    socket.emit("state", gameState);
  }, 1000 / 70);
});

setInterval(updateWeather, 30000);

function updateWeather() {
  gameState.weather = weather[Math.floor(Math.random() * weather.length)];
  if (gameState.weather === "rainy") {
    io.emit("rain");
  } else {
    io.emit("no rain");
  }
}

function switchColor(player) {
  if (player.num === 1) {
    player.color = "#0095DD";
  } else if (player.num === 2) {
    player.color = "orange";
  } else if (player.num === 3) {
    player.color = "green";
  } else if (player.num === 4) {
    player.color = "indigo";
  } else if (player.num === 5) {
    player.color = "darkyellow";
  } else if (player.num === 6) {
    player.color = "blue";
  } else if (player.num === 7) {
    player.color = "purple";
  } else if (player.num === 8) {
    player.color = "gray";
  } else {
    player.color = "black";
  }
}

function respawn(player) {
  player.yVel = 0;
  player.xVel = 0;
  player.y = 320;
  if (player.num <= 5) {
    player.x = player.num * 100;
  } else if (player.num <= 10) {
    player.x = (player.num * 100) + 100;
  } else {
    player.x = (player.num * 100) + 300;
  }
  player.w = 100;
  player.h = 100;
  player.damage = 0;
  if (player.lt !== null) {
    if (gameState.players[player.lt].name !== "A Cheater Using Hacks") {
      gameState.leaderboard[player.lt] += gameState.players[player.lt].pps;
      gameState.leaderboard = Object.entries(gameState.leaderboard)
        .sort(([, a], [, b]) => a - b)
        .reverse()
        .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
      player.lt = null;
    }
  }
}

function colliding(r1, r2) {
  return !(r1.x > r2.l + r2.w || r1.x + r1.w < r2.l || r1.y > r2.t + r2.h || r1.y + r1.h < r2.t);
}

function colR(r1, r2) {
  if (r1.xVel >= -10 && r1.xVel <= 0) {
    return (r1.x < r2.l + r2.w && r1.x > r2.l + r2.w - 10);
  } else {
    return (r1.x < r2.l + r2.w && r1.x > r2.l + r2.w - Math.abs(r1.xVel));
  }
}

function colL(r1, r2) {
  if (r1.xVel <= 10 && r1.xVel >= 0) {
    return (r1.x + r1.w > r2.l && r1.x + r1.w < r2.l + 10);
  } else {
    return (r1.x + r1.w > r2.l && r1.x + r1.w < r2.l + Math.abs(r1.xVel));
  }
}

function colB(r1, r2) {
  if (r1.yVel >= -5 && r1.yVel <= 0) {
    return (r1.y < r2.t + r2.h && r1.y > r2.t + r2.h - 5);
  } else {
    return (r1.y < r2.t + r2.h && r1.y > r2.t + r2.h - Math.abs(r1.yVel));
  }
}

function colT(r1, r2) {
  if (r1.yVel <= 5 && r1.yVel >= 0) {
    return ((r1.y + r1.h > r2.t && r1.y + r1.h < r2.t + 5) || (r1.y + (r1.h / 1.5) > r2.t && r1.y + (r1.h / 1.5) < r2.t + 5));
  } else {
    return ((r1.y + r1.h > r2.t && r1.y + r1.h < r2.t + Math.abs(r1.yVel)) || (r1.y + (r1.h / 1.5) >= r2.t && r1.y + (r1.h / 1.5) < r2.t + Math.abs(r1.yVel)));
  }
}

function collision(player, platforms, playerMovement, socket) {
  for (let i = 0; i < platforms.length; i++) {
    var playerId = platforms[i].playerId;
    var type = platforms[i].type;
    if (colliding(player, platforms[i])) {
      if (colT(player, platforms[i])) {
        if (type === "player") {
          socket.emit("bounce");
          if (!player.jumping) {
            player.h = player.h - Math.abs(player.yVel);
          }
          player.y = platforms[i].t - player.h;
          player.touching = true;
          player.yVel = 0 - (player.yVel * defaults.resistance);
          gameState.players[playerId].lt = player.id;
          if (playerMovement.u) {
            player.yVel -= defaults.jumpForce;
          }
        } else if (type === "lava") {
          if (!player.jumping) {
            player.h = player.h - Math.abs(player.yVel);
          }
          player.y = platforms[i].t - player.h;
          player.yVel = 0 - (player.yVel * 0.8);
          player.damage += 30;
          player.color = "red";
            setTimeout(() => {
            switchColor(player);
          }, 100);
          if (player.damage < 100) {
            socket.emit("hit lava");
          }
        } else {
          if (player.yVel >= 20) {
            socket.emit("hit");
            player.damage += Math.ceil(player.yVel / 2);
            player.color = "red";
            setTimeout(() => {
              switchColor(player);
            }, 100);
          }
          if (!player.jumping) {
            player.h = player.h - Math.abs(player.yVel);
          }
          player.y = platforms[i].t - player.h - 0.2;
          player.yVel = 0;
        }  
        player.jumps = 0;
      }

      if (colL(player, platforms[i])) {
        if (type === "player") {
          socket.emit("bounce");
          player.touching = true;
          if (Math.abs(player.xVel) > Math.abs(gameState.players[playerId].xVel)) {
            gameState.players[playerId].xVel = (player.xVel * player.pushForce) * gameState.players[playerId].knockback;
            player.xVel = 0 - (player.xVel * defaults.resistance);
            gameState.players[playerId].damage += 10;
          } else {
            player.xVel = gameState.players[playerId].xVel * gameState.players[playerId].pushForce;
            player.damage += 10;
            player.color = "red";
            setTimeout(() => {
              switchColor(player);
            }, 100);
          }
          gameState.players[playerId].lt = player.id;
        } else if (type === "lava") {
          player.x = platforms[i].l - player.w;
          player.xVel = 0 - (player.xVel * 0.8);
          player.damage += 30;
          player.color = "red";
          setTimeout(() => {
            switchColor(player);
          }, 100);
          socket.emit("hit lava");
        } else {
          player.xVel = 0;
          player.x = platforms[i].l - player.w - 0.2;
        }
      }

      if (colR(player, platforms[i])) {
        if (type === "player") {
          socket.emit("bounce");
          player.touching = true;
          if (Math.abs(player.xVel) > Math.abs(gameState.players[playerId].xVel)) {
            gameState.players[playerId].xVel = (player.xVel * player.pushForce) * gameState.players[playerId].knockback;
            player.xVel = 0 - (player.xVel * defaults.resistance);
            gameState.players[playerId].damage += 10;
          } else {
            player.xVel = gameState.players[playerId].xVel * gameState.players[playerId].pushForce;
            player.damage += 10;
            player.color = "red";
            setTimeout(() => {
              switchColor(player);
            }, 100);
          }
          gameState.players[playerId].lt = player.id;
        } else if (type === "lava") {
          player.x = platforms[i].l + platforms[i].w;
          player.xVel = 0 - (player.xVel * 0.8);
          player.damage += 30;
          player.color = "red";
          setTimeout(() => {
            switchColor(player);
          }, 100);
          socket.emit("hit lava");
        } else {
          player.xVel = 0;
          player.x = platforms[i].l + platforms[i].w + 0.2;
        }
      }

      if (colB(player, platforms[i])) {
        if (type === "player") {
          socket.emit("bounce");
          player.touching = true;
          gameState.players[playerId].yVel = (player.yVel * player.pushForce) * gameState.players[playerId].knockback;
          gameState.players[playerId].lt = player.id;
          player.yVel = 1;
        } else if (type === "lava") {
          player.y = platforms[i].t + platforms[i].h;
          player.yVel = 0 - (player.yVel * 0.8);
          player.damage += 30;
          player.color = "red";
          setTimeout(() => {
            switchColor(player);
          }, 100);
          socket.emit("hit lava");
        } else {
          player.h = player.h - Math.abs(player.yVel);
          player.y = platforms[i].t + platforms[i].h + 0.2;
          player.yVel = 1;
        }
      }
    }
  }
}

function updatePlayer(data, socket) {
  var playerMovement = data[0];

  defaults = {
    gravity: 0.4,
    resistance: 0.9,
    speed: data[1].speed,
    maxJumps: data[1].jumps,
    jumpForce: 15
  };

  const player = gameState.players[socket.id];
  player.speed = data[2];
  player.pushForce = data[1].force;
  player.regen = data[1].regen;
  player.touching = false;

  if (playerMovement.l) {
    player.xVel -= defaults.speed;
  }

  if (playerMovement.r) {
    player.xVel += defaults.speed;
  }

  if (playerMovement.d) {
    if (!playerMovement.flying) {
      player.h += 0.2 * (35 - player.h);
      player.w += 0.2 * (90 - player.w);
      defaults.speed = player.speed + 0.1;
      defaults.gravity = 0.6;
    }
  } else {
    if (!playerMovement.flying) {
      player.h += 0.2 * (70 - player.h);
      player.w += 0.2 * (70 - player.w);
      defaults.speed = player.speed;
      defaults.gravity = 0.4;
    }
  }

  if (!playerMovement.u || player.yVel == 0) {
    player.jumping = false;
  }

  if (playerMovement.u && player.jumps < defaults.maxJumps && !player.jumping && !playerMovement.flying) {
    player.jumping = true;
    player.jumps++;
    player.yVel = -defaults.jumpForce;
  }

  if (!playerMovement.flying) {
    player.yVel += defaults.gravity;
  }

  if (playerMovement.flying && playerMovement.u) {
    player.yVel -= player.speed;
  }

  if (playerMovement.flying && playerMovement.d) {
    player.yVel += player.speed;
  }

  if (playerMovement.flying) {
    player.yVel *= defaults.resistance;
  }

  collision(player, playerMovement.platforms, playerMovement, socket);

  player.xVel *= defaults.resistance;
  player.y += player.yVel;
  player.x += player.xVel;

  var playerNums = [];

  for (var i = 0; i < Object.keys(gameState.players).length; i++) {
    playerNums[i] = gameState.players[Object.keys(gameState.players)[i]].num;
  }

  playerNums.sort();

  if (playerNum - 1 !== 0) {
    if (playerNums[0] === playerNum && playerNums[0] > 1) {
      playerNum--;
      player.num = playerNum;
    } else if (playerNums[playerNum - 2] < playerNum - 1) {
      playerNum--;
      player.num = playerNum;
    }
  }

  if (player.name === "A Cheater Using Hacks") {
    gameState.leaderboard[socket.id] = 0;
  }

  if (player.damage >= 100) {
    socket.emit("respawn");
    respawn(player);
  }
}

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});