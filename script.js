let isRegister = true;
let captchaValue = "";

// Generate Captcha
function generateCaptcha() {
    captchaValue = Math.random().toString(36).substring(2,8);
    document.getElementById("captchaText").innerText = captchaValue;
}

// Toggle Register/Login
function toggleMode() {
    let title = document.getElementById("title");
    let registerBtn = document.getElementById("registerBtn");
    let loginBtn = document.getElementById("loginBtn");
    let toggleText = document.getElementById("toggleText");
    let forgotText = document.getElementById("forgotText");
    let confirmPassword = document.getElementById("confirmPassword");
    let captchaSection = document.getElementById("captchaSection");

    isRegister = !isRegister;

    if(isRegister) {
        title.innerText = "Register";
        registerBtn.classList.remove("hidden");
        loginBtn.classList.add("hidden");
        confirmPassword.classList.remove("hidden");
        captchaSection.classList.remove("hidden");
        forgotText.classList.add("hidden");
        toggleText.innerText = "Already have account? Login";
    } else {
        title.innerText = "Login";
        registerBtn.classList.add("hidden");
        loginBtn.classList.remove("hidden");
        confirmPassword.classList.add("hidden");
        captchaSection.classList.add("hidden");
        forgotText.classList.remove("hidden");
        toggleText.innerText = "Don't have account? Register";
    }

    document.getElementById("error").innerText = "";
}

// REGISTER FUNCTION
function register() {
    let phone = document.getElementById("phone").value;
    let pass = document.getElementById("password").value;
    let confirm = document.getElementById("confirmPassword").value;
    let captchaInput = document.getElementById("captchaInput").value;
    let error = document.getElementById("error");

    if(phone.length < 10) {
        error.innerText = "Enter valid phone number";
        return;
    }

    if(pass !== confirm) {
        error.innerText = "Passwords do not match";
        return;
    }

    if(captchaInput !== captchaValue) {
        error.innerText = "Captcha incorrect";
        generateCaptcha();
        return;
    }

    localStorage.setItem("userPhone", phone);
    localStorage.setItem("userPass", pass);

    alert("Registration Successful!");
    toggleMode();
}

// LOGIN FUNCTION
function login() {
    let phone = document.getElementById("phone").value;
    let pass = document.getElementById("password").value;
    let error = document.getElementById("error");

    let savedPhone = localStorage.getItem("userPhone");
    let savedPass = localStorage.getItem("userPass");

    if(phone === savedPhone && pass === savedPass) {
        alert("Login Successful!");
        window.location.href = "home.html";
    } else {
        error.innerText = "Invalid phone or password";
    }
}

// SHOW FORGOT PASSWORD FORM
function showForgot() {

    document.getElementById("title").innerText = "Reset Password";

    document.getElementById("registerBtn").classList.add("hidden");
    document.getElementById("loginBtn").classList.add("hidden");
    document.getElementById("toggleText").classList.add("hidden");
    document.getElementById("forgotText").classList.add("hidden");

    document.getElementById("confirmPassword").classList.remove("hidden");
    document.getElementById("captchaSection").classList.remove("hidden");

    document.getElementById("password").placeholder = "New Password";
    document.getElementById("confirmPassword").placeholder = "Confirm Password";

    document.getElementById("registerBtn").innerText = "Reset Password";
    document.getElementById("registerBtn").classList.remove("hidden");
    document.getElementById("registerBtn").onclick = resetPassword;

    generateCaptcha();
}

// RESET PASSWORD FUNCTION
function resetPassword() {
    let phone = document.getElementById("phone").value;
    let newPass = document.getElementById("password").value;
    let confirmPass = document.getElementById("confirmPassword").value;
    let captchaInput = document.getElementById("captchaInput").value;
    let error = document.getElementById("error");

    if(phone !== localStorage.getItem("userPhone")) {
        error.innerText = "Phone number not registered";
        return;
    }

    if(newPass !== confirmPass) {
        error.innerText = "Passwords do not match";
        return;
    }

    if(captchaInput !== captchaValue) {
        error.innerText = "Captcha incorrect";
        generateCaptcha();
        return;
    }

    localStorage.setItem("userPass", newPass);

    alert("Password Reset Successful!");
    location.reload();
}

// Generate first captcha
window.onload = generateCaptcha;