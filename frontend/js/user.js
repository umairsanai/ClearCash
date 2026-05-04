import { API_URL, format } from "./helpers.js";

const balanceElement = document.getElementById("total-balance");
const addFundsButton = document.getElementById("add-funds-btn");
const greetingHeadingElement = document.getElementById("user-greeting");
const toggleBalanceVisibilityButton = document.getElementById("toggle-balance-btn");
const logoutButton = document.getElementById("logout-btn");

let balanceVisible = true;

export function showBalance(toggle = false) {
    if (toggle)
        balanceVisible = !balanceVisible;
    balanceElement.textContent = balanceVisible ? `Rs ${format(window.user.total_balance)}` : `********`;
}

export function greet() {
    greetingHeadingElement.textContent = `Welcome, ${window.user.name}!`;
}

async function logout() {
    const res = await fetch(`${API_URL}/users/logout`, {
        method: "POST",
        credentials: "include"
    });
    if (res.ok) {
        window.location.href = "auth.html";
    }
}

logoutButton.addEventListener("click", logout);
addFundsButton.addEventListener("click", () => alert("Can't Add Funds!"));
toggleBalanceVisibilityButton.addEventListener("click", showBalance.bind(null, true));