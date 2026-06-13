import { months, fetchUser, capitalize, format, request, formatDate } from "./helpers.js";

const DAY = 86400000;

let currDate = Date.now();
let startOfWeek = new Date(currDate -  6*DAY);
let endOfWeek = new Date();
let dateContainer = document.getElementById("week-range-label");
let spendingsList = document.getElementById("spending-list-container");
let arrowsContainer = document.querySelector(".spending-nav");
let totalExpense = 0;



/* ===============    Functions    =============== */





async function changeWeek(e) {
    if (e.target.closest("#prev-week-btn")) {            
        currDate -= 7*DAY;      
    } else if (e.target.closest("#next-week-btn")) {
        currDate += 7*DAY;      
    } else {
        return;
    }
    startOfWeek = new Date(currDate - 6*DAY);
    endOfWeek = new Date(currDate);
    updateDates();
    await updateSpendings();
    showSpendings();
}

export function updateDates() {
    dateContainer.textContent = `${months[startOfWeek.getUTCMonth()]} ${startOfWeek.getUTCDate()} - ${months[endOfWeek.getUTCMonth()]} ${endOfWeek.getUTCDate()}`;
}

export async function updateSpendings(makeRequest = true) {
    if (makeRequest) {
        window.user.spendings = await request(`${import.meta.env.VITE_API_URL}/users/weekly-spendings?start_date=${formatDate(startOfWeek)}&end_date=${formatDate(endOfWeek)}`, {
            method: 'GET',
            credentials: "include"
        });
    }
    totalExpense = window.user.spendings.reduce((sum, elem) => sum + elem.spending, 0);
}

export function showSpendings() {

    spendingsList.innerHTML = "";

    for (const entry of window.user.spendings) {
        let color = window.user.pockets.find(pocket => entry.pocket_name === pocket.pocket_name)?.color?.toLowerCase();

        if (entry.spending === 0) continue;

        spendingsList.insertAdjacentHTML("beforeend", `
            <div class="spending-theme-${color}">
                <div class="spending-item-header">
                    <span class="spending-item-category"><i class="fas fa-tag"></i>${entry.pocket_name}</span>
                    <span class="spending-item-amount">Rs ${format(entry.spending)}</span>
                </div>
                <div class="progress-bar-container">
                    <div class="progress-bar" style="width: ${entry.spending/totalExpense * 100}%;"></div>
                </div>
            </div>
        `);
    }

    if (spendingsList.innerHTML === "") {
        spendingsList.insertAdjacentHTML("beforeend", `<div class="no-spendings-message"> No spendings this week! </div>`);
    }
}




/* ===============    Event Listeners    =============== */




arrowsContainer.addEventListener("click", changeWeek);