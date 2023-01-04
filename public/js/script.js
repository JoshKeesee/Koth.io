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
const lava = new Image();
lava.src = "/images/lava.jpeg";
var lavaPattern;
const hill = new Image();
hill.src = "/images/mountain.jpg";
const bg = new Image();
bg.src = "/images/cliff.png";
const bgcliff = new Image();
bgcliff.src = "/images/bgcliff.png";
const bgmountain = new Image();
bgmountain.src = "/images/bgmountain.png";
const scrollSpeed = 9;
const clouds = [];
const raindrops = [];
var lastWeather = "sunny";
var darkness = 0;
document.getElementById("name").value = localStorage.getItem("name") || "";

const playerMovement = {
  u: false,
  l: false,
  r: false,
  d: false,
  flying: false,
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
  ctx.beginPath();
  ctx.roundRect(player.x, player.y, player.w, player.h, 15);
  ctx.fillStyle = player.color;
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

    if (player.name !== null) {
      ctx.fillStyle = "rgba(0, 0, 150, " + (player.h + 30) / 100 + ")";
      ctx.font = "bold 30px Arial";
      ctx.textAlign = "center";
      ctx.fillText(player.name, player.x + (player.w / 2), player.y - 60);

      ctx.beginPath();
      ctx.roundRect(player.x + (player.w / 2) - 50, player.y - 50, 100, 10, 10);
      ctx.fillStyle = "red";
      ctx.fill();
      ctx.closePath();
  
      ctx.beginPath();
      ctx.roundRect(player.x + (player.w / 2) - 50, player.y - 50.3, 100 - player.damage, 10.6, 10);
      ctx.fillStyle = "green";
      ctx.fill();
      ctx.closePath();

      ctx.beginPath();
      ctx.roundRect(player.x + (player.w / 2) - 50, player.y - 50, 100, 10, 10);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "white";
      ctx.stroke();
      ctx.closePath();
    }
  } else if (player.name !== null) {
    ctx.fillStyle = "rgba(0, 0, 150, " + (player.h + 30) / 100 + ")";
    ctx.font = "bold 30px Arial";
    ctx.textAlign = "center";
    ctx.fillText(player.name, player.x + (player.w / 2), player.y - 25);

    ctx.beginPath();
    ctx.roundRect(player.x + (player.w / 2) - 50, player.y - 15, 100, 10, 10);
    ctx.fillStyle = "red";
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(player.x + (player.w / 2) - 50, player.y - 15.3, 100 - player.damage, 10.6, 10);
    ctx.fillStyle = tinycolor("green").brighten(15).toString();
    ctx.fill();
    ctx.closePath();

    ctx.beginPath();
    ctx.roundRect(player.x + (player.w / 2) - 50, player.y - 15, 100, 10, 10);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();
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
      ctx.fillStyle = tinycolor("#C4A484").darken(5).toString();
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
  } else if (type === "lava") {
    ctx.beginPath();
    ctx.rect(l, t, w, h);
    ctx.fillStyle = lavaPattern;
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 0.99;
    for (var i = 4; i > 0; i--) {
      ctx.beginPath();
      ctx.roundRect(l + i, t - i, w, 40, 4);
      ctx.fillStyle = tinycolor("orange").darken(15).toString();
      ctx.fill();
      ctx.closePath();
    }
    ctx.beginPath();
    ctx.roundRect(l, t, w, 40, 4);
    ctx.fillStyle = "orange";
    ctx.fill();
    ctx.closePath();
    ctx.globalAlpha = 1.0;
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

function createCloud(cloud) {
  ctx.globalAlpha = cloud.speed + 0.1;
  ctx.beginPath();
  ctx.roundRect(cloud.x - (gameState.players[id].x * cloud.speed) / 2, cloud.y - (gameState.players[id].y * cloud.speed) / 2, 300, cloud.speed * 50, 100);
  ctx.fillStyle = "white";
  ctx.fill();
  ctx.closePath();
  ctx.globalAlpha = 1.0;
  cloud.x += cloud.speed;
  if (cloud.x - (gameState.players[id].x * cloud.speed) / 2 > canvas.width) cloud.x = gameState.players[id].x - 1000;
}

function createRaindrop(raindrop) {
  ctx.beginPath();
  ctx.moveTo(raindrop.x, raindrop.y);
  ctx.lineTo(raindrop.x + 3, raindrop.y + raindrop.speed);
  ctx.strokeStyle = "blue";
  ctx.lineWidth = raindrop.speed / 10;
  ctx.stroke();
  ctx.closePath();
  raindrop.x += 3;
  raindrop.y += raindrop.speed;
  if (raindrop.y >= canvas.height) {
    raindrop.y = -10;
    raindrop.x = Math.random() * canvas.width;
  }
}

function drawMap() {
  createObject(-1000, 500, 600, 1000, "ground");
  createObject(100, 500, 400, 1000, "ground");
  createObject(700, 500, 400, 1000, "ground");
  createObject(1400, 500, 700, 1000, "ground");
  createObject(-850, 150, 120, 50, "platform", "red");
  createObject(-500, -150, 120, 50, "platform", "yellow");
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
  createObject(1800, 0, 200, 50, "platform", "yellow");
  createObject(2200, -250, 200, 50, "platform", "red");
  createObject(1800, -500, 200, 50, "platform", "orange");
  createObject(2200, -750, 200, 50, "platform", "green");
  createObject(1800, -1000, 200, 50, "platform", "indigo");
  createObject(2200, -1250, 200, 50, "platform", "yellow");
  createObject(2500, -1400, 1000, 200, "ground");
}

function drawScenery() {
  ctx.globalCompositeOperation = "destination-over";
  createBgRect(-2200, -400, 1000, 500, "#8B4000");
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
  createObject(-100000, 999, 200000, 500, "lava");
}

function go() {
  var start = new Audio("/music/start.mp3");
  start.play();
  document.getElementById("menu").classList.add("hidden");
  document.getElementById("disconnected").classList.add("hidden");
  var name = document.getElementById("name").value;
  localStorage.setItem("name", name);
  document.getElementById("gameMusic").play();
  gameStarted = true;

  defaults.speed = 1;
  defaults.jumps = 1;
  defaults.padding = 1;
  defaults.force = 2;
  defaults.regen = 1;

  if (document.getElementById("speed").classList.contains("-translate-y-2")) {
    defaults.speed = 1.5;
  } else if (document.getElementById("jumps").classList.contains("-translate-y-2")) {
    defaults.jumps = 2;
  } else if (document.getElementById("force").classList.contains("-translate-y-2")) {
    defaults.force = 4;
  } else if (document.getElementById("regen").classList.contains("-translate-y-2")) {
    defaults.regen = 5;
  }

  speed = defaults.speed;

  if (window.btoa(name) === "c2xhcGZpc2g=") {
    devMode = true;
    name = "Koth Admin";
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

socket.on("respawn", () => {
  var respawn = new Audio("/music/Break.wav");
  respawn.play();
});

socket.on("bounce", () => {
  var bounce = new Audio("/music/Bounce.mp3");
  bounce.play();
});

socket.on("hit lava", () => {
  var lavaSfx = new Audio("/music/Sizzle.mp3");
  lavaSfx.play();
});

socket.on("hit", () => {
  var hit = new Audio("/music/Hit.mp3");
  hit.play();
});

function choose(powerup) {
  document.getElementById("speed").classList.remove("-translate-y-2");
  document.getElementById("jumps").classList.remove("-translate-y-2");
  document.getElementById("force").classList.remove("-translate-y-2");
  document.getElementById("regen").classList.remove("-translate-y-2");
  document.getElementById(powerup).classList.add("-translate-y-2");
  var click = new Audio("/music/click.mp3");
  click.play();
}

setInterval(sendData, 1000 / 60);
window.onload = () => {
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
  for (var i = 0; i < 10; i++) {
    clouds[i] = {
      x: Math.random() * (canvas.width + 2000) - 2000,
      y: Math.floor(Math.random() * 100),
      speed: Math.random() + 0.1,
    }
  }
  for (var i = 0; i < 100; i++) {
    raindrops[i] = {
      x: Math.random() * (canvas.width + 100) - 100,
      y: Math.random() * (-10 + 500) - 500,
      speed: Math.random() * (20 - 10) + 10,
    }
  }
  requestAnimationFrame(animate);
};
dirt.onload = () => {
  dirtPattern = ctx.createPattern(dirt, "repeat");
};
lava.onload = () => {
  lavaPattern = ctx.createPattern(lava, "repeat");
};

function animate() {
  requestAnimationFrame(animate);

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;
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
    drawScenery();
  } else {
    drawScenery();
  }

  ctx.restore();
  ctx.beginPath();
  ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.fillStyle = "rgba(0, 0, 0, " + darkness + ")";
  ctx.fill();
  ctx.closePath();
  ctx.globalCompositeOperation = "destination-over";
  
  for (var i = 0; i < clouds.length; i++) {
    createCloud(clouds[i]);
  }

  var x = gameState.players[id].x;
  var y = gameState.players[id].y;

  var ratio = canvas.width / canvas.height;
  bg.width = ratio * canvas.height;
  bg.height = canvas.height;

  bgcliff.width = ratio * canvas.height;
  bgcliff.height = canvas.height;

  bgmountain.width = ratio * canvas.height;
  bgmountain.height = canvas.height;

  for (var i = 0; i < 7; i++) {
    ctx.drawImage(bg, -(x + (bg.width * 7.5 * (i - 3))) / scrollSpeed, (-(y) / scrollSpeed) + 200, bg.width, bg.height);
  }

  for (var i = 0; i < 7; i++) {
    ctx.drawImage(bgcliff, (-(x + (bgcliff.width * 17 * (i - 3))) / (scrollSpeed * 2)) + 200, (-(y) / (scrollSpeed * 2)) + 100, bgcliff.width, bgcliff.height);
  }

  for (var i = 0; i < 6; i++) {
    ctx.drawImage(bgmountain, (-(x + (bgmountain.width * 17 * (i - 3))) / ((scrollSpeed + 3) * 2)) - 150, (-(y) / ((scrollSpeed + 3) * 2)), bgmountain.width, bgmountain.height);
  }

  if (lastWeather === "rainy" && gameState.weather !== "rainy") {
    for (var i = 0; i < 100; i++) {
      raindrops[i] = {
        x: Math.random() * (canvas.width + 100) - 100,
        y: Math.random() * (-10 + 500) - 500,
        speed: Math.random() * (20 - 10) + 10,
      }
    }
  }

  if (gameState.weather === "sunny") {
    darkness += 0.2 * (0 - darkness);
    ctx.beginPath();
    ctx.roundRect(-100, -100 + (-y / 50), 300, 300, 500);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = tinycolor("skyblue").darken(-y / 500).toString();
    ctx.fill();
    ctx.closePath();
  } else if (gameState.weather === "rainy") {
    darkness += 0.2 * (0.5 - darkness);
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = tinycolor("darkgray").darken(Math.abs(y) / 100).toString();
    ctx.fill();
    ctx.closePath();

    ctx.globalCompositeOperation = "source-over";
    for (var i = 0; i < raindrops.length; i++) {
      createRaindrop(raindrops[i]);
    }
  } else {
    darkness += 0.2 * (0 - darkness);
    ctx.beginPath();
    ctx.roundRect(-100, -100 + (-y / 50), 300, 300, 500);
    ctx.fillStyle = "yellow";
    ctx.fill();
    ctx.closePath();
    
    ctx.beginPath();
    ctx.rect(0, 0, ctx.canvas.width, ctx.canvas.height);
    ctx.fillStyle = tinycolor("skyblue").darken(-y / 500).toString();
    ctx.fill();
    ctx.closePath();
  }

  lastWeather = gameState.weather;
  
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
}

var adjective = ["Excited", "Anxious", "Overweight", "Jumpy", "Squashed", "Broad", "Crooked", "Curved", "Deep", "Even", "Anxious", "Jumpy", "Squashed", "Broad", "Crooked", "Curved", "Deep", "Even", "Flat", "Hilly", "Jagged", "Round", "Shallow", "Square", "Steep", "Straight", "Thick", "Thin", "Cooing", "Faint", "Harsh", "Hissing", "Hushed", "Husky", "Loud", "Melodic", "Moaning", "Mute", "Noisy", "Purring", "Quiet", "Raspy", "Shrill", "Silent", "Soft", "Squeaky"];
var object = ["Taco", "Sphere", "Watermelon", "Cheeseburger", "Spider", "Dragon", "Soda", "Watch", "Sunglasses", "T-shirt", "Purse", "Towel", "Hat", "Camera", "Photo", "Cat", "Dog"];

function generateName() {
 document.getElementById("name").value = adjective[Math.floor(Math.random() * adjective.length)] + object[Math.floor(Math.random() * object.length)];
}