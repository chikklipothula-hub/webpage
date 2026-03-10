let depositBalance
let playerPos = 1;
let botPos = 1;
let currentTheme = '';
let activeWinAmount = 0;
let isBotTurn = false;
let playerWinStreak = 0; 

const boardConfigs = {
    'classic': { ladders: {4:14, 9:31, 21:42, 28:84, 51:67, 71:91}, snakes: {17:7, 54:34, 62:19, 95:75, 98:79} },
    'pink': { ladders: {10:32, 25:46, 38:61, 63:81, 75:96}, snakes: {27:5, 43:18, 56:35, 92:73, 99:80} },
    'blue': { ladders: {3:24, 14:35, 26:47, 50:70, 78:99}, snakes: {32:10, 48:26, 60:40, 95:55, 97:76} },
    'jungle': { ladders: {5:26, 18:39, 45:66, 61:82, 80:99}, snakes: {34:12, 52:29, 74:46, 94:71, 98:81} }
};

function enterRoom(entryFee, winAmount, theme) {
    if (depositBalance >= entryFee) {
        depositBalance -= entryFee;
        activeWinAmount = winAmount;
        currentTheme = theme;
        playerPos = 1; botPos = 1; isBotTurn = false;
        
        updateUI();
        document.getElementById('lobby').style.display = 'none';
        document.getElementById('game-area').style.display = 'block';
        document.getElementById('active-room-info').innerHTML = `Fee: ₹${entryFee} | <b>Win: ₹${winAmount}</b>`;
        
        initBoard(theme);
    } else {
        alert("Insufficient Balance!");
    }
}

function initBoard(theme) {
    const grid = document.getElementById('snakes-grid');
    grid.className = 'theme-' + theme;
    grid.innerHTML = '';
    
    for (let r = 9; r >= 0; r--) {
        for (let c = 0; c < 10; c++) {
            let actualNum = (r % 2 === 0) ? (r * 10) + (c + 1) : (r * 10) + (10 - c);
            const cell = document.createElement('div');
            cell.className = `cell ${actualNum % 2 === 0 ? 'even' : 'odd'}`;
            cell.id = `cell-${actualNum}`;
            cell.innerText = actualNum;
            grid.appendChild(cell);
        }
    }

    setTimeout(() => {
        drawSnakesAndLadders(theme);
        updateTokens();
    }, 150);
}

function handleDiceRoll() {
    if (isBotTurn) return;
    let roll = Math.floor(Math.random() * 6) + 1;
    if (playerWinStreak >= 2 && roll > 3) roll = Math.floor(Math.random() * 3) + 1;
    processMove('player', roll);
}

function botPlay() {
    document.getElementById('turn-banner').innerText = "BOT IS ROLLING...";
    document.getElementById('roll-btn').disabled = true;
    setTimeout(() => {
        let roll = Math.floor(Math.random() * 6) + 1;
        if (Math.random() < 0.60 && botPos < playerPos) roll = Math.max(roll, Math.floor(Math.random() * 6) + 1);
        processMove('bot', roll);
    }, 1200);
}

function processMove(who, roll) {
    const diceIcons = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
    document.getElementById('dice-result').innerText = diceIcons[roll-1];

    if (who === 'player') {
        playerPos = calculateNewPos(playerPos, roll);
        updateTokens();
        if (playerPos === 100) return endGame("player");
        isBotTurn = true;
        botPlay();
    } else {
        botPos = calculateNewPos(botPos, roll);
        updateTokens();
        if (botPos === 100) return endGame("bot");
        isBotTurn = false;
        document.getElementById('roll-btn').disabled = false;
        document.getElementById('turn-banner').innerText = "YOUR TURN";
    }
}

function calculateNewPos(current, roll) {
    let next = current + roll;
    if (next > 100) return current;
    const config = boardConfigs[currentTheme];
    if (config.ladders[next]) next = config.ladders[next];
    else if (config.snakes[next]) next = config.snakes[next];
    return next;
}

// --- REAL VISUALS DRAWING ---
function drawSnakesAndLadders(theme) {
    const canvas = document.getElementById('snakeCanvas');
    const ctx = canvas.getContext('2d');
    const container = document.getElementById('board-container');
    canvas.width = container.offsetWidth;
    canvas.height = container.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const config = boardConfigs[theme];
    for (let s in config.ladders) drawRealLadder(s, config.ladders[s], ctx);
    for (let s in config.snakes) drawRealSnake(s, config.snakes[s], ctx);
}

function drawRealLadder(start, end, ctx) {
    const s = getCenter(start), e = getCenter(end);
    const angle = Math.atan2(e.y - s.y, e.x - s.x), width = 10;
    ctx.strokeStyle = "#d4af37"; ctx.lineWidth = 3;
    for (let side of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(s.x + Math.sin(angle) * width * side, s.y - Math.cos(angle) * width * side);
        ctx.lineTo(e.x + Math.sin(angle) * width * side, e.y - Math.cos(angle) * width * side);
        ctx.stroke();
    }
    const steps = 6;
    for (let i = 1; i < steps; i++) {
        const tx = s.x + (e.x - s.x) * (i / steps), ty = s.y + (e.y - s.y) * (i / steps);
        ctx.beginPath();
        ctx.moveTo(tx + Math.sin(angle) * width, ty - Math.cos(angle) * width);
        ctx.lineTo(tx - Math.sin(angle) * width, ty + Math.cos(angle) * width);
        ctx.stroke();
    }
}



function drawRealSnake(start, end, ctx) {
    const s = getCenter(start), e = getCenter(end);
    const cpX = (s.x + e.x) / 2 + 40, cpY = (s.y + e.y) / 2 - 20;
    ctx.beginPath();
    ctx.moveTo(s.x, s.y);
    ctx.quadraticCurveTo(cpX, cpY, e.x, e.y);
    ctx.strokeStyle = "#2d5a27"; ctx.lineWidth = 8; ctx.lineCap = 'round'; ctx.stroke();
    // Head
    ctx.beginPath(); ctx.arc(s.x, s.y, 5, 0, Math.PI*2); ctx.fillStyle = "red"; ctx.fill();
}

function getCenter(num) {
    const cell = document.getElementById(`cell-${num}`);
    return { x: cell.offsetLeft + 27, y: cell.offsetTop + 27 };
}

function updateTokens() {
    const board = document.getElementById('board-container');
    
    // 1. Handle Player 1 (Blue)
    let p1 = document.getElementById('p1');
    if (!p1) {
        p1 = document.createElement('div');
        p1.id = 'p1';
        p1.className = 'player-pawn';
        board.appendChild(p1);
    }

    // 2. Handle Bot (Red)
    let p2 = document.getElementById('p2');
    if (!p2) {
        p2 = document.createElement('div');
        p2.id = 'p2';
        p2.className = 'player-pawn bot-pawn'; // Added class for red styling
        board.appendChild(p2);
    }

    // 3. Get Cell Positions
    const c1 = document.getElementById(`cell-${playerPos}`);
    const c2 = document.getElementById(`cell-${botPos}`);

    if (c1 && c2) {
        // Position Player 1 (slightly left of center)
        p1.style.left = (c1.offsetLeft + 8) + 'px'; 
        p1.style.top = (c1.offsetTop + 12) + 'px';

        // Position Bot (slightly right of center so they don't overlap)
        p2.style.left = (c2.offsetLeft + 24) + 'px'; 
        p2.style.top = (c2.offsetTop + 12) + 'px';
    }

    // 4. Update text displays
    const p1Display = document.getElementById('p1-pos');
    const p2Display = document.getElementById('p2-pos');
    if (p1Display) p1Display.innerText = playerPos;
    if (p2Display) p2Display.innerText = botPos;
}

function endGame(winner) {
    if (winner === 'player') {
        alert("Win! ₹" + activeWinAmount);
        depositBalance += activeWinAmount; playerWinStreak++;
    } else {
        alert("Bot Won!"); playerWinStreak = 0;
    }
    exitToLobby();
}

function exitToLobby() {
    document.getElementById('game-area').style.display = 'none';
    document.getElementById('lobby').style.display = 'block';
    updateUI();
}

function updateUI() {
    document.getElementById('wallet-balance').innerText = depositBalance;
    document.getElementById('game-wallet-val').innerText = depositBalance;
}