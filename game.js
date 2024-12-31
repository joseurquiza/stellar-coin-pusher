const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Load the background image
const backgroundImage = new Image();
backgroundImage.src = "https://tokens.action-tokens.com/.well-known/back1.png"; // Link to your background image

// Load the green token logo
const greenTokenLogo = new Image();
greenTokenLogo.src = "https://stellar.myfilebase.com/ipfs/QmQ5vnkWhpvPTBydH7ABuzUZzsV9LNke5Xb5z6iMFAoKah";

// Load the yellow token logo
const yellowTokenLogo = new Image();
yellowTokenLogo.src = "https://sdexexplorer.com/storage/assets/310/70_876W2pJePhQfuwBsK0vHltB0vxgXM6HFDQTjtM69.png";

// Load the cannon image
const cannonImage = new Image();
cannonImage.src = "https://tokens.action-tokens.com/.well-known/cannon.png";

let cannon = { x: 350, y: 500, width: 100, height: 100, speed: 5, direction: 1 };
let coins = [];
let droppedCoin = null;
let score = 0;
let level = 1;
let tokenRadius = 30;
let timeRemaining = 60; // 60 seconds timer
let timerInterval = null;
let leaderboard = {};
let hitsInARow = 0; // Counter for consecutive hits

// Seeded random number generator
function seededRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

// Initialize tokens with consistent starting positions for each level
function initializeTokens() {
    coins = Array.from({ length: 10 }, (_, i) => {
        const seed = level * 100 + i;
        return {
            x: seededRandom(seed) * (canvas.width - 50) + 25,
            y: seededRandom(seed + 1) * (canvas.height / 2 - 50) + 50,
            radius: tokenRadius,
            vx: (seededRandom(seed + 2) - 0.5) * 2, // Small initial random velocity
            vy: (seededRandom(seed + 3) - 0.5) * 2, // Small initial random velocity
        };
    });
}

// Draw the background image
function drawBackground() {
    ctx.drawImage(backgroundImage, 0, 0, canvas.width, canvas.height);
}

// Draw the cannon image
function drawCannon() {
    ctx.drawImage(cannonImage, cannon.x, cannon.y, cannon.width, cannon.height);
}

function drawCoins() {
    coins.forEach((coin) => {
        const size = coin.radius * 2;
        ctx.drawImage(
            yellowTokenLogo,
            coin.x - coin.radius,
            coin.y - coin.radius,
            size,
            size
        );
    });
}

function dropCoin() {
    if (!droppedCoin) {
        droppedCoin = {
            x: cannon.x + cannon.width / 2,
            y: cannon.y - 10,
            radius: 20,
            vx: 0,
            vy: -5,
        };
    }
}

function drawDroppedCoin() {
    if (droppedCoin) {
        const size = droppedCoin.radius * 2;
        ctx.drawImage(
            greenTokenLogo,
            droppedCoin.x - droppedCoin.radius,
            droppedCoin.y - droppedCoin.radius,
            size,
            size
        );

        droppedCoin.y += droppedCoin.vy;

        let collisionOccurred = false;
        coins.forEach((coin) => {
            if (droppedCoin && checkCollision(droppedCoin, coin)) {
                coin.vx = (coin.x - droppedCoin.x) * 0.2;
                coin.vy = (coin.y - droppedCoin.y) * 0.2;
                collisionOccurred = true;
                hitsInARow++; // Increment the hit counter
            }
        });

        if (collisionOccurred || droppedCoin.y < 0) {
            droppedCoin = null;
        }
    }
}

function updateCoins() {
    for (let i = 0; i < coins.length; i++) {
        const coin1 = coins[i];

        // Update position
        coin1.x += coin1.vx;
        coin1.y += coin1.vy;

        // Count the token as exited if any part of it is off the canvas
        if (
            coin1.x - coin1.radius < 0 || // Left edge is off-screen
            coin1.x + coin1.radius > canvas.width || // Right edge is off-screen
            coin1.y - coin1.radius < 0 || // Top edge is off-screen
            coin1.y + coin1.radius > canvas.height // Bottom edge is off-screen
        ) {
            score += 1; // Increment the score
            hitsInARow = 0; // Reset hits counter
            coins.splice(i, 1); // Remove the coin from the array
            i--; // Adjust index after removal
            continue;
        }

        // Check collisions with other coins
        for (let j = i + 1; j < coins.length; j++) {
            const coin2 = coins[j];
            if (checkCollision(coin1, coin2)) {
                const dx = coin1.x - coin2.x;
                const dy = coin1.y - coin2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                const overlap = 0.5 * (coin1.radius + coin2.radius - distance);
                coin1.x += (dx / distance) * overlap;
                coin1.y += (dy / distance) * overlap;
                coin2.x -= (dx / distance) * overlap;
                coin2.y -= (dy / distance) * overlap;

                const nx = dx / distance;
                const ny = dy / distance;
                const kx = coin1.vx - coin2.vx;
                const ky = coin1.vy - coin2.vy;
                const p = 2 * (kx * nx + ky * ny) / 2;

                coin1.vx -= p * nx;
                coin1.vy -= p * ny;
                coin2.vx += p * nx;
                coin2.vy += p * ny;
            }
        }

        // Apply friction
        coin1.vx *= 0.98;
        coin1.vy *= 0.98;
    }

    if (coins.length === 0) {
        nextLevel();
    }
}

function updateCannon() {
    cannon.x += cannon.speed * cannon.direction;

    if (cannon.x <= 0 || cannon.x + cannon.width >= canvas.width) {
        cannon.direction *= -1;
    }
}

function nextLevel() {
    level++;
    tokenRadius -= 5;
    if (tokenRadius < 5) tokenRadius = 5;

    hitsInARow = 0; // Reset hits counter when moving to the next level
    initializeTokens();
}

function checkCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function drawScoreAndLevel() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
    ctx.fillText(`Level: ${level}`, 10, 60);
    ctx.fillText(`Time: ${timeRemaining}s`, 10, 90);
}

function drawHitsInARow() {
    ctx.fillStyle = "white";
    ctx.font = "20px Arial";
    ctx.fillText(`Hits in a Row: ${hitsInARow}`, 10, 120);
}

function drawLeaderboard() {
    ctx.fillStyle = "white";
    ctx.font = "16px Arial";
    ctx.fillText("Leaderboard:", 650, 30);
    let yOffset = 50;
    for (const [player, playerScore] of Object.entries(leaderboard)) {
        ctx.fillText(`${player}: ${playerScore}`, 650, yOffset);
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
    leaderboard["Player"] = Math.max(score, leaderboard["Player"] || 0); // Update leaderboard with max score
    score = 0;
    level = 1;
    tokenRadius = 30;
    timeRemaining = 60;
    hitsInARow = 0;
    initializeTokens();
    startTimer();
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground(); // Draw the background image
    drawCannon();
    drawCoins();
    drawDroppedCoin();
    drawScoreAndLevel();
    drawHitsInARow(); // Draw hits in a row counter
    drawLeaderboard();

    updateCannon();
    updateCoins();

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", dropCoin);

initializeTokens();
startTimer();
gameLoop();
