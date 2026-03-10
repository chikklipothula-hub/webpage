const POOL_CONFIGS = {
    2: {
        entries: [10, 50, 100, 250, 500, 1000, 2000],
        prizes: [18, 40, 180, 400, 900, 1800, 3800],
        botWinProbability: 0.60 // 60% bot win rate
    },
    6: {
        entries: [10, 50, 100, 250, 500, 1000],
        prizes: [50, 250, 500, 1400, 2900, 5800],
        botWinProbability: 0.85 // 85% bot win rate as requested
    }
};

let currentSelection = { fee: 0, players: 2 };

function loadPoolData(playerCount) {
    const list = document.getElementById('poolEntries');
    list.innerHTML = '';
    const config = POOL_CONFIGS[playerCount];

    config.entries.forEach((fee, i) => {
        const row = document.createElement('div');
        row.className = 'entry-row';
        row.innerHTML = `<span>₹${fee}</span><span>₹${config.prizes[i]}</span>`;
        row.onclick = () => {
            document.querySelectorAll('.entry-row').forEach(r => r.classList.remove('selected'));
            row.classList.add('selected');
            currentSelection = { fee, prize: config.prizes[i], players: playerCount };
        };
        list.appendChild(row);
    });
}

function launchGame() {
    if (currentSelection.fee === 0) return alert("Select an Entry Fee first!");

    // ALGORITHM: Pre-determine winner based on bot probability
    const winRoll = Math.random();
    const isBotWinner = winRoll < POOL_CONFIGS[currentSelection.players].botWinProbability;

    console.log(`Starting Pool Rummy... Player Count: ${currentSelection.players}`);
    console.log(`Difficulty Algorithm: Bot Winning set to ${isBotWinner}`);

    // In a real app, you would pass these to your game table logic
    // For 6-player mode, one opponent is strictly a bot player
    alert(`Game Started! \nEntry: ₹${currentSelection.fee} \nMode: ${currentSelection.players} Players`);
}

// Initial Load
window.onload = () => loadPoolData(2);