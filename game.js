const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Fullscreen canvas
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game assets
const assets = {
    background: "Assets/Other/MuseumTrack.png",
    thief: "Assets/Thief/ThiefRun1.png",
    cop: "Assets/Obstacles/Cop.png",
    sensor: "Assets/Obstacles/MotionZone.png",
    laser: "Assets/Obstacles/LaserMaze.png",
    webmockup: "Assets/Other/WebMockup.png",
    reset: "Assets/Other/Reset.png"
};

let images = {};
let assetsLoaded = false;
let gameState = "intro";
let points = 0;
let gameSpeed = 12;
let backgroundX = 0;
const targetPoints = 2000;

let groundY = canvas.height * 0.7;

let thief = {
    x: 80,
    y: groundY,
    width: 70,
    height: 70,
    jumping: false,
    jumpVelocity: 0,
    gravity: 0.7,
    jumpStrength: 16
};

let obstacles = [];
let obstacleTypes = ["cop", "sensor", "laser"];
let spawnCounter = 0;
let spawnThreshold = randomInt(50, 120);

function loadImages(assetMap, callback) {
    let loaded = 0;
    let total = Object.keys(assetMap).length;
    for (let key in assetMap) {
        const img = new Image();
        img.src = assetMap[key];
        img.onload = () => {
            images[key] = img;
            loaded++;
            if (loaded === total) callback();
        };
    }
}

function startGame() {
    gameState = "playing";
    points = 0;
    gameSpeed = 12;
    obstacles = [];
    backgroundX = 0;
    groundY = canvas.height * 0.7;
    thief.y = groundY;
    thief.jumping = false;
    thief.jumpVelocity = 0;
    window.requestAnimationFrame(gameLoop);
}

function gameLoop() {
    if (gameState === "playing") {
        update();
        draw();
        window.requestAnimationFrame(gameLoop);
    } else if (gameState === "gameover") {
        drawGameOver();
    } else if (gameState === "win") {
        drawWin();
    }
}

function update() {
    backgroundX -= gameSpeed;
    if (backgroundX <= -canvas.width) backgroundX = 0;

    if (thief.jumping) {
        thief.y -= thief.jumpVelocity;
        thief.jumpVelocity -= thief.gravity;
        if (thief.y >= groundY) {
            thief.y = groundY;
            thief.jumping = false;
        }
    }

    points++;
    if (points % 200 === 0) gameSpeed += 0.5;

    spawnCounter++;
    if (spawnCounter > spawnThreshold) {
        let type = obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)];
        spawnObstacle(type);
        spawnCounter = 0;
        spawnThreshold = randomInt(50, 120);
    }

    obstacles.forEach((obs, i) => {
        obs.x -= gameSpeed + (obs.speed || 0);
        if (obs.x + obs.width < 0) obstacles.splice(i, 1);
        if (checkCollision(thief, obs)) {
            gameState = "gameover";
        }
    });

    if (points >= targetPoints) {
        gameState = "win";
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, backgroundX, 0, canvas.width, canvas.height);
    ctx.drawImage(images.background, backgroundX + canvas.width, 0, canvas.width, canvas.height);
    ctx.drawImage(images.thief, thief.x, thief.y, thief.width, thief.height);

    obstacles.forEach(obs => {
        ctx.drawImage(images[obs.type], obs.x, obs.y, obs.width, obs.height);
    });

    ctx.fillStyle = "#000";
    ctx.font = "20px sans-serif";
    ctx.fillText("Points: " + points, canvas.width - 150, 40);
}

function spawnObstacle(type) {
    let width, height, y;

    if (type === "cop") {
        width = thief.width * 3;   
        height = thief.height * 3; 
        y = groundY - 100;       
    } else if (type === "sensor") {
        width = 250;  
        height = 250; 
        y = groundY - 100;        
    } else if (type === "laser") {
        width = 80;     
        height = 100; 
        y = groundY - thief.height * 2.2; 
    }

    obstacles.push({
        type: type,
        x: canvas.width,
        y: y,
        width: width,
        height: height,
        speed: type === "cop" ? 2 : 0
    });
}


function checkCollision(thief, obs) {
    const hitboxOffsets = {
        cop: { x: 30, y: 30, w: -60, h: -60 },
        sensor: { x: 30, y: 50, w: -60, h: -80 },
        laser: { x: 20, y: 10, w: -40, h: -20 }
    };

    const offset = hitboxOffsets[obs.type] || { x: 0, y: 0, w: 0, h: 0 };

    const a = thief;
    const b = {
        x: obs.x + offset.x,
        y: obs.y + offset.y,
        width: obs.width + offset.w,
        height: obs.height + offset.h
    };

    return (
        a.x < b.x + b.width &&
        a.x + a.width > b.x &&
        a.y < b.y + b.height &&
        a.y + a.height > b.y
    );
}




function drawIntro() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#000";
    ctx.font = "30px sans-serif";
    ctx.fillText("Museum Heist: WiFi Gone", canvas.width / 2 - 180, 200);
    ctx.fillText("Reach " + targetPoints + " points to escape the museum", canvas.width / 2 - 300, 250);
    ctx.fillText("Press any key to start", canvas.width / 2 - 150, 350);
}

function drawGameOver() {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(images.reset, canvas.width / 2 - 40, 350, 80, 80);
    ctx.fillStyle = "#000";
    ctx.font = "32px sans-serif";
    ctx.fillText("GAME OVER", canvas.width / 2 - 100, 200);
}

function drawWin() {
    ctx.fillStyle = "rgb(240, 210, 100)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "green";
    ctx.font = "36px sans-serif";
    ctx.fillText("Congratulations!", canvas.width / 2 - 120, 220);
    ctx.fillStyle = "black";
    ctx.font = "28px sans-serif";
    ctx.fillText("WiFi has been successfully restored.", canvas.width / 2 - 200, 270);
    ctx.fillStyle = "purple";
    ctx.font = "30px sans-serif";
    ctx.fillText("SECRET CODE: AHA — All Hail Avocados", canvas.width / 2 - 250, 320);
}

document.addEventListener("keydown", () => {
    if (gameState === "intro" && assetsLoaded) startGame();
    else if (!thief.jumping && gameState === "playing") {
        thief.jumping = true;
        thief.jumpVelocity = thief.jumpStrength;
    }
});

canvas.addEventListener("click", (e) => {
    if (gameState === "gameover") {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        if (x >= canvas.width / 2 - 40 && x <= canvas.width / 2 + 40 &&
            y >= 350 && y <= 430) startGame();
    }
});

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

loadImages(assets, () => {
    assetsLoaded = true;
    drawIntro();
});
