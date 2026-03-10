// Function to quickly set the amount from grid buttons
function setAmount(val) {
    document.getElementById('rechargeAmount').value = val;
}

// Switches from Step 1 (Selection) to Step 2 (QR/Upload)
function goToStep2() {
    const amount = document.getElementById('rechargeAmount').value;
    
    if (!amount || amount <= 0) {
        alert("Please enter or select a valid amount.");
        return;
    }

    // Update UI for Step 2
    document.getElementById('step1').style.display = 'none';
    document.getElementById('step2').style.display = 'block';
    document.getElementById('backBtn').style.display = 'block';
    document.getElementById('headerTitle').innerText = "Recharge ₹" + amount;
}

// Back button logic
function goBack() {
    document.getElementById('step1').style.display = 'block';
    document.getElementById('step2').style.display = 'none';
    document.getElementById('backBtn').style.display = 'none';
    document.getElementById('headerTitle').innerText = "Recharge";
}

// File Upload Logic
function triggerUpload() {
    document.getElementById('fileInput').click();
}

function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('previewImg');
            const uploadUI = document.getElementById('uploadUI');
            
            preview.src = e.target.result;
            preview.style.display = 'block';
            uploadUI.style.display = 'none';
        }
        reader.readAsDataURL(file);
    }
}

// Final Submission
function finalSubmit() {
    const file = document.getElementById('fileInput').files[0];

    if (!file) {
        alert("Please upload the payment screenshot before submitting.");
        return;
    }

    // Success Message
    alert("Deposit request received! Your balance will be updated after verification.");
    
    // In a real app, you would use FormData to send the 'file' to your server here.
    location.reload(); // Reset the page
}