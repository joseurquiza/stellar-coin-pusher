const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load the green token logo
const greenTokenLogo = new Image();
greenTokenLogo.src = "https://stellar.myfilebase.com/ipfs/QmQ5vnkWhpvPTBydH7ABuzUZzsV9LNke5Xb5z6iMFAoKah";

// Load the yellow token logo
const yellowTokenLogo = new Image();
yellowTokenLogo.src = "https://sdexexplorer.com/storage/assets/310/70_876W2pJePhQfuwBsK0vHltB0vxgXM6HFDQTjtM69.png";

let cannon = { x: 350, y: 550, width: 100, height: 30, barrelWidth: 20, barrelHeight: 40, speed: 5, direction: 1 };
let coins = [];
let droppedCoin = null;
let score = 0;
let level = 1;
let tokenRadius = 30;
let timeRemaining = 60; // 60 seconds timer
let timerInterval = null;
let leaderboard = {}; // Track fastest times for each level

// Seeded random number generator
function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Initialize tokens with consistent starting positions for each level
function initializeTokens() {
    coins = Array.from({ length: 10 }, (_, i) => {
        const seed = level * 100 + i; // Ensure each token has a unique seed per level
        return {
            x: seededRandom(seed) * (canvas.width - 50) + 25, // Avoid edges
            y: seededRandom(seed + 1) * (canvas.height / 2 - 50) + 50, // Avoid edges
            radius: tokenRadius,
            vx: 0,
            vy: 0,
        };
    });
}

function drawCannon() {
    // Draw cannon base
    ctx.fillStyle = "gray";
    ctx.fillRect(cannon.x, cannon.y, cannon.width, cannon.height);

    // Draw cannon barrel
    ctx.fillStyle = "black";
    ctx.fillRect(
        cannon.x + cannon.width / 2 - cannon.barrelWidth / 2, // Center the barrel on the base
        cannon.y - cannon.barrelHeight, // Barrel extends above the base
        cannon.barrelWidth,
        cannon.barrelHeight
    );
}

function drawCoins() {
    coins.forEach((coin) => {
        const size = coin.radius * 2; // Diameter of the token
        ctx.drawImage(
            yellowTokenLogo,
            coin.x - coin.radius, // Center the image horizontally
            coin.y - coin.radius, // Center the image vertically
            size,
            size
        );
    });
}

function dropCoin() {
    if (!droppedCoin) {
        droppedCoin = {
            x: cannon.x + cannon.width / 2, // Center of the cannon barrel
            y: cannon.y - cannon.barrelHeight - 10, // Just above the cannon barrel
            radius: 20,
            vx: 0,
            vy: -5, // Initial upward speed
        };
    }
}

function drawDroppedCoin() {
    if (droppedCoin) {
        // Draw the green token logo
        const size = droppedCoin.radius * 2; // Diameter of the token
        ctx.drawImage(
            greenTokenLogo,
            droppedCoin.x - droppedCoin.radius, // Center the image horizontally
            droppedCoin.y - droppedCoin.radius, // Center the image vertically
            size,
            size
        );

        // Move the dropped coin
        droppedCoin.y += droppedCoin.vy;

        // Handle collisions with yellow coins
        let collisionOccurred = false;
        coins.forEach((coin) => {
            if (droppedCoin && checkCollision(droppedCoin, coin)) {
                coin.vx = (coin.x - droppedCoin.x) * 0.2;
                coin.vy = (coin.y - droppedCoin.y) * 0.2;
                collisionOccurred = true;
            }
        });

        // Remove the dropped coin after collision
        if (collisionOccurred || droppedCoin.y < 0) {
            droppedCoin = null;
        }
    }
}

function updateCoins() {
    coins = coins.filter((coin) => {
        coin.x += coin.vx;
        coin.y += coin.vy;

        coin.vx *= 0.98; // Apply friction
        coin.vy *= 0.98;

        if (coin.x < 0 || coin.x > canvas.width || coin.y < 0 || coin.y > canvas.height) {
            score += 1;
            return false; // Remove the coin
        }

        return true; // Keep the coin
    });

    if (coins.length === 0) {
        nextLevel();
    }
}

function updateCannon() {
    cannon.x += cannon.speed * cannon.direction;

    // Reverse direction if the cannon hits the canvas boundaries
    if (cannon.x <= 0 || cannon.x + cannon.width >= canvas.width) {
        cannon.direction *= -1;
    }
}

function nextLevel() {
    level += 1;

    // Save the time to leaderboard if all coins cleared
    if (!leaderboard[level - 1] || leaderboard[level - 1] > 60 - timeRemaining) {
        leaderboard[level - 1] = 60 - timeRemaining;
    }

    tokenRadius -= 5;
    if (tokenRadius < 5) tokenRadius = 5;

    initializeTokens();
}

function checkCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function drawScoreAndLevel() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    ctx.fillText(`Time: ${timeRemaining}s`, 10, 90);
}

function drawLeaderboard() {
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("Leaderboard:", 650, 30);
    let yOffset = 50;
    for (const [lvl, time] of Object.entries(leaderboard)) {
        ctx.fillText(`Level ${lvl}: ${time.toFixed(2)}s`, 650, yOffset);
        yOffset += 20;
    }
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeRemaining--;
        if (timeRemaining <= 0) {
            clearInterval(timerInterval);
            alert(`Time's up! Your final score: ${score}`);
            resetGame();
        }
    }, 1000);
}

function resetGame() {
    score = 0;
    level = 1;
    tokenRadius = 30;
    timeRemaining = 60;
    leaderboard = {};
    initializeTokens();
    startTimer();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawCannon();
    drawCoins();
    drawDroppedCoin();
    drawScoreAndLevel();
    drawLeaderboard();

    updateCannon(); // Update the cannon position
    updateCoins();

    requestAnimationFrame(gameLoop);
}

// Event listener for shooting tokens
canvas.addEventListener("click", dropCoin);

// Start the game and timer
initializeTokens();
startTimer();
gameLoop();
