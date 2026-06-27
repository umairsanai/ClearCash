import validator from "validator";

const authForm = document.getElementById("auth-form");
const authFields = document.getElementById("auth-fields");
const switchBtn = document.getElementById("switch-btn");
const switchHint = document.getElementById("switch-hint");
const authTitle = document.getElementById("auth-title");
const authSubtitle = document.getElementById("auth-subtitle");
const authChip = document.getElementById("auth-chip");
const submitBtn = document.getElementById("submit-btn");
const formMessage = document.getElementById("form-message");
const googleLoginButton = document.querySelector(".google-login-btn");

let currentMode = "login";




/* ===============    Functions    =============== */





function passwordFieldMarkup(id, name, placeholder) {
    return `
    <div class="form-group">
        <label for="${id}">Password</label>
        <div class="password-field">
            <input id="${id}" name="${name}" type="password" placeholder="${placeholder}" required>
            <button type="button" class="password-toggle" data-password-toggle >
                <i class="fas fa-eye"></i>
            </button>
        </div>
    </div>
`;
}

function bindPasswordToggle() {
    const toggleBtn = authFields.querySelector("[data-password-toggle]");
    const passwordInput = authFields.querySelector('input[type="password"]');

    toggleBtn.addEventListener("click", () => {
        const isHidden = passwordInput.type === "password";
        passwordInput.type = isHidden ? "text" : "password";
        toggleBtn.querySelector("i").className = isHidden ? "fas fa-eye-slash" : "fas fa-eye";
    });
}



const loginFieldsMarkup = `
    <div class="form-group">
        <label for="login-username">Username</label>
        <input id="login-username" name="username" type="text" autocomplete="username" placeholder="Username" required>
    </div>
    ${passwordFieldMarkup("login-password", "password", "Enter your password")}
`;

const signupFieldsMarkup = `
    <div class="form-group">
        <label for="signup-name">Full name</label>
        <input id="signup-name" name="name" type="text" autocomplete="name" placeholder="Jane Doe" required>
    </div>
    <div class="form-group">
        <label for="signup-email">Email</label>
        <input id="signup-email" name="email" type="email" autocomplete="email" placeholder="jane@email.com" required>
    </div>
    <div class="form-group">
        <label for="signup-username">Username</label>
        <input id="signup-username" name="username" type="text" autocomplete="username" placeholder="janedoe" required>
    </div>
    <div class="form-group">
        <label for="signup-phone">Phone number</label>
        <input id="signup-phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" placeholder="0300 1234567" required>
    </div>
    ${passwordFieldMarkup("signup-password", "password", "Create a password")}
`;

function setMessage(message, type) {
    if (!message) {
        formMessage.textContent = "";
        formMessage.className = "form-message";
        return;
    }
    formMessage.textContent = message;
    formMessage.className = `form-message ${type === "success" ? "is-success" : "is-error"}`;
}

function renderLogin() {
    currentMode = "login";
    authFields.innerHTML = loginFieldsMarkup;
    authFields.querySelector("#login-username").focus();
    bindPasswordToggle();

    authTitle.textContent = "Login";
    authSubtitle.textContent = "Use your ClearCash username and password.";
    authChip.textContent = "Welcome back";
    submitBtn.textContent = "Login";
    switchHint.textContent = "New here?";
    switchBtn.textContent = "Create an account";
    setMessage("");
}

function renderSignup() {
    currentMode = "signup";
    authFields.innerHTML = signupFieldsMarkup;
    authFields.querySelector("#signup-name").focus();
    bindPasswordToggle();

    authTitle.textContent = "Create account";
    authSubtitle.textContent = "Set up your ClearCash account in minutes.";
    authChip.textContent = "Start now";
    submitBtn.textContent = "Sign up";
    switchHint.textContent = "Already have an account?";
    switchBtn.textContent = "Back to login";
    setMessage("");
}

async function validateLogin() {
    const username = document.getElementById("login-username")?.value.trim();
    const password = document.getElementById("login-password")?.value.trim();

    if (!username) 
        throw new Error("Username is required.");

    if (!password) 
        throw new Error("Password is required.");

    let response = await fetch(`${import.meta.env.VITE_API_URL}/auth/login`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            username, password
        }),
        credentials: "include"
    });

    if (!response.ok) {
        response = await response.json();
        throw new Error(response.message || "Error: Login Failed. Please try again");
    }
}

async function validateSignup() {
    const name = document.getElementById("signup-name")?.value.trim();
    const email = document.getElementById("signup-email")?.value.trim();
    const username = document.getElementById("signup-username")?.value.trim();
    const phone = document.getElementById("signup-phone")?.value.trim();
    const password = document.getElementById("signup-password")?.value.trim();
    const phoneDigits = phone ? phone.replace(/\D/g, "") : "";

    if (!name) 
        throw new Error("Full name is required.");

    if (!email) 
        throw new Error("Email is required.");
    else if (!validator.isEmail(email)) 
        throw new Error("Please enter a valid email address.");

    if (!username) 
        throw new Error("Username is required.");

    if (!phone) 
        throw new Error("Phone number is required.");
    else if (phoneDigits.length < 11) 
        throw new Error("Phone number looks too short.");

    if (!password) 
        throw new Error("Password is required.");
    else if (validator.isStrongPassword(password)) 
        throw new Error("Password should be at least 6 characters.");

    let res = await fetch(`${import.meta.env.VITE_API_URL}/auth/signup`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            name, email, username, phone, password
        }),
        credentials: "include"
    });
    const ok = res.ok;
    res = await res.json();

    if (!ok) {
        console.log(res);
        throw new Error(res.message);            
    }        
    window.user = res.data;
}




/* ===============    Event Listeners    =============== */





switchBtn.addEventListener("click", () => {
    currentMode === "login" ? renderSignup() : renderLogin();
});

authForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    submitBtn.classList.add("is-pressed");
    setTimeout(() => submitBtn.classList.remove("is-pressed"), 100);

    try {
        currentMode === "login" ?
        await validateLogin() : 
        await validateSignup();

        setMessage("Looks good. Redirecting...", "success");

        setTimeout(() => {
            window.location.href = "index.html";
        }, 500);

    } catch (error) {
        setMessage(error.message, "error");
    }
});


googleLoginButton.addEventListener("click", async (event) => {
    event.preventDefault();

    window.location.href = `${import.meta.env.VITE_API_URL}/auth/google/login`;
});



renderLogin();