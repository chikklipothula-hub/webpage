/* --- 1. INITIALIZATION & WALLET LOGIC --- */
// Pull balance from storage (0 if new user)
let balance = parseFloat(localStorage.getItem('walletBalance')) || 0;
let selectedRoomAmount = 0;

// Function to update the UI elements
function refreshUI() {
    // Update Balance Display
    const balanceElement = document.getElementById("balance");
    if (balanceElement) {
        balanceElement.innerText = balance;
    }

    // Update Masked Phone Display
    const userPhoneElement = document.getElementById("userPhone");
    if (userPhoneElement) {
        let phone = localStorage.getItem("userPhone") || "9876543210";
        userPhoneElement.innerText = maskPhone(phone);
    }
}

/* --- 2. LUDO ROOM SELECTION --- */
function openLudoRooms() {
    document.getElementById("ludoRooms").style.display = "flex";
}

function closeRooms() {
    document.getElementById("ludoRooms").style.display = "none";
}

function selectRoom(amount) {
    // Check if user has enough money
    if (balance < amount) {
        alert("Insufficient Balance! Please deposit money first.");
        return;
    }

    selectedRoomAmount = amount;
    // Close room selection and open the QR/Confirmation modal
    closeRooms(); 
    document.getElementById("qrModal").style.display = "flex";
}

/* --- 3. PAYMENT & GAME START --- */
function closeQR() {
    document.getElementById("qrModal").style.display = "none";
}

function confirmPayment() {
    // 1. Deduct money
    balance -= selectedRoomAmount;

    // 2. Save the NEW balance to localStorage (Essential step)
    localStorage.setItem('walletBalance', balance);

    // 3. Update the screen
    document.getElementById("balance").innerText = balance;

    closeQR();
    alert("Room Joined Successfully! Game Starting...");
    
    // 4. Go to game
    startLudoGame();
}

function startLudoGame() {
    window.location.href = "ludo.html?room=" + selectedRoomAmount;
}

function openLudo() {
    window.location.href = "ludo.html";
}

/* --- 4. UTILITY FUNCTIONS --- */
function maskPhone(phone) {
    if (phone.length < 4) return phone;
    let start = phone.substring(0, 2);
    let end = phone.substring(phone.length - 2);
    return start + "XXXXXX" + end;
}

// Run this automatically when the page finishes loading
document.addEventListener("DOMContentLoaded", refreshUI);