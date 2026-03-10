const boardElement = document.getElementById('chess-board');
const pieces = {
    'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚', 'p': '♟', 
    'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔', 'P': '♙'
};

const pieceValues = { 'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0 };

let board = [
    ['r','n','b','q','k','b','n','r'],
    ['p','p','p','p','p','p','p','p'],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['','','','','','','',''],
    ['P','P','P','P','P','P','P','P'],
    ['R','N','B','Q','K','B','N','R']
];

let selected = null;
let turn = 'w'; 
let capturedByPlayer = [];
let capturedByBot = [];
let whiteScore = 0;
let blackScore = 0;

// --- CORE RULES ---
function canMove(fR, fC, tR, tC) {
    const piece = board[fR][fC].toLowerCase();
    const isWhite = board[fR][fC] === board[fR][fC].toUpperCase();
    const target = board[tR][tC];
    
    if (target !== '' && (isWhite === (target === target.toUpperCase()))) return false;

    const dr = Math.abs(tR - fR);
    const dc = Math.abs(tC - fC);

    switch (piece) {
        case 'p': // Pawn logic
            const dir = isWhite ? -1 : 1;
            if (fC === tC && target === '') {
                if (tR - fR === dir) return true;
                if (((isWhite && fR === 6) || (!isWhite && fR === 1)) && tR - fR === 2 * dir) {
                    return board[fR + dir][fC] === '';
                }
            }
            if (dr === 1 && dc === 1 && target !== '') return true;
            return false;
        case 'n': return (dr === 2 && dc === 1) || (dr === 1 && dc === 2);
        case 'r': return (fR === tR || fC === tC) && isPathClear(fR, fC, tR, tC);
        case 'b': return (dr === dc) && isPathClear(fR, fC, tR, tC);
        case 'q': return (dr === dc || fR === tR || fC === tC) && isPathClear(fR, fC, tR, tC);
        case 'k': return dr <= 1 && dc <= 1;
    }
    return false;
}

function isPathClear(fR, fC, tR, tC) {
    let rStep = tR > fR ? 1 : tR < fR ? -1 : 0;
    let cStep = tC > fC ? 1 : tC < fC ? -1 : 0;
    let r = fR + rStep;
    let c = fC + cStep;
    while (r !== tR || c !== tC) {
        if (board[r][c] !== '') return false;
        r += rStep; c += cStep;
    }
    return true;
}

// --- SCORE & CAPTURE LOGIC ---
function executeMove(fR, fC, tR, tC) {
    const targetPiece = board[tR][tC];
    if (targetPiece !== '') {
        const isWhiteTarget = targetPiece === targetPiece.toUpperCase();
        const val = pieceValues[targetPiece.toLowerCase()];
        if (isWhiteTarget) {
            capturedByBot.push(pieces[targetPiece]);
            blackScore += val;
        } else {
            capturedByPlayer.push(pieces[targetPiece]);
            whiteScore += val;
        }
    }
    board[tR][tC] = board[fR][fC];
    board[fR][fC] = '';
    turn = turn === 'w' ? 'b' : 'w';
    render();
}

// --- BOT BRAIN ---
function botTurn() {
    let bestMove = null;
    let bestScore = -Infinity;

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (board[r][c] !== '' && board[r][c] === board[r][c].toLowerCase()) {
                for (let tr = 0; tr < 8; tr++) {
                    for (let tc = 0; tc < 8; tc++) {
                        if (canMove(r, c, tr, tc)) {
                            let score = evaluateMove(tr, tc);
                            if (score > bestScore) {
                                bestScore = score;
                                bestMove = { fR: r, fC: c, tR: tr, tC: tc };
                            }
                        }
                    }
                }
            }
        }
    }
    if (bestMove) executeMove(bestMove.fR, bestMove.fC, bestMove.tR, bestMove.tC);
}

function evaluateMove(r, c) {
    const target = board[r][c].toLowerCase();
    let score = target ? pieceValues[target] * 10 : 0;
    // Strategy: Control the center
    if (r >= 3 && r <= 4 && c >= 3 && c <= 4) score += 2;
    return score;
}

// --- UI & RENDER ---
function onCellClick(r, c) {
    if (turn !== 'w') return;
    if (selected) {
        if (canMove(selected.r, selected.c, r, c)) {
            executeMove(selected.r, selected.c, r, c);
            selected = null;
            setTimeout(botTurn, 600);
        } else {
            selected = null;
            render();
        }
    } else if (board[r][c] !== '' && board[r][c] === board[r][c].toUpperCase()) {
        selected = { r, c };
        render();
    }
}

function render() {
    boardElement.innerHTML = '';
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.className = `cell ${(r + c) % 2 === 0 ? 'white-sq' : 'black-sq'}`;
            if (selected && selected.r === r && selected.c === c) cell.classList.add('selected');
            cell.innerText = pieces[board[r][c]] || '';
            cell.onclick = () => onCellClick(r, c);
            boardElement.appendChild(cell);
        }
    }
    updateUI();
}

function updateUI() {
    document.getElementById('white-score').innerText = whiteScore;
    document.getElementById('black-score').innerText = blackScore;
    document.getElementById('game-status').innerText = turn === 'w' ? "White's Turn" : "Bot Thinking...";
    document.getElementById('captured-black').innerHTML = capturedByPlayer.map(p => `<span>${p}</span>`).join('');
    document.getElementById('captured-white').innerHTML = capturedByBot.map(p => `<span>${p}</span>`).join('');
}

// Initial Call
render();
// Add this inside your executeMove logic in chess.js
function handleCapture(targetPiece) {
    const isWhite = targetPiece === targetPiece.toUpperCase();
    const type = targetPiece.toLowerCase();
    const val = pieceValues[type];

    if (isWhite) {
        // Bot killed a Player piece
        capturedByBot.push(pieces[targetPiece]);
        blackScore += val;
        // Update Bot's Graveyard (White pieces)
        document.getElementById('captured-white').innerHTML = 
            capturedByBot.map(p => `<span>${p}</span>`).join('');
    } else {
        // Player killed a Bot piece
        capturedByPlayer.push(pieces[targetPiece]);
        whiteScore += val;
        // Update Player's Graveyard (Black pieces)
        document.getElementById('captured-black').innerHTML = 
            capturedByPlayer.map(p => `<span>${p}</span>`).join('');
    }
    
    // Update Score display
    document.getElementById('white-score').innerText = whiteScore;
    document.getElementById('black-score').innerText = blackScore;
}
