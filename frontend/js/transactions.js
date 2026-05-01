import { updateSpendings, showSpendings } from "./spendings.js";
import { API_URL, format, months, request } from "./helpers.js";

let allTransactionsPresent = false;
let showAllTransactions = false;
const transactionsList = document.getElementById("transaction-list-container");
const transactionViewControlButton = document.getElementById("view-all-btn");


async function changeTrasactionsView() {
    showAllTransactions = !showAllTransactions;
    transactionViewControlButton.textContent = `View ${showAllTransactions ? "Few" : "All"} Transactions`;

    if (!allTransactionsPresent) {
        window.user.transactions = await request(`${API_URL}/users/transactions`, {
            method: 'GET',
            credentials: "include"
        });
        allTransactionsPresent = true;
    }
    updateTransactions();
    updateSpendings();
    showSpendings();
}

function appendTransaction(transaction) {
    let color = window.user.pockets.find(pocket => pocket.pocket_name === transaction.pocket_name)?.color?.toLowerCase();

    transactionsList.insertAdjacentHTML("afterbegin", `
        <div class="transaction-item">
            <div class="transaction-details">
                <div class="transaction-icon icon-${color}">
                    <i class="fas fa-money-bill-wave"></i>
                </div>
                <div class="transaction-info">
                    <p class="title">${transaction.transaction_message}</p>
                    <p class="subtitle">${transaction.pocket_name} Pocket • ${months[transaction.transaction_date.split("-")[1] - 1]} ${+transaction.transaction_date.split("-")[2]}</p>
                </div>
            </div>
            <p class="transaction-amount amount-${transaction.transaction_amount < 0 ? "debit" : "credit"}">
                ${transaction.transaction_amount < 0 ? "-" : "+"} Rs ${format(Math.abs(transaction.transaction_amount))}
            </p>
        </div>
    `);
}

export function updateTransactions() {
    transactionsList.innerHTML = "";
    if (showAllTransactions) {
        window.user.transactions.forEach(transaction => appendTransaction(transaction));
    } else {
        for (let i = Math.max(0, window.user.transactions.length-4); i < window.user.transactions.length; i++) {
            appendTransaction(window.user.transactions[i]);
        }
    }
}

transactionViewControlButton.addEventListener("click", changeTrasactionsView);