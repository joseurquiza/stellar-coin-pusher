const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let slider = { x: 350, y: 550, width: 100, height: 20, speed: 5, direction: 1 };
let coins = Array.from({ length: 10 }, () => ({
    x: Math.random() * 750 + 25,
    y: Math.random() * 450 + 50,
    radius: 10,
    vx: 0,
    vy: 0,
}));

let droppedCoin = null;
let score = 0;

function drawSlider() {
    ctx.fillStyle = "blue";
    ctx.fillRect(slider.x, slider.y, slider.width, slider.height);
}

function drawCoins() {
    ctx.fillStyle = "gold";
    coins.forEach((coin) => {
        ctx.beginPath();
        ctx.arc(coin.x, coin.y, coin.radius, 0, Math.PI * 2);
        ctx.fill();
    });
}

function dropCoin() {
    if (!droppedCoin) {
        droppedCoin = { x: slider.x + slider.width / 2, y: slider.y - 10, radius: 10, vx: 0, vy: -5 };
    }
}

function drawDroppedCoin() {
    if (droppedCoin) {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(droppedCoin.x, droppedCoin.y, droppedCoin.radius, 0, Math.PI * 2);
        ctx.fill();

        // Move the dropped coin
        droppedCoin.y += droppedCoin.vy;

        // Check for collisions with yellow coins
        let coinsToRemove = [];
        coins.forEach((coin, index) => {
            if (checkCollision(droppedCoin, coin)) {
                // Apply velocity to the yellow coin
                coin.vx = (coin.x - droppedCoin.x) * 0.2;
                coin.vy = (coin.y - droppedCoin.y) * 0.2;

                // Mark the dropped coin for removal
                droppedCoin = null;

                // Add this coin index to be removed later if needed
                coinsToRemove.push(index);
            }
        });

        // Remove the dropped coin if it leaves the screen
        if (droppedCoin && droppedCoin.y < 0) {
            droppedCoin = null;
        }

        // Remove coins marked for removal after iteration
        coinsToRemove.forEach((index) => {
            coins.splice(index, 1);
            score += 1; // Add to the score
        });
    }
}

function updateCoins() {
    coins.forEach((coin, index) => {
        coin.x += coin.vx;
        coin.y += coin.vy;

        // Slow down coins over time (simulate friction)
        coin.vx *= 0.98;
        coin.vy *= 0.98;

        // Check if the coin is off-screen
        if (coin.x < 0 || coin.x > canvas.width || coin.y < 0 || coin.y > canvas.height) {
            coins.splice(index, 1); // Remove the coin
            score += 1; // Add to the score
        }
    });
}

function updateSlider() {
    slider.x += slider.speed * slider.direction;
    if (slider.x <= 0 || slider.x + slider.width >= canvas.width) {
        slider.direction *= -1;
    }
}

// Collision detection: checks if two circles overlap
function checkCollision(circle1, circle2) {
    const dx = circle1.x - circle2.x;
    const dy = circle1.y - circle2.y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function drawScore() {
    ctx.fillStyle = "black";
    ctx.font = "20px Arial";
    ctx.fillText(`Score: ${score}`, 10, 30);
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSlider();
    drawCoins();
    drawDroppedCoin();
    drawScore();

    updateSlider();
    updateCoins();

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", dropCoin);
gameLoop();
