// Validation to enable/disable the Withdraw button
function checkButtonState() {
    const amount = document.getElementById('withdrawAmount').value;
    const isChecked = document.getElementById('policyCheck').checked;
    const btn = document.getElementById('submitBtn');

    // Enable button only if amount is 200 or more AND policy is checked
    if (amount >= 200 && isChecked) {
        btn.classList.remove('btn-disabled');
        btn.classList.add('btn-active');
        btn.disabled = false;
    } else {
        btn.classList.add('btn-disabled');
        btn.classList.remove('btn-active');
        btn.disabled = true;
    }
}

function processWithdraw() {
    const amount = document.getElementById('withdrawAmount').value;
    alert("Withdrawal request of ₹" + amount + " submitted.");
}

function addBankCard() {
    alert("Opening Add Bank Card interface...");
}

function showPolicy() {
    alert("Withdrawal Policy:\n1. Minimum withdrawal is ₹200.");
}

function openRecords() {
    alert("Opening Withdrawal Records...");
}

// Inside your existing withdraw.js file
function addBankCard() {
    // This replaces the alert and opens the new page
    window.location.href = "add-card.html";
}
// Initial check when page loads
window.onload = checkButtonState;