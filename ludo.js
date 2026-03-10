/* --- 1. GLOBAL STATE --- */
let wallet 
let activePlayers = [];
let currentPlayerIdx = 0;
let isRolling = false;
let lastRoll = 0; 

const STARS = ["7,2", "3,7", "2,9", "7,13", "9,14", "13,9", "14,7", "9,3"];

const BOARD_PATH = [
    "7,1","7,2","7,3","7,4","7,5","7,6","6,7","5,7","4,7","3,7","2,7","1,7","1,8","1,9","2,9","3,9","4,9","5,9","6,9","7,10","7,11","7,12","7,13","7,14","7,15","8,15","9,15","9,14","9,13","9,12","9,11","9,10","10,9","11,9","12,9","13,9","14,9","15,9","15,8","15,7","14,7","13,7","12,7","11,7","10,7","9,6","9,5","9,4","9,3","9,2","9,1","8,1"
];

const HOME_PATHS = {
    red: ["8,2","8,3","8,4","8,5","8,6","finish"],
    green: ["2,8","3,8","4,8","5,8","6,8","finish"],
    yellow: ["8,14","8,13","8,12","8,11","8,10","finish"],
    blue: ["14,8","13,8","12,8","11,8","10,8","finish"]
};

const START_INDEX = { red: 0, green: 13, yellow: 26, blue: 39 };
let tokenPositions = { red: [-1,-1,-1,-1], green: [-1,-1,-1,-1], yellow: [-1,-1,-1,-1], blue: [-1,-1,-1,-1] };

/* --- 2. LOBBY & INITIALIZATION --- */
function processEntry(amount) {
    if (wallet < amount) {
        alert("Insufficient Deposit Balance!");
        return;
    }
    wallet -= amount;
    document.getElementById('wallet-balance').innerText = wallet;
    const mode = document.getElementById('mode-select').value;
    activePlayers = mode === "2" ? ['red', 'yellow'] : mode === "3" ? ['red', 'green', 'yellow'] : ['red', 'green', 'yellow', 'blue'];
    startGame();
}

function startGame() {
    document.getElementById('lobby').classList.add('hidden');
    document.getElementById('game-screen').classList.remove('hidden');
    activePlayers.forEach(color => {
        const prof = document.getElementById(`p-${color}`);
        const base = document.getElementById(`b-${color}`);
        if (prof) prof.classList.remove('hidden');
        if (base) base.classList.remove('inactive');
    });
    renderPath();
    spawnTokens();
    updateDicePosition(); 
}

/* --- 3. BOARD & TOKENS --- */
function renderPath() {
    const container = document.getElementById('cells-container');
    container.innerHTML = "";
    for (let r = 1; r <= 15; r++) {
        for (let c = 1; c <= 15; c++) {
            if (((r >= 7 && r <= 9) || (c >= 7 && c <= 9)) && !(r >= 7 && r <= 9 && c >= 7 && c <= 9)) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.id = `cell-${r}-${c}`;
                cell.style.gridRow = r; 
                cell.style.gridColumn = c;
                if (r === 8 && c >= 2 && c <= 6) cell.classList.add('path-red');
                if (c === 8 && r >= 2 && r <= 6) cell.classList.add('path-green');
                if (r === 8 && c >= 10 && c <= 14) cell.classList.add('path-yellow');
                if (c === 8 && r >= 10 && r <= 14) cell.classList.add('path-blue');
                if (STARS.includes(`${r},${c}`)) {
                    cell.innerHTML = "★";
                    cell.style.color = "rgba(0,0,0,0.2)";
                }
                container.appendChild(cell);
            }
        }
    }
}

function spawnTokens() {
    activePlayers.forEach(color => {
        for (let i = 0; i < 4; i++) {
            const t = document.createElement('div');
            t.className = `token t-${color}`;
            t.id = `token-${color}-${i}`;
            t.onclick = () => handleTokenClick(color, i);
            const slot = document.getElementById(`${color.charAt(0)}${i}`);
            if (slot) slot.appendChild(t);
        }
    });
}

/* --- 4. DICE LOGIC --- */
function handleDiceClick() {
    const currentColor = activePlayers[currentPlayerIdx];
    if (currentColor === 'red' && !isRolling && lastRoll === 0) {
        rollDice();
    }
}

function rollDice() {
    if (isRolling) return;
    isRolling = true;
    
    const diceEl = document.getElementById('main-dice');
    const currentColor = activePlayers[currentPlayerIdx];
    diceEl.classList.add('rolling');

    let rollInterval = setInterval(() => {
        diceEl.innerText = getDiceIcon(Math.floor(Math.random() * 6) + 1);
    }, 100);

    setTimeout(() => {
        clearInterval(rollInterval);
        
        let result = (currentColor !== 'red' && Math.random() < 0.4) ? 
                     (Math.random() > 0.5 ? 6 : 5) : 
                     Math.floor(Math.random() * 6) + 1;
        
        diceEl.innerText = getDiceIcon(result);
        diceEl.classList.remove('rolling');
        lastRoll = result;
        isRolling = false;

        if (!canMoveAnyToken(currentColor, lastRoll)) {
            setTimeout(() => {
                finishTurn();
            }, 1000);
        } else if (currentColor !== 'red') {
            setTimeout(() => autoBotMove(currentColor), 800);
        }
    }, 600);
}

function canMoveAnyToken(color, roll) {
    return tokenPositions[color].some((pos) => {
        if (pos === -1) return roll === 6; 
        return pos + roll <= 56; 
    });
}

/* --- 5. MOVEMENT LOGIC (PLAYER CHOICE + 6 RULE) --- */
function handleTokenClick(color, idx) {
    if (isRolling || lastRoll === 0 || color !== activePlayers[currentPlayerIdx]) return;

    let pos = tokenPositions[color][idx];
    let moved = false;

    // Choice 1: Spawn from base
    if (pos === -1) {
        if (lastRoll === 6) {
            tokenPositions[color][idx] = 0;
            moveTokenToCell(color, idx, BOARD_PATH[START_INDEX[color]]);
            moved = true;
        } else {
            return; // Can't move this one
        }
    } 
    // Choice 2: Move on board
    else {
        let newPos = pos + lastRoll;
        if (newPos <= 56) {
            tokenPositions[color][idx] = newPos;
            let coords = getCoordsForPos(color, newPos);
            moveTokenToCell(color, idx, coords);
            if (newPos < 56) checkCapture(color, coords);
            moved = true;
        }
    }

    if (moved) {
        // If they rolled a 6, they get another roll!
        if (lastRoll === 6) {
            lastRoll = 0;
            updateDicePosition(); // Reset dice for same player
        } else {
            finishTurn();
        }
    }
}

function getCoordsForPos(color, pos) {
    if (pos < 51) {
        let index = (START_INDEX[color] + pos) % 52;
        return BOARD_PATH[index];
    } else {
        return HOME_PATHS[color][pos - 51];
    }
}

function moveTokenToCell(color, idx, coords) {
    const token = document.getElementById(`token-${color}-${idx}`);
    if (coords === "finish") {
        token.style.display = "none";
        checkWin(color);
        return;
    }
    const [r, c] = coords.split(',');
    const targetCell = document.getElementById(`cell-${r}-${c}`);
    if (targetCell) targetCell.appendChild(token);
}

function checkCapture(color, coords) {
    if (STARS.includes(coords)) return;
    activePlayers.forEach(p => {
        if (p === color) return;
        tokenPositions[p].forEach((pos, idx) => {
            if (pos !== -1 && getCoordsForPos(p, pos) === coords) {
                tokenPositions[p][idx] = -1;
                const token = document.getElementById(`token-${p}-${idx}`);
                const baseSlot = document.getElementById(`${p.charAt(0)}${idx}`);
                if (baseSlot) baseSlot.appendChild(token);
            }
        });
    });
}

function autoBotMove(color) {
    let bestMove = -1;

    // Bot Logic for Choice:
    // 1. If rolled 6 and have tokens in base, 50% chance to birth new one
    if (lastRoll === 6) {
        bestMove = tokenPositions[color].indexOf(-1);
        if (bestMove !== -1 && Math.random() > 0.5) {
            handleTokenClick(color, bestMove);
            return;
        }
    }

    // 2. Otherwise, move the first valid token on the board
    for (let i = 0; i < 4; i++) {
        if (tokenPositions[color][i] !== -1 && tokenPositions[color][i] + lastRoll <= 56) {
            handleTokenClick(color, i);
            return;
        }
    }

    // 3. Last resort: spawn if 6
    if (lastRoll === 6) {
        bestMove = tokenPositions[color].indexOf(-1);
        if (bestMove !== -1) handleTokenClick(color, bestMove);
    }
}

function finishTurn() {
    lastRoll = 0;
    currentPlayerIdx = (currentPlayerIdx + 1) % activePlayers.length;
    updateDicePosition();
}

function updateDicePosition() {
    const color = activePlayers[currentPlayerIdx];
    const dice = document.getElementById('main-dice');
    const colors = { 'red': '#e74c3c', 'green': '#2ecc71', 'yellow': '#f1c40f', 'blue': '#3498db' };
    if (dice) {
        dice.style.boxShadow = `0 0 20px 5px ${colors[color]}`;
        dice.style.border = `2px solid ${colors[color]}`;
    }
    if (color !== 'red') setTimeout(rollDice, 1000);
}

function getDiceIcon(number) {
    return ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"][number - 1];
}

function checkWin(color) {
    if (tokenPositions[color].every(pos => pos === 56)) {
        alert(`${color.toUpperCase()} WINS!`);
        location.reload();
    }
}