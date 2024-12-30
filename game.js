const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

let slider = { x: 350, y: 550, width: 100, height: 20, speed: 5, direction: 1 };
let coins = Array.from({ length: 10 }, () => ({
    x: Math.random() * 750 + 25,
    y: Math.random() * 450 + 50,
    radius: 10,
}));

let droppedCoin = null;

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
        droppedCoin = { x: slider.x + slider.width / 2, y: slider.y - 10, radius: 10 };
    }
}

function drawDroppedCoin() {
    if (droppedCoin) {
        ctx.fillStyle = "green";
        ctx.beginPath();
        ctx.arc(droppedCoin.x, droppedCoin.y, droppedCoin.radius, 0, Math.PI * 2);
        ctx.fill();

        droppedCoin.y -= 5;
        if (droppedCoin.y < 0) {
            droppedCoin = null;
        }
    }
}

function updateSlider() {
    slider.x += slider.speed * slider.direction;
    if (slider.x <= 0 || slider.x + slider.width >= canvas.width) {
        slider.direction *= -1;
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawSlider();
    drawCoins();
    drawDroppedCoin();

    updateSlider();

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener("click", dropCoin);
gameLoop();
