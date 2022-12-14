const socket = io();
const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");
var id;
var chatOpen = -1;
var leaderboard = [];

const playerMovement = {
  up: false,
  left: false,
  right: false,
  down: false,
  ctxWidth: ctx.canvas.width,
  ctxHeight: ctx.canvas.height,
  platforms: []
};

const keyDownHandler = (e) => {
  if (e.keyCode == 39) {
   playerMovement.right = true;
  } else if (e.keyCode == 37) {
    playerMovement.left = true;
  } else if (e.keyCode == 38) {
    playerMovement.up = true;
  } else if (e.keyCode == 40) {
    playerMovement.down = true;
  }
};

const keyUpHandler = (e) => {
  if (e.keyCode == 39) {
    playerMovement.right = false;
  } else if (e.keyCode == 37) {
    playerMovement.left = false;
  } else if (e.keyCode == 38) {
    playerMovement.up = false;
  } else if (e.keyCode == 40) {
    playerMovement.down = false;
  }
};

const drawPlayer = (player) => {
  if (player.id === id) {
    ctx.save();
    ctx.translate(-1 * (player.x - ctx.canvas.width / 2) - player.width / 2, -1 * (player.y - ctx.canvas.height / 2) - player.height / 2);
    drawMap();
  }

  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.width, player.height, 15);
  if (player.num === 1) {
    ctx.fillStyle = "#0095DD";
  } else if (player.num === 2) {
    ctx.fillStyle = "red";
  } else if (player.num === 3) {
    ctx.fillStyle = "green";
  } else if (player.num === 4) {
    ctx.fillStyle = "indigo";
  } else if (player.num === 5) {
    ctx.fillStyle = "orange";
  } else if (player.num === 6) {
    ctx.fillStyle = "blue";
  } else if (player.num === 7) {
    ctx.fillStyle = "purple";
  } else if (player.num === 8) {
    ctx.fillStyle = "yellow";
  } else {
    ctx.fillStyle = "black";
  }
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(player.x + (player.width / 5.5), player.y + (player.height / 5.5), player.width / 1.5, player.height / 1.5, 50);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect((player.x + (player.width / 2.9)) + player.xVel, (player.y + (player.height / 2.9)) + player.yVel, player.width / 3, player.height / 3, 50);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect((player.x + (player.width / 1.9)) + player.xVel, (player.y + (player.height / 2.6)) + player.yVel, player.width / 10, player.height / 10, 50);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  ctx.fillStyle = "rgba(255, 255, 255, " + (player.height + 30) / 100 + ")";
  ctx.font = "bold 30px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Player " + player.num, player.x + (player.width / 2), player.y - 10);

  if (player.id !== id) {
    var left = player.x;
    var top = player.y;
    var width = player.width;
    var height = player.height;
    createObject(left, top, width, height, "player", null , player.id);
  }
};

socket.emit("newPlayer");
socket.on("id", (socketId) => {
  id = socketId;
});

function movePlayer() {
  socket.emit("playerMovement", playerMovement);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

function createObject(l, t, w, h, type, color = "#000cfa", playerId) {
  var length = playerMovement.platforms.length;
  playerMovement.platforms[length] = {};
  playerMovement.platforms[length].top = t;
  playerMovement.platforms[length].left = l;
  playerMovement.platforms[length].width = w;
  playerMovement.platforms[length].height = h;
  playerMovement.platforms[length].type = type;
  playerMovement.platforms[length].right = l + w;
  playerMovement.platforms[length].bottom = t + h;
  playerMovement.platforms[length].playerId = playerId;

  if (type === "platform") {
    for (var i = 4; i > 0; i--) {
      ctx.beginPath();
      ctx.roundRect(l + i, t - i, w, h, 4);
      ctx.fillStyle = tinycolor(color).darken(15).toString();
      ctx.fill();
      ctx.closePath();
    }
    
    ctx.beginPath();
    ctx.roundRect(l, t, w, h, 4);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();
  }
}

function createBush(x, y) {
  var grd = ctx.createLinearGradient(x, y + 50, x, y);
  grd.addColorStop(0, "green");
  grd.addColorStop(1, "rgb(0, 200, 0)");
  
  ctx.beginPath();
  ctx.roundRect(x, y - 1, 50, 50, 50);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(x + 40, y - 12 - 1, 50, 50, 50);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(x + 80, y - 1, 50, 50, 50);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.rect(x + 25, y + 10 - 1, 80, 40);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();
}

function createCloud(x, y) {
  ctx.beginPath();
  ctx.roundRect(x, y, 100, 100, 100);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(x + 80, y - 20, 100, 100, 100);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(x + 160, y, 100, 100, 100);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.rect(x + 45, y + 10, 160, 90);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
}

function drawMap() {
  createObject(100, 500, 1000, 200, "platform", "#000cfa");
  createObject(200, 250, 100, 50, "platform", "yellow");
  createObject(550, 250, 100, 50, "platform", "green");
  createObject(900, 250, 100, 50, "platform", "red");
  createObject(750, 0, 100, 50, "platform", "yellow");
  createObject(350, 0, 100, 50, "platform", "red");
  createObject(550, -250, 100, 50, "platform", "green");
}

function drawScenery(x, y) {
  ctx.globalCompositeOperation = "destination-over";
  createCloud(-300 + (x / 1.05), -200 + (y / 1.05));
  createCloud(0 + (x / 1.1), -200 + (y / 1.1));
  createCloud(-600 + (x / 1.2), -200 + (y / 1.2));
  createCloud(300 + (x / 1.08), -250 + (y / 1.08));
  createCloud(300 + (x / 1.08), -250 + (y / 1.08));
  createCloud(600 + (x / 1.15), -230 + (y / 1.15));
  ctx.beginPath();
  ctx.roundRect(-800 + (x / 1.01), -400 + (y / 1.01), 300, 300, 500);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
  ctx.globalCompositeOperation = "source-over";
  createBush(250, 450);
  createBush(725, 450);
}

socket.on("state", (gameState) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  playerMovement.ctxWidth = ctx.canvas.width;
  playerMovement.ctxHeight = ctx.canvas.height;
  playerMovement.platforms = [];
  
  drawPlayer(gameState.players[id]);
  
  for (let i = 0; i < Object.keys(gameState.players).length; i++) {
    if (gameState.players[Object.keys(gameState.players)[i]].id !== id) {
        drawPlayer(gameState.players[Object.keys(gameState.players)[i]]);
    }
  }

  drawScenery(gameState.players[id].x, gameState.players[id].y);

  ctx.restore();
  ctx.beginPath();
  ctx.globalCompositeOperation = "destination-over";
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "skyblue";
  ctx.fill();
  ctx.closePath();
  
  for (var i = 0; i < 3; i++) {
    document.getElementById("num" + (i + 1)).innerHTML = "";
  }
  
  for (var i = 0; i < Object.keys(gameState.leaderboard).length && i < 3; i++) {
    document.getElementById("num" + (i + 1)).innerHTML = i + 1 + ") Player " + gameState.players[Object.keys(gameState.leaderboard)[i]].num + "<br>" +  gameState.leaderboard[Object.keys(gameState.leaderboard)[i]];
  }

  document.getElementById("currNum").innerHTML = "You) " + gameState.leaderboard[id];

  setTimeout(movePlayer, 0);
});

function toggleChat() {
  document.getElementById("chatWindow").classList.toggle("-left-full");
  document.getElementById("notification").classList.add("hidden");
  chatOpen = chatOpen * -1;
}

function disableChat() {
  document.getElementById("chatWindow").classList.add("-left-full");
  document.getElementById("notification").classList.add("hidden");
  chatOpen = -1;
}

document.getElementById("input").addEventListener("keydown", (e) => {
  if (e.keyCode == 13) {
    socket.emit("chat message", document.getElementById("input").value);
    document.getElementById("input").value = "";
  }
  e.preventDefault;
});

socket.on("newMessage", (message) => {
  var div = document.createElement("div");
  div.innerHTML = "<div class='font-bold'>Player " + message[0] + "</div><div>" + message[1] + "</div><hr class='my-4 h-px border-none bg-gray-300'>";
  div.classList = "break-words w-54";
  document.getElementById("messages").appendChild(div);
  if (chatOpen < 0) {
    document.getElementById("notification").classList.remove("hidden");
  }
  document.getElementById("messages").scrollTop = document.getElementById("messages").scrollHeight;
});

socket.on("add score", (player) => {
  socket.emit("update leaderboard", player);
});

socket.on("player disconnected", (count) => {
  socket.emit("player disconnected", count);
});