import { format } from "./helpers.js";

const balanceElement = document.getElementById("total-balance");
const addFundsButton = document.getElementById("add-funds-btn");
const greetingHeadingElement = document.getElementById("user-greeting");
const toggleBalanceVisibilityButton = document.getElementById("toggle-balance-btn");

let balanceVisible = true;

export function showBalance(toggle = false) {
    if (toggle)
        balanceVisible = !balanceVisible;
    balanceElement.textContent = balanceVisible ? `Rs ${format(window.user.total_balance)}` : `********`;
}

export function greet() {
    greetingHeadingElement.textContent = `Welcome, ${window.user.name}!`;
}

addFundsButton.addEventListener("click", () => alert("Can't Add Funds!"));
toggleBalanceVisibilityButton.addEventListener("click", showBalance.bind(null, true));