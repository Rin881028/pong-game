// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game variables
const paddleHeight = 100;
const paddleWidth = 10;
const ballSize = 8;

// Player paddle (left)
const player = {
    x: 0,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 6
};

// Computer paddle (right)
const computer = {
    x: canvas.width - paddleWidth,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    maxSpeed: 4.5
};

// Ball object
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    dx: 4,
    dy: 4,
    radius: ballSize,
    maxSpeed: 7
};

// Game state
let playerScore = 0;
let computerScore = 0;
let gameRunning = false;
let gamePaused = false;

// Input handling
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    MouseY: canvas.height / 2
};

// Keyboard events
document.addEventListener('keydown', (e) => {
    if (e.key === ' ') {
        e.preventDefault();
        gameRunning ? (gamePaused = !gamePaused) : (gameRunning = true);
        updateGameStatus();
    }
    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
});

// Mouse tracking
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    keys.MouseY = e.clientY - rect.top;
});

// Update game status display
function updateGameStatus() {
    const status = document.getElementById('gameStatus');
    if (!gameRunning) {
        status.textContent = 'Press SPACE to start';
    } else if (gamePaused) {
        status.textContent = 'PAUSED - Press SPACE to resume';
    } else {
        status.textContent = 'Playing';
    }
}

// Move player paddle with both mouse and keyboard
function updatePlayerPaddle() {
    // Keyboard control
    if (keys.ArrowUp) {
        player.dy = -player.maxSpeed;
    } else if (keys.ArrowDown) {
        player.dy = player.maxSpeed;
    } else {
        player.dy = 0;
    }

    // Mouse control (has priority if moving)
    const mouseDistance = Math.abs(keys.MouseY - (player.y + paddleHeight / 2));
    if (mouseDistance > 5) {
        if (keys.MouseY < player.y + paddleHeight / 2) {
            player.dy = -player.maxSpeed;
        } else {
            player.dy = player.maxSpeed;
        }
    }

    // Update position
    player.y += player.dy;

    // Boundary collision
    if (player.y < 0) player.y = 0;
    if (player.y + paddleHeight > canvas.height) {
        player.y = canvas.height - paddleHeight;
    }
}

// Computer AI
function updateComputerPaddle() {
    const computerCenter = computer.y + computer.height / 2;
    const ballCenter = ball.y;
    const reactionTime = 35; // Frames of delay for AI

    // Simple AI with reaction delay
    if (ballCenter < computerCenter - reactionTime) {
        computer.dy = -computer.maxSpeed;
    } else if (ballCenter > computerCenter + reactionTime) {
        computer.dy = computer.maxSpeed;
    } else {
        computer.dy *= 0.95; // Smooth deceleration
    }

    // Update position
    computer.y += computer.dy;

    // Boundary collision
    if (computer.y < 0) computer.y = 0;
    if (computer.y + computer.height > canvas.height) {
        computer.y = canvas.height - computer.height;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Top and bottom wall collision
    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = Math.max(ball.radius, Math.min(canvas.height - ball.radius, ball.y));
    }

    // Paddle collision - Player (left)
    if (
        ball.x - ball.radius < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.radius;

        // Add spin based on where ball hits the paddle
        const hitPos = (ball.y - (player.y + player.height / 2)) / (player.height / 2);
        ball.dy += hitPos * 3;

        // Increase speed slightly
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    // Paddle collision - Computer (right)
    if (
        ball.x + ball.radius > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.radius;

        // Add spin
        const hitPos = (ball.y - (computer.y + computer.height / 2)) / (computer.height / 2);
        ball.dy += hitPos * 3;

        // Increase speed
        const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
        if (speed < ball.maxSpeed) {
            ball.dx *= 1.05;
            ball.dy *= 1.05;
        }
    }

    // Scoring
    if (ball.x < 0) {
        computerScore++;
        resetBall();
        updateScore();
    }
    if (ball.x > canvas.width) {
        playerScore++;
        resetBall();
        updateScore();
    }
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.dx = (Math.random() > 0.5 ? 1 : -1) * 4;
    ball.dy = (Math.random() - 0.5) * 4;
}

// Update score display
function updateScore() {
    document.getElementById('playerScore').textContent = playerScore;
    document.getElementById('computerScore').textContent = computerScore;
}

// Draw functions
function drawPaddle(paddle) {
    ctx.fillStyle = '#00ff88';
    ctx.shadowColor = 'rgba(0, 255, 136, 0.8)';
    ctx.shadowBlur = 15;
    ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    ctx.shadowColor = 'transparent';
}

function drawBall() {
    ctx.fillStyle = '#ff00ff';
    ctx.shadowColor = 'rgba(255, 0, 255, 0.8)';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = 'transparent';
}

function drawCenter() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);
}

// Main game loop
function gameLoop() {
    // Clear canvas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw game elements
    drawCenter();
    drawPaddle(player);
    drawPaddle(computer);
    drawBall();

    // Update game logic only if running and not paused
    if (gameRunning && !gamePaused) {
        updatePlayerPaddle();
        updateComputerPaddle();
        updateBall();
    }

    requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
updateGameStatus();
