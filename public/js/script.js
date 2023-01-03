const socket = io();
const canvas = document.getElementById("ctx");
const ctx = canvas.getContext("2d");
ctx.imageSmoothingEnabled = true;
var id;
var chatOpen = -1;
var gameStarted = false;
var defaults = {};
var speed = 0;
var devMode = false;
var connected = false;
var lastJumpVal;
var mouseDown = false;
var keyRight = false;
var keyLeft = false;
var keyUp = false;
var keyDown = false;
var gameState;
var stop = false;
const decimalPlaces = 1;
const updateEachSecond = 0.5;
const decimalPlacesRatio = Math.pow(10, decimalPlaces);
var timeMeasurements = [];
var fps = 0;
const dirt = new Image();
dirt.src = "/images/dirt.jpg";
var dirtPattern;
const hill = new Image();
hill.src = "/images/mountain.jpg";
var bg = new Image();
bg.src = "/images/cliff.png";
var bgcliff = new Image();
bgcliff.src = "/images/bgcliff.png";
const scrollSpeed = 9;

const playerMovement = {
  u: false,
  l: false,
  r: false,
  d: false,
  flying: false,
  cW: ctx.canvas.width,
  cH: ctx.canvas.height,
  platforms: []
};

const keyDownHandler = (e) => {
  if (e.key == "ArrowRight") {
    playerMovement.r = true;
    keyRight = true;
    mouseDown = false;
  } else if (e.key == "ArrowLeft") {
    playerMovement.l = true;
    keyLeft = true;
    mouseDown = false;
  } else if (e.key == "ArrowUp") {
    playerMovement.u = true;
    keyUp = true
    mouseDown = false;
  } else if (e.key == "ArrowDown") {
    playerMovement.d = true;
    keyDown = true;
    mouseDown = false;
  }
};

const keyUpHandler = (e) => {
  if (e.key == "ArrowRight") {
    playerMovement.r = false;
    keyRight = false;
  } else if (e.key == "ArrowLeft") {
    playerMovement.l = false;
    keyLeft = false;
  } else if (e.key == "ArrowUp") {
    playerMovement.u = false;
    keyUp = false;
  } else if (e.key == "ArrowDown") {
    playerMovement.d = false;
    keyDown = false;
  } else if (e.key == "Escape" && devMode) {
    if (playerMovement.flying === false) {
      playerMovement.flying = true;
    } else {
      playerMovement.flying = false;
    }
  }
};

const mouseMoveHandler = (e) => {
  if (mouseDown) {
    if (e.touches[0].clientX > ctx.canvas.width / 2 + 40) {
      playerMovement.r = true;
    } else {
      playerMovement.r = false;
    }
    
    if (e.touches[0].clientX < ctx.canvas.width / 2 - 40) {
      playerMovement.l = true;
    } else {
      playerMovement.l = false
    }
    
    if (e.touches[0].clientY < ctx.canvas.height / 2 - 40) {
      playerMovement.u = true;
    } else {
      playerMovement.u = false;
    }
    
    if (e.touches[0].clientY > ctx.canvas.height / 2 + 40) {
      playerMovement.d = true;
    } else {
      playerMovement.d = false;
    }
  } else if (!(keyRight && keyLeft && keyUp && keyDown)) {
    playerMovement.r = false;
    playerMovement.l = false;
    playerMovement.t = false;
    playerMovement.d = false;
  }
};

const drawPlayer = (player, leaderboard) => {
  if (player.num === 1) {
    color = "#0095DD";
  } else if (player.num === 2) {
    color = "red";
  } else if (player.num === 3) {
    color = "green";
  } else if (player.num === 4) {
    color = "indigo";
  } else if (player.num === 5) {
    color = "orange";
  } else if (player.num === 6) {
    color = "blue";
  } else if (player.num === 7) {
    color = "purple";
  } else if (player.num === 8) {
    color = "yellow";
  } else {
    color = "black";
  }
  
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.w, player.h, 15);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(player.x + (player.w / 5.5), player.y + (player.h / 5.5), player.w / 1.5, player.h / 1.5, 50);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect((player.x + (player.w / 2.9)) + player.xVel, (player.y + (player.h / 2.9)) + player.yVel, player.w / 3, player.h / 3, 50);
  ctx.fillStyle = "black";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect((player.x + (player.w / 1.9)) + player.xVel, (player.y + (player.h / 2.6)) + player.yVel, player.w / 10, player.h / 10, 50);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();

  if (Object.keys(leaderboard)[0] === player.id && leaderboard[Object.keys(leaderboard)[0]] > 0 && leaderboard[Object.keys(leaderboard)[0]] !== leaderboard[Object.keys(leaderboard)[1]]) {
    ctx.beginPath();
    ctx.moveTo(player.x + 1, player.y - 20);
    ctx.lineTo(player.x + 1, player.y);
    ctx.lineTo(player.x + 20, player.y);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(player.x + (player.w / 2) - 20, player.y);
    ctx.lineTo(player.x + (player.w / 2), player.y - 30);
    ctx.lineTo(player.x + (player.w / 2) + 20, player.y);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.moveTo(player.x + player.w - 1, player.y - 20);
    ctx.lineTo(player.x + player.w - 1, player.y);
    ctx.lineTo(player.x + player.w - 20, player.y);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(player.x - 4, player.y - 24, 8, 8, 8);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(player.x + (player.w / 2) - 6, player.y - 34, 12, 12, 12);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(player.x + player.w - 6, player.y - 24, 8, 8, 8);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(player.x - 1, player.y - 1, player.w + 2, player.h / 5, 4);
    ctx.fillStyle = tinycolor("yellow").darken(5);
    ctx.fill();
    ctx.closePath();

    if (player.name != null) {
      ctx.fillStyle = "rgba(0, 0, 150, " + (player.h + 30) / 100 + ")";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(player.name, player.x + (player.w / 2), player.y - 40);
    }
  } else if (player.name !== null) {
    ctx.fillStyle = "rgba(0, 0, 150, " + (player.h + 30) / 100 + ")";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(player.name, player.x + (player.w / 2), player.y - 10);
  }

  if (player.id !== id) {
    var left = player.x;
    var top = player.y;
    var width = player.w;
    var height = player.h;
    createObject(left, top, width, height, "player", null, player.id);
  } else {
    if (player.jumping && lastJumpVal !== player.jumping) {
      lastJumpVal = player.jumping;
      var jump = new Audio("/music/Jump.wav");
      jump.play();
    } else {
      lastJumpVal = player.jumping;
    }

    if (player.touching) {
      var bounce = new Audio("/music/Bounce.mp3");
      bounce.play();
    }
  }
};

socket.on("connect", () => {
  id = socket.id;
  connected = true;
  document.getElementById("play").onclick = () => {
    go();
  };
  document.getElementById("play").classList.remove("cursor-not-allowed");
      document.getElementById("disconnected").classList.add("hidden");
});

socket.on("disconnect", () => {
  document.getElementById("menu").classList.remove("hidden");
  document.getElementById("disconnected").classList.remove("hidden");
  connected = false;
  document.getElementById("play").onclick = () => {};
  document.getElementById("play").classList.add("cursor-not-allowed");
  document.getElementById("gameMusic").pause();
  document.getElementById("gameMusic").currentTime = 0;
  gameStarted = false;

  defaults.speed = 1;
  defaults.jumps = 1;
  defaults.padding = 1;
  defaults.force = 2;

  devMode = false;
});

function sendData() {
  socket.emit("playerMovement", [playerMovement, defaults, speed]);
}

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);
document.addEventListener("touchmove", mouseMoveHandler, false);
document.addEventListener("touchstart", () => {
  mouseDown = true;
}, false);
document.addEventListener("touchend", () => {
  mouseDown = false;
}, false);

window.history.pushState(null, null, window.location.href);
window.onpopstate = function () {
    window.history.go(1);
};

function createObject(l, t, w, h, type, color = "#000cfa", playerId) {
  var length = playerMovement.platforms.length;
  playerMovement.platforms[length] = {};
  playerMovement.platforms[length].t = t;
  playerMovement.platforms[length].l = l;
  playerMovement.platforms[length].w = w;
  playerMovement.platforms[length].h = h;
  playerMovement.platforms[length].type = type;
  playerMovement.platforms[length].r = l + w;
  playerMovement.platforms[length].b = t + h;
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
  } else if (type === "ground") {
    for (var i = 4; i > 0; i--) {
      ctx.beginPath();
      ctx.roundRect(l + i, t - i, w, h, 4);
      ctx.fillStyle = tinycolor("#542a01").toString();
      ctx.fill();
      ctx.closePath();
    }

    for (var i = 4; i > 0; i--) {
      ctx.beginPath();
      ctx.roundRect(l + i, t - i, w, 40, 4);
      ctx.fillStyle = tinycolor("green").darken(5).toString();
      ctx.fill();
      ctx.closePath();
    }

    ctx.beginPath();
    ctx.roundRect(l, t, w, h, 4);
    ctx.fillStyle = dirtPattern;
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(l, t, w, 40, 4);
    ctx.fillStyle = "green";
    ctx.fill();
    ctx.closePath();
  }
}

function createBgRect(x, y, w, h, color = "blue") {
  ctx.beginPath();
  ctx.rect(x, y, w, h);
  ctx.fillStyle = color;
  ctx.fill();
  ctx.closePath();
}

function createFlower(x, y) {
  ctx.beginPath();
  ctx.moveTo(x + 7.5, y);
  ctx.lineTo(x + 7.5, y + 50);
  ctx.lineWidth = 5;
  ctx.strokeStyle = "green";
  ctx.stroke();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(x, y - 8, 15, 15, 15);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.roundRect(x + 8, y, 15, 15, 15);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(x, y + 8, 15, 15, 15);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(x - 8, y, 15, 15, 15);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(x, y, 15, 15, 15);
  ctx.fillStyle = tinycolor("yellow").darken(15).toString();
  ctx.fill();
  ctx.closePath();
}

function createBush(x, y) {
  var grd = ctx.createLinearGradient(x, y + 50, x, y);
  grd.addColorStop(0, "green");
  grd.addColorStop(1, "rgb(0, 200, 0)");

  ctx.beginPath();
  ctx.roundRect(x, y, 50, 50, 50);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(x + 40, y - 12, 50, 50, 50);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.roundRect(x + 80, y, 50, 50, 50);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();

  ctx.beginPath();
  ctx.rect(x + 25, y + 10, 80, 40);
  ctx.fillStyle = grd;
  ctx.fill();
  ctx.closePath();
}

function createCloud(x, y, o = 1.0) {
  ctx.globalAlpha = o;
  ctx.beginPath();
  ctx.roundRect(x, y, 300, 40, 100);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1.0;
}

function drawMap() {
  createObject(-1000, 500, 600, 1000, "ground");
  createObject(100, 500, 400, 1000, "ground");
  createObject(700, 500, 400, 1000, "ground");
  createObject(1400, 500, 700, 1000, "ground");
  createObject(-850, 100, 120, 50, "platform", "red");
  createObject(-500, -200, 120, 50, "platform", "yellow");
  createObject(-850, -400, 120, 50, "platform", "blue");
  createObject(-2500, -400, 300, 1400, "ground");
  createObject(-2500, -500, 1300, 200, "ground");
  createObject(-2200, 10, 1000, 990, "ground");
  createObject(-2000, -700, 120, 50, "platform", "yellow");
  createObject(-1600, -700, 120, 50, "platform", "red");
  createObject(-220, 350, 120, 50, "platform", "green");
  createObject(200, 250, 100, 50, "platform", "yellow");
  createObject(550, 250, 100, 50, "platform", "green");
  createObject(900, 250, 100, 50, "platform", "red");
  createObject(750, 0, 100, 50, "platform", "yellow");
  createObject(350, 0, 100, 50, "platform", "red");
  createObject(550, -250, 100, 50, "platform", "green");
  createObject(2200, 250, 200, 50, "platform", "indigo");
  createObject(1800, 0, 200, 50, "platform", "rgba(0, 0, 0, 0)");
  createObject(2200, -250, 200, 50, "platform", "rgba(0, 0, 0, 0)");
  createObject(1800, -500, 200, 50, "platform", "rgba(0, 0, 0, 0)");
  createObject(2200, -750, 200, 50, "platform", "rgba(0, 0, 0, 0)");
  createObject(1800, -1000, 200, 50, "platform", "rgba(0, 0, 0, 0)");
  createObject(2200, -1250, 200, 50, "platform", "rgba(0, 0, 0, 0)");
  createObject(2500, -1400, 1000, 200, "ground");
}

function drawScenery(x, y) {
  ctx.globalCompositeOperation = "destination-over";
  createBgRect(-2200, -400, 1000, 500, "#8B4000");
  createCloud(600 + (x / 1.15), -230 + (y / 1.15), 0.9);
  createCloud(-600 + (x / 1.2), -200 + (y / 1.2), 0.8);
  createCloud(-800 + (x / 1.08), -200 + (y / 1.08), 0.7);
  createCloud(-300 + (x / 1.05), -200 + (y / 1.05), 0.9);
  createCloud(0 + (x / 1.1), -200 + (y / 1.1), 0.8);
  createCloud(300 + (x / 1.08), -250 + (y / 1.08), 0.9);
  createCloud(800 + (x / 1.1), -270 + (y / 1.1));
  ctx.globalCompositeOperation = "source-over";
  createBush(-2450, -550);
  createBush(-2100, -550);
  createBush(-1700, -550);
  createBush(-1400, -550);
  createBush(-900, 450);
  createBush(250, 450);
  createBush(725, 450);
  createBush(1600, 450);
  createBush(1950, 450);
  createFlower(200, 450);
}

function go() {
  var start = new Audio("/music/start.mp3");
  start.play();
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("disconnected").classList.add("hidden");
  var name = document.getElementById("name").value;
  document.getElementById("gameMusic").play();
  gameStarted = true;

  defaults.speed = 1;
  defaults.jumps = 1;
  defaults.padding = 1;
  defaults.force = 2;

  if (document.getElementById("speed").classList.contains("-translate-y-2")) {
    defaults.speed = 1.5;
  } else if (document.getElementById("jumps").classList.contains("-translate-y-2")) {
    defaults.jumps = 2;
  } else if (document.getElementById("padding").classList.contains("-translate-y-2")) {
    defaults.padding = 0.7;
  } else if (document.getElementById("force").classList.contains("-translate-y-2")) {
    defaults.force = 4;
  }

  speed = defaults.speed;

  if (window.btoa(name) === "c2xhcGZpc2g=") {
    devMode = true;
    name = "A Cheater Using Hacks";
  } else if (window.btoa(name) === "aW5maW5qdW1wcw==") {
    defaults.jumps = 1e100;
    name = "A Cheater Using Hacks";
  }
  
  socket.emit("newPlayer", name);
}

socket.on("state", (state) => {
  gameState = state;

  timeMeasurements.push(performance.now());

  const msPassed = timeMeasurements[timeMeasurements.length - 1] - timeMeasurements[0];

  if (msPassed >= updateEachSecond * 1000) {
    fps = Math.round(timeMeasurements.length / msPassed * 1000 * decimalPlacesRatio) / decimalPlacesRatio;
    timeMeasurements = [];
  }
});

document.getElementById("name").addEventListener("keydown", (e) => {
  if (e.key == "Enter" && connected) {
    go();
  }
  e.preventDefault;
});

socket.on("add score", (player) => {
  socket.emit("update leaderboard", player);
});

function choose(powerup) {
  document.getElementById("speed").classList.remove("-translate-y-2");
  document.getElementById("jumps").classList.remove("-translate-y-2");
  document.getElementById("padding").classList.remove("-translate-y-2");
  document.getElementById("force").classList.remove("-translate-y-2");
  document.getElementById(powerup).classList.add("-translate-y-2");
  var click = new Audio("/music/click.mp3");
  click.play();
}

sendData();
setTimeout(() => {
  dirtPattern = ctx.createPattern(dirt, "repeat");
  animate();
}, 500);

function animate() {
  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  playerMovement.cW = ctx.canvas.width;
  playerMovement.cH = ctx.canvas.height;
  playerMovement.platforms = [];

  if (gameStarted && connected) {
    ctx.save();
    var player = gameState.players[id];
    ctx.translate(-1 * (player.x - ctx.canvas.width / 2) - player.w / 2, -1 * (player.y - ctx.canvas.height / 2) - player.h / 2);
    drawMap();
    drawPlayer(player, gameState.leaderboard);
  } else {
    ctx.save();
    ctx.scale(0.8, 0.8);
    ctx.translate(-1 * (600 - ctx.canvas.width / 1.6), -1 * (300 - ctx.canvas.height / 1.6));
    drawMap();
  }

  if (gameState !== 0) {
    for (var i = 0; i < Object.keys(gameState.players).length; i++) {
      if (gameState.players[Object.keys(gameState.players)[i]].id !== id && gameState.players[Object.keys(gameState.players)[i]].name !== null) {
        drawPlayer(gameState.players[Object.keys(gameState.players)[i]], gameState.leaderboard);
      }
    }
  }
      
  if (Object.keys(gameState.players[id]).length !== 0 && gameState.players[id].id === id && connected) {
    drawScenery(gameState.players[id].x, gameState.players[id].y);
  } else {
    drawScenery(canvas.width / 2, canvas.height / 2);
  }

  ctx.restore();
  ctx.globalCompositeOperation = "destination-over";

  var x = gameState.players[id].x;
  var y = gameState.players[id].y;

  var ratio = canvas.width / canvas.height;
  bg.width = ratio * canvas.height;
  bg.height = canvas.height;

  bgcliff.width = ratio * canvas.height;
  bgcliff.height = canvas.height;

  for (var i = 0; i < 7; i++) {
    ctx.drawImage(bg, -(x + (bg.width * 7.5 * (i - 3))) / scrollSpeed, (-(y) / scrollSpeed) + 200, bg.width, bg.height);
  }

  ctx.globalAlpha = 0.7;
  for (var i = 0; i < 7; i++) {
    ctx.drawImage(bgcliff, (-(x + (bgcliff.width * 17 * (i - 3))) / (scrollSpeed * 2)) + 200, (-(y) / (scrollSpeed * 2)) + 100, bgcliff.width, bgcliff.height);
  }
  ctx.globalAlpha = 1.0;

  ctx.beginPath();
  ctx.roundRect(-100, -100, 300, 300, 500);
  ctx.fillStyle = "yellow";
  ctx.fill();
  ctx.closePath();
  
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "skyblue";
  ctx.fill();
  ctx.closePath();
  
  for (var i = 0; i < 3; i++) {
    document.getElementById("name" + (i + 1)).innerHTML = "";
  }
  
  for (var i = 0; i < Object.keys(gameState.leaderboard).length && i < 3; i++) {
    document.getElementById("name" + (i + 1)).innerHTML = i + 1 + ") " + gameState.players[Object.keys(gameState.leaderboard)[i]].name + "<br>" +  gameState.leaderboard[Object.keys(gameState.leaderboard)[i]];
  }

  if (Object.keys(gameState.players[id]).length !== 0 && gameState.players[id].id === id) { 
    document.getElementById("currName").innerHTML = "You) " + gameState.leaderboard[id];
  } else {
    document.getElementById("currName").innerHTML = "";
  }

  document.getElementById("fps").innerText = fps;

  setTimeout(sendData, 0);
}