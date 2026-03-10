function saveBankDetails() {
    const name = document.getElementById('userName').value;
    const account = document.getElementById('accountNumber').value;
    const ifsc = document.getElementById('ifscCode').value;
    const bank = document.getElementById('bankName').value;

    // Simple Validation
    if (!name || !account || !ifsc || !bank) {
        alert("Please fill in all fields correctly.");
        return;
    }

    if (ifsc.length < 11) {
        alert("Please enter a valid 11-digit IFSC code.");
        return;
    }

    // Logic to save (In a real app, this sends to a database)
    alert("Bank Card Added Successfully!");
    
    // Go back to the withdraw page
    window.location.href = "withdraw.html";
}