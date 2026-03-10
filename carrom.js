/* --- 1. GLOBAL STATE --- */
let walletBalance 
userScore = 0, botScore = 0;
let userColor = '', botColor = '', isUserTurn = true;
let canvas, ctx, slider;

const BOARD_SIZE = 500, FRICTION = 0.985;
const POCKETS = [[35, 35], [465, 35], [35, 465], [465, 465]];
const STRIKER_BOTTOM_Y = 420, STRIKER_TOP_Y = 80;

let carromDiscs = [];
let striker = { x: 250, y: STRIKER_BOTTOM_Y, vx: 0, vy: 0, isMoving: false, radius: 18, wasMoving: false };

/* --- 2. GAME INITIALIZATION --- */
function openPayment(amount, win) {
    if (walletBalance >= amount) {
        walletBalance -= amount;
        document.getElementById('wallet').innerText = "₹" + walletBalance;
        document.getElementById('current-win').innerText = "₹" + win;
        
        // UI Transitions
        document.getElementById('room-selection').style.display = 'none';
        document.getElementById('colorModal').style.display = 'flex';
    } else {
        alert("Insufficient Balance!");
    }
}

function startGameWithColor(color) {
    userColor = color;
    botColor = (color === '#ffffff') ? '#333333' : '#ffffff';
    
    document.getElementById('user-color-name').innerText = (color === '#ffffff' ? "White" : "Black");
    document.getElementById('bot-color-name').innerText = (botColor === '#ffffff' ? "White" : "Black");
    document.getElementById('colorModal').style.display = 'none';
    document.getElementById('turn-status').innerText = "YOUR TURN";

    initGameEngine();
}

function initGameEngine() {
    canvas = document.getElementById('carromBoard');
    ctx = canvas.getContext('2d');
    slider = document.getElementById('striker-slider');
    
    setupFullCarromSet();
    requestAnimationFrame(render);
}

/* --- 3. THE 19-COIN ALGORITHM --- */
function setupFullCarromSet() {
    carromDiscs = [];
    const cx = 250, cy = 250;
    
    // Queen (Red)
    carromDiscs.push({ x: cx, y: cy, color: "#ff0000", vx: 0, vy: 0 });

    // Inner Circle (6 coins)
    for (let i = 0; i < 6; i++) {
        let angle = (i * 60) * (Math.PI / 180);
        let r = 28;
        let col = (i % 2 === 0) ? "#ffffff" : "#333333";
        carromDiscs.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), color: col, vx: 0, vy: 0 });
    }

    // Outer Circle (12 coins)
    for (let i = 0; i < 12; i++) {
        let angle = (i * 30) * (Math.PI / 180);
        let r = 56;
        let col = ([0, 2, 5, 7, 9, 11].includes(i)) ? "#333333" : "#ffffff";
        carromDiscs.push({ x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle), color: col, vx: 0, vy: 0 });
    }
}

/* --- 4. CORE PHYSICS & POCKET ENGINE --- */
function updatePhysics() {
    if (!striker.isMoving && carromDiscs.every(d => Math.abs(d.vx) < 0.1 && Math.abs(d.vy) < 0.1)) {
        if (striker.wasMoving) {
            handleTurnSwitch();
        }
        return;
    }

    // Update Striker
    striker.x += striker.vx;
    striker.y += striker.vy;
    striker.vx *= FRICTION;
    striker.vy *= FRICTION;

    // Boundary Bounces
    if (striker.x < 38 || striker.x > 462) striker.vx *= -0.7;
    if (striker.y < 38 || striker.y > 462) striker.vy *= -0.7;

    // Update and Filter Coins (Pockets)
    carromDiscs = carromDiscs.filter(disc => {
        disc.x += (disc.vx || 0);
        disc.y += (disc.vy || 0);
        disc.vx = (disc.vx || 0) * FRICTION;
        disc.vy = (disc.vy || 0) * FRICTION;

        // Collision with Striker
        let dx = disc.x - striker.x;
        let dy = disc.y - striker.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < striker.radius + 12) {
            let angle = Math.atan2(dy, dx);
            disc.vx = Math.cos(angle) * 15;
            disc.vy = Math.sin(angle) * 15;
            striker.vx *= 0.5; striker.vy *= 0.5;
        }

        // Pocket Detection
        let isPocketed = POCKETS.some(p => Math.sqrt((disc.x - p[0])**2 + (disc.y - p[1])**2) < 28);
        if (isPocketed) {
            processScore(disc.color);
            return false;
        }
        return true;
    });

    if (Math.abs(striker.vx) < 0.2 && Math.abs(striker.vy) < 0.2) {
        striker.isMoving = false;
        striker.wasMoving = true;
    }
}

function processScore(color) {
    let points = (color === "#ff0000") ? 50 : (color === "#ffffff" ? 20 : 10);
    if (isUserTurn) {
        userScore += points;
        document.getElementById('user-score').innerText = userScore;
    } else {
        botScore += points;
        document.getElementById('bot-score').innerText = botScore;
    }
}

/* --- 5. TURN MANAGEMENT --- */
function handleTurnSwitch() {
    striker.wasMoving = false;
    isUserTurn = !isUserTurn;
    
    striker.vx = 0; striker.vy = 0;
    striker.y = isUserTurn ? STRIKER_BOTTOM_Y : STRIKER_TOP_Y;
    striker.x = 250;
    
    document.getElementById('turn-status').innerText = isUserTurn ? "YOUR TURN" : "BOT'S TURN";
    if (!isUserTurn) setTimeout(botDecision, 1200);
}

function fireStriker() {
    if (striker.isMoving || !isUserTurn) return;
    striker.vy = -25; // Strike Power
    striker.vx = (Math.random() - 0.5) * 4;
    striker.isMoving = true;
    striker.wasMoving = false;
}

function botDecision() {
    striker.x = 100 + Math.random() * 300;
    striker.vy = 22; 
    striker.isMoving = true;
    striker.wasMoving = false;
}

/* --- 6. RENDER LOOP --- */
function render() {
    ctx.clearRect(0, 0, BOARD_SIZE, BOARD_SIZE);
    
    // Draw Board
    ctx.fillStyle = "#5d4037"; ctx.fillRect(0,0,500,500);
    ctx.fillStyle = "#f3e5ab"; ctx.fillRect(20,20,460,460);
    
    // Striking Lines
    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath(); ctx.moveTo(100, STRIKER_BOTTOM_Y); ctx.lineTo(400, STRIKER_BOTTOM_Y); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(100, STRIKER_TOP_Y); ctx.lineTo(400, STRIKER_TOP_Y); ctx.stroke();
    
    // Pockets
    ctx.fillStyle = "#111";
    POCKETS.forEach(p => { ctx.beginPath(); ctx.arc(p[0],p[1],28,0,7); ctx.fill(); });

    // Slider controls striker position
    if (!striker.isMoving && isUserTurn) striker.x = parseInt(slider.value);

    updatePhysics();

    // Draw Pieces
    carromDiscs.forEach(d => {
        ctx.fillStyle = d.color;
        ctx.beginPath(); ctx.arc(d.x, d.y, 12, 0, 7); ctx.fill();
        ctx.strokeStyle = "#000"; ctx.lineWidth = 1; ctx.stroke();
    });

    // Draw Striker
    ctx.fillStyle = "#ffeb3b";
    ctx.beginPath(); ctx.arc(striker.x, striker.y, striker.radius, 0, 7); ctx.fill();
    ctx.stroke();

    requestAnimationFrame(render);
}