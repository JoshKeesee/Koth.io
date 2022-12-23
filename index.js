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
  maxHttpBufferSize: 1e7
});

instrument(io, {
  auth: false,
  mode: "development",
});

const gameState = {
  players: {},
  leaderboard: {}
};
var defaults = {};
var currUserName = 0;
var playerNum = 0;
const port = process.env.PORT || 3000;

app.use(express.static(__dirname + "/public"));
app.use(favicon(__dirname + '/public/favicon.ico'));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  gameState.players[socket.id] = {
    name: null
  };

  socket.on("disconnect", () => {
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

    playerNum = Object.keys(gameState.leaderboard).length + 1

    gameState.players[socket.id] = {
      x: playerNum * 100,
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
      touching: false
    };

    gameState.leaderboard[socket.id] = 0;
  });

  socket.on("playerMovement", (data) => {
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
    player.knockback = data[1].padding;
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

    const g = 1000 - player.h;

    if (player.y >= g) {
      player.yVel = 0;
      player.xVel = 0;
      player.y = -500;
      player.x = player.num * 100;
      if (player.lt !== null) {
        gameState.leaderboard[player.lt] += gameState.players[player.lt].pps;
        gameState.leaderboard = Object.entries(gameState.leaderboard)
          .sort(([, a], [, b]) => a - b)
          .reverse()
          .reduce((r, [k, v]) => ({ ...r, [k]: v }), {});
        player.lt = null;
      }
    }

    collision(player, playerMovement.platforms);

    // for (let i = 0; i < playerMovement.platforms.length; i++) {
    //   var top = playerMovement.platforms[i].t;
    //   var bottom = playerMovement.platforms[i].b;
    //   var left = playerMovement.platforms[i].l;
    //   var right = playerMovement.platforms[i].r;
    //   var width = playerMovement.platforms[i].w;
    //   var height = playerMovement.platforms[i].h;
    //   var type = playerMovement.platforms[i].type;
    //   var playerId = playerMovement.platforms[i].playerId;

    //   if (player.x + player.w > left) {
    //     if (player.x + player.w < left + (width / 2) && player.y < bottom - (height / 2) && player.y > top - player.h + (height / 2)) {
    //       if (type === "player") {
    //         player.touching = true;
    //         if (Math.abs(player.xVel) > Math.abs(gameState.players[playerId].xVel)) {
    //           gameState.players[playerId].xVel = (player.xVel * player.pushForce) * gameState.players[playerId].knockback;
    //           player.xVel = 0 - (player.xVel * defaults.resistance);
    //           player.yVel = 0;
    //         } else {
    //           player.xVel = gameState.players[playerId].xVel * gameState.players[playerId].pushForce;
    //         }
    //         gameState.players[playerId].lt = player.id;
    //       } else {
    //         player.xVel = 0;
    //         player.yVel = 0;
    //       }
    //       player.x = left - player.w;
    //       player.jumps = 0;
    //     }
    //   }

    //   if (player.x < right) {
    //     if (player.x > right - (width / 2) && player.y < bottom - (height / 2) && player.y > top - player.h + (height / 2)) {
    //       if (type === "player") {
    //         player.touching = true;
    //         if (Math.abs(player.xVel) > Math.abs(gameState.players[playerId].xVel)) {
    //           gameState.players[playerId].xVel = (player.xVel * player.pushForce) * gameState.players[playerId].knockback;
    //           player.xVel = 0 - (player.xVel * defaults.resistance);
    //           player.yVel = 0;
    //         } else {
    //           player.xVel = gameState.players[playerId].xVel * gameState.players[playerId].pushForce;
    //         }
    //         gameState.players[playerId].lt = player.id;
    //       } else {
    //         player.xVel = 0;
    //         player.yVel = 0;
    //       }
    //       player.x = right;
    //       player.jumps = 0;
    //     }
    //   }

    //   if (player.y > top - player.h - 2) {
    //     if (player.x < right && player.y < top - player.h + (height / 2) - 2 && player.x + player.w > left) {
    //       if (type === "player") {
    //         player.touching = true;
    //         player.yVel = 0 - (player.yVel * 0.8);
    //         gameState.players[playerId].lt = player.id;
    //         if (playerMovement.u) {
    //           player.yVel -= defaults.jumpForce;
    //         }
    //       } else {
    //         player.yVel = 0;
    //       }
    //       player.y = top - player.h - 2;
    //       player.jumps = 0;
    //     }
    //   }

    //   if (player.y < bottom) {
    //     if (player.x < right && player.y > bottom - (height / 2) && player.x + player.w > left) {
    //       if (type === "player") {
    //         player.touching = true;
    //         gameState.players[playerId].yVel = (player.yVel * player.pushForce) * gameState.players[playerId].knockback;
    //         gameState.players[playerId].lt = player.id;
    //         player.yVel = 1;
    //       } else {
    //         player.yVel = 1;
    //       }
    //       player.y = bottom;
    //     }
    //   }
    // }

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
  });

  socket.on("chat message", (message) => {
    io.emit("newMessage", [gameState.players[socket.id].name, message]);
  });

  setInterval(() => {
    socket.emit("state", gameState);
  }, 1000 / 60);
});

function colliding(r1, r2) {
  return !(r1.x > r2.l + r2.w || r1.x + r1.w < r2.l || r1.y > r2.t + r2.h || r1.y + r1.h < r2.t);
}

function colR(r1, r2) {
  return (r1.x < r2.l + r2.w && r1.x > r2.l + r2.w - Math.abs(r1.xVel));
}

function colL(r1, r2) {
  return (r1.x + r1.w > r2.l && r1.x + r1.w < r2.l + Math.abs(r1.xVel));
}

function colB(r1, r2) {
  return (r1.y < r2.t + r2.h && r1.y > r2.t - Math.abs(r1.yVel));
}

function colT(r1, r2) {
  if (r1.yVel <= 1) {
    return (r1.y + r1.h > r2.t && r1.y + r1.h < r2.t + 5);
  } else {
    return (r1.y + r1.h > r2.t && r1.y + r1.h < r2.t + Math.abs(r1.yVel));
  }
}

function collision(player, platforms) {
  for (let i = 0; i < platforms.length; i++) {
    if (colliding(player, platforms[i])) {
      if (colB(player, platforms[i])) {
        player.y += Math.abs(player.yVel) + 1;
        player.yVel = 1;
      }

      if (colT(player, platforms[i])) {
        // player.y -= Math.abs(player.yVel);
        player.y = platforms[i].t - player.h;
        player.yVel = 0;
        player.jumps = 0;
      }

      if (colL(player, platforms[i])) {
        player.x -= Math.abs(player.xVel) + 1;
        player.xVel = 0;
      }

      if (colR(player, platforms[i])) {
        player.x += Math.abs(player.xVel) + 1;
        player.xVel = 0;
      }
    }
  }
}

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`)
});