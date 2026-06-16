import { fetchUser } from "./helpers.js";
import { greet, showBalance } from "./user.js";
import { updatePockets } from "./pockets.js";
import { updateDates, updateSpendings, showSpendings, calculateTotalWeeklyExpense } from "./spendings.js";
import { updateTransactions } from "./transactions.js";
import { initializeNotifications } from "./notifications.js";
import "./calculator.js";
import "./account.js"

try {
    window.user = await fetchUser();
    initializeNotifications();
    greet();
    showBalance();
    updatePockets();
    updateDates();
    calculateTotalWeeklyExpense();
    showSpendings();
    updateTransactions();
} catch (error) {
    console.error(error);
    window.location.href = "auth.html";
}