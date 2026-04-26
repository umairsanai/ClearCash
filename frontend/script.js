"use strict";

/* ============== CONSTANTS ====================== */

const DAY = 86400000;

/* ============== DOM ELEMENTS ====================== */

const greetingMessage = document.getElementById("user-greeting");
const roundUpSavingsToggle = document.querySelector(".toggle-checkbox");
const toggleBalanceVisibilityButton = document.getElementById("toggle-balance-btn");
const balanceElement = document.getElementById("total-balance");
const addFundsButton = document.getElementById("add-funds-btn");
const sendMoneyButton = document.getElementById("send-money-btn");

const pocketsContainer = document.querySelector(".pocket-grid");

const notificationsContainer = document.getElementById("notifications-panel");
const notificationsIcon = document.getElementById("notifications-btn");
const notificationsCloseButton = document.getElementById("close-notifications-btn");

const transactionsList = document.getElementById("transaction-list-container");
const transactionViewControlButton = document.getElementById("view-all-btn");

const editPocketContainer = document.getElementById("manage-pocket-modal");
const editPocketNameInput = document.getElementById("pocket-name-input");
const editPocketBudgetInput = document.getElementById("pocket-budget-input");
const editPocketCloseButton = document.getElementById("close-manage-modal-btn");
const editPocketSaveButton = document.getElementById("save-pocket-btn");
const editPocketDeleteButton = document.getElementById("delete-pocket-btn");

const transferFundsContainer = document.getElementById("transfer-funds-modal");
const transferFundsToInput = document.getElementById("transfer-to-pocket");
const transferFundsAmountInput = document.getElementById("transfer-amount-input");
const transferFundsCofirmButton = document.getElementById("confirm-transfer-btn");
const transferFundsCloseButton = document.getElementById("close-transfer-modal-btn");

const sendMoneyContainer = document.getElementById("send-money-modal");
const sendMoneyStep1Container = document.getElementById("send-money-step-1");
const sendMoneyStep2Container = document.getElementById("send-money-step-2");
const sendMoneyPocketOptionsInput = document.getElementById("send-from-pocket");
const sendMoneyCloseButton = document.getElementById("send-money-close-btn");
const sendMoneyRecipeintIDInput = document.getElementById("recipient-input");
const sendMoneyRecipientName = document.getElementById("recipient-name-display");
const sendMoneyConfirmCredentialsButton = document.getElementById("confirm-credentials-btn");
const sendMoneyConfirmSendButton = document.getElementById("confirm-send-btn");
const sendMoneyAmmountInput = document.getElementById("amount-input");
const sendMoneyDialpad = document.querySelector(".dialpad-grid");

const newPocketAddButton = document.getElementById("add-pocket-btn");
const newPocketFormContainer = document.getElementById("add-pocket-modal");
const newPocketFormCloseButton = document.getElementById("close-add-modal-btn");
const newPocketNameInput = document.getElementById("new-pocket-name-input");
const newPocketLimitInput = document.getElementById("new-pocket-budget-input");
const newPocketCreateButton = document.getElementById("create-pocket-btn");


/* ============== OTHER VARIABLES ====================== */

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const themes = ["green", "yellow", "blue", "purple", "orange"];
let themePtr = 0, user, transactions = [], pockets = new Map(), notifications = [], colors = new Map();


/* ============== HELPER FUNCTIONS ====================== */

const capitalize = (word) => word.split(" ").map(w => w[0].toUpperCase() + w.toLowerCase().slice(1)).join(" ");
const format = (number) => new Intl.NumberFormat('en-US', { style: 'decimal' }).format(number);


/* ============== CLASSES AND OBJECTS ====================== */

class Pocket {
    
    static pocketInEdit = null;

    constructor (title, limit) {
        this.title = capitalize(title);
        this.limit = Math.max(1, limit);
        this.amount = 0;
        this.updateInDOM();
    }
    updateInDOM() {
        const lowercaseTitle = this.title.toLowerCase();
        pocketsContainer.insertAdjacentHTML("beforeend",
            `<div class="pocket-card pocket-theme-${colors.get(lowercaseTitle)}">
                <div class="pocket-card-header">
                    <i class="fas fa-archive"></i>
                    <span>${this.title}</span>
                </div>
                <p id="pocket-${lowercaseTitle}-balance" class="pocket-card-balance">Rs ${this.amount}.00</p>
                ${
                    this.title === "Main" ? "" :
                    `<div class="progress-bar-container">
                        <div id="pocket-${lowercaseTitle}-progress" class="progress-bar" style="width: ${(this.amount/this.limit) * 100}%;"></div>
                    </div>
                    <p id="pocket-${lowercaseTitle}-info" class="pocket-card-info">Rs ${this.amount} left of ${this.limit}</p>`
                }
                <button class="pocket-card-action ${this.title === "Main" ? " transfer" : "manage"}-pocket-btn" ${this.title === "Main" ? "" : `data-pocket-name="${this.title}" data-pocket-budget="${this.limit}"`}>${this.title === "Main" ? "Transfer Funds" : "Manage"}</button>
            </div>`);
    }
    deposit(title, amount) {
        amount = Math.abs(amount);
        if (amount > user.balance || amount > this.limit) {
            if (amount > user.balance)
                console.error("You don't have enough funds to make this transaction!");
            else
                console.error("You can't deposit more than the limit!");
            return;
        }
        this.amount += amount;
        transactions.push(new Transaction(title, this, months[new Date().getMonth()], new Date().getDate(), amount, false));
        Transaction.updateTransactions();
    }
    withdraw(title, amount) {
        amount = Math.abs(amount);
        if (amount > this.amount) {
            console.error("Not enough funds to make this transaction!");
            return;
        }
        this.amount -= amount;
        transactions.push(new Transaction(title, this, months[new Date().getMonth()], new Date().getDate(), amount, true));
        Transaction.updateTransactions();
        WeeklySpendings.updateSpendings();
        WeeklySpendings.showSpendings();
    }
    changePocketBudget(newLimit) {
        this.limit = newLimit;
    }
    changePocketName(newName) {
        this.title = capitalize(newName);
    }
    static openEditPocketForm(e) {
        editPocketContainer.classList.remove("hidden");
        editPocketNameInput.focus();
        editPocketNameInput.value = e.target.dataset.pocketName;
        editPocketBudgetInput.value = Number(e.target.dataset.pocketBudget);
        Pocket.pocketInEdit = e.target.dataset.pocketName.toLowerCase();
    }
    static saveNewChanges(e) {
        e.preventDefault();
        if (!Pocket.pocketInEdit) return;

        const oldKey = Pocket.pocketInEdit.toLowerCase();
        const newKey = editPocketNameInput.value.toLowerCase();
        const newBudget = Math.floor(Number(editPocketBudgetInput.value));

        if (newBudget < pockets.get(oldKey).amount) {
            console.error(`Sorry, We can't update your limit for ${pockets.get(oldKey).title} Pocket, as Your current amount in this pocket is already exceeding the new limit!`);
            return;
        }
        
        pockets.get(oldKey).changePocketName(newKey);
        pockets.get(oldKey).changePocketBudget(newBudget);

        const pockObj = pockets.get(oldKey);
        pockets.delete(oldKey);
        pockets.set(newKey, pockObj);
        
        Pocket.closeEditPocketForm();
        Pocket.updateAllPockets();
    }
    static deletePocket(e) {
        e.preventDefault();
        pockets.get("main").deposit(`Deleted ${capitalize(Pocket.pocketInEdit)} Pocket!`, pockets.get(Pocket.pocketInEdit).amount);
        pockets.delete(Pocket.pocketInEdit);
        Pocket.closeEditPocketForm();
        Pocket.updateAllPockets();
    }
    static closeEditPocketForm() {
        editPocketContainer.classList.add("hidden");
        Pocket.pocketInEdit = null;
    }
    static openTransferFundsForm() {
        transferFundsContainer.classList.remove("hidden");        
        transferFundsAmountInput.focus();
    }
    static confirmTransferToPocket(e) {
        e.preventDefault();
        
        const transferTo = transferFundsToInput.value;
        const amountToTransfer = Math.floor(Number(transferFundsAmountInput.value));
        
        if (pockets.get("main").amount < amountToTransfer) {
            console.error("You don't have enough funds in Main Pocket to transfer this amount!");
            return;
        }
        if (amountToTransfer + pockets.get(transferTo).amount > pockets.get(transferTo).limit) {
            console.error(`You're exceeding the limit of ${capitalize(transferTo)} Pocket!`);
            return;
        }

        pockets.get("main").withdraw(`Tranfer to ${capitalize(transferTo)}`, amountToTransfer);
        pockets.get(transferTo).deposit(`Deposit from Main Pocket`, amountToTransfer);

        Pocket.updateAllPockets();
        Pocket.closeTransferFundsForm();
    }
    static addPocketOptionsToTransferFundsForm() {
        transferFundsToInput.innerHTML = "";
        Array.from(pockets.keys()).forEach((key) => {
            if (key === "main") return;
            transferFundsToInput.insertAdjacentHTML("beforeend", `<option value="${key}">${capitalize(key)}</option>`);
        });
    }
    static closeTransferFundsForm() {
        transferFundsContainer.classList.add("hidden");
        transferFundsAmountInput.value = "";
    }
    static openNewPocketForm() {
        newPocketFormContainer.classList.remove("hidden");
        newPocketNameInput.focus();
    }
    static addNewPocket(e) {        
        e.preventDefault();
        const newPocketName = newPocketNameInput.value.toLowerCase();
        const newPocketLimit = Math.abs(Number(newPocketLimitInput.value));

        if (pockets.get(newPocketName)) {
            console.error("This name is already assigned to another pocket!");
            return;
        }

        pockets.set(newPocketName, new Pocket(capitalize(newPocketName), newPocketLimit));
        if (newPocketName !== "main") {
            colors.set(newPocketName, themes[themePtr]);
            themePtr = (themePtr+1)%themes.length;
        }
        Pocket.updateAllPockets();
        Pocket.closeNewPocketForm();
    }
    static closeNewPocketForm() {
        newPocketFormContainer.classList.add("hidden");
        newPocketNameInput.value = newPocketLimitInput.value = "";
    }
    static updateAllPockets() {
        pocketsContainer.innerHTML = "";
        for (const [_, pock] of pockets) {
            pock.updateInDOM();
        }        
    }
};

class Account {

    static sendingFromPocket = null;
    static sendingToID = null;
    static sendingAmount = 0;

    constructor(name, currency) {
        this.name = name,
        this.currency = currency,
        this.balanceVisible = false
        this.balance = 0;
    }
    deposit(amount) {
        if (amount <= 0) return;
        this.balance += amount;
        pockets.get("main").deposit("Main Pocket Deposit", amount);
    }
    withdraw(amount, pocket, transactionMessage) {
        if (amount > pockets.get(pocket).amount) {
            console.error(`You don't have enough funds in ${capitalize(pocket)} Pocket to make this transaction!`);
            return;
        }
        this.balance -= amount;
        pockets.get(pocket).withdraw(transactionMessage, amount);
    }
    greet() {
        greetingMessage.textContent = `Welcome, ${this.name}!`;
    } 
    showBalance() {
        if (!this.balanceVisible) return;
        balanceElement.textContent = `Rs ${this.balance}`;
    }
    addFunds() {
        // ==== HARDCODED FOR NOW! ====
            this.deposit(100_000);
        // ============================
        this.updateBalance();
        Pocket.updateAllPockets();
    }
    toggleBalance() {
        this.balanceVisible = !this.balanceVisible;
        this.updateBalance();
    }
    updateBalance() {
        balanceElement.textContent = this.balanceVisible ? `Rs ${format(this.balance)}` : `********`;
    }
    static showSendStage1() {
        Account.addPocketOptionsToSendMoneyForm();
        sendMoneyContainer.classList.remove("hidden");
        sendMoneyStep1Container.classList.remove("hidden");
        sendMoneyRecipeintIDInput.focus();
    }
    static getInputFromSendStage1() {
        const pocket = sendMoneyPocketOptionsInput.value;
        const id = sendMoneyRecipeintIDInput.value;

        if (id === "" || !Account.confirmID(id)) return;
        // if (!Account.confirmID(id)) return;

        [Account.sendingFromPocket, Account.sendingToID] = [pocket, id];
        Account.hideSendStage1();
        Account.showSendStage2();

        console.log(pocket, id);
    }
    static hideSendStage1() {
        sendMoneyStep1Container.classList.add("hidden");
    }
    static showSendStage2() {
        sendMoneyStep2Container.classList.remove("hidden");        
        sendMoneyRecipientName.textContent = capitalize(Account.sendingToID);
    }
    static hideSendStage2() {
        sendMoneyContainer.classList.add("hidden");
        sendMoneyStep2Container.classList.add("hidden");
    }
    static closeSendMoneyForm() {
        Account.hideSendStage1();
        Account.hideSendStage2();
        Account.sendingAmount = 0;
        Account.sendingToID = Account.sendingAmount = null;
        sendMoneyRecipeintIDInput.value = "";
        sendMoneyAmmountInput.value = format(Account.sendingAmount);
    }
    static confirmID(id) {
        // FAKE CONFIRM ID FUNCTION
        return true;
    }
    static sendMoney() {
        if (Account.sendingAmount > pockets.get(Account.sendingFromPocket).amount) {
            console.error(`You don't have enough funds in ${capitalize(Account.sendingFromPocket)} Pocket to make this transaction!`);
            return;
        }
        user.withdraw(Account.sendingAmount, Account.sendingFromPocket, `Sent Money to ${capitalize(Account.sendingToID)}`);
        user.updateBalance();
        Pocket.updateAllPockets();
        Account.closeSendMoneyForm();
    }
    static updateSendingAmount(e) {
        if (e.target.closest(".dialpad-back")) {
            Account.sendingAmount = Math.floor(Account.sendingAmount/10);
        } else if (e.target.classList.contains("dialpad-num")) {
            Account.sendingAmount = (Account.sendingAmount * 10) + Number(e.target.dataset.value);
        }
        sendMoneyAmmountInput.value = format(Account.sendingAmount);
    }
    static addPocketOptionsToSendMoneyForm() {
        sendMoneyPocketOptionsInput.innerHTML = "";
        Array.from(pockets.keys()).forEach((key) => {
            sendMoneyPocketOptionsInput.insertAdjacentHTML("beforeend", `<option value="${key}">${capitalize(key)}</option>`);
        });
    }
};
class Transaction {

    static showAllTransactions = false;

    constructor(title, pocket, month, date, amount, expense, timeStamp = undefined) {
        this.title = title;           
        this.pocket = pocket;           
        this.month = month;           
        this.date = date;           
        this.amount = amount;           
        this.expense = expense;
        this.timeStamp = timeStamp ? timeStamp : Date.now();
    }
    static changeTrasactionsView() {
        Transaction.showAllTransactions = !Transaction.showAllTransactions;
        transactionViewControlButton.textContent = `View ${Transaction.showAllTransactions ? "Few" : "All"} Transactions`;
        Transaction.updateTransactions();
        WeeklySpendings.updateSpendings();
        WeeklySpendings.showSpendings();
    }
    static appendTransaction(transaction) {
        transactionsList.insertAdjacentHTML("afterbegin", `
            <div class="transaction-item">
                <div class="transaction-details">
                    <div class="transaction-icon icon-${colors.get(transaction.pocket.title.toLowerCase())}">
                        <i class="fas fa-money-bill-wave"></i>
                    </div>
                    <div class="transaction-info">
                        <p class="title">${transaction.title}</p>
                        <p class="subtitle">${transaction.pocket.title} Pocket • ${transaction.month} ${transaction.date}</p>
                    </div>
                </div>
                <p class="transaction-amount amount-${transaction.expense ? "debit" : "credit"}">${transaction.expense ? "-" : "+"} ${user.currency} ${format(transaction.amount)}.00</p>
            </div>
        `);
    }
    static updateTransactions() {
        transactionsList.innerHTML = "";
        if (Transaction.showAllTransactions) {
            transactions.forEach(transaction => Transaction.appendTransaction(transaction));
        } else {
            for (let i = Math.max(0, transactions.length-4); i < transactions.length; i++) {
                Transaction.appendTransaction(transactions[i]);
            }
        }
    }

};

class Notification {
    constructor() {}
    static showNotifications() {
        notificationsContainer.classList.remove("hidden");
    }
    static hideNotifications() {
        notificationsContainer.classList.add("hidden");
    }
}


const Calculator =  {

    calculatorContainer: document.getElementById("calculator-panel"),
    calculatorIcon: document.getElementById("calculator-toggle-btn"),
    calculatorCloseButton: document.getElementById("close-calculator-btn"),
    calculatorDialpad: document.querySelector(".calculator-grid"),
    calculatorDisplay: document.querySelector(".calculator-display"),
    expression: "",
    
    show() {
        this.calculatorContainer.style.width = "29vw";
        this.calculatorContainer.style.opacity = "1";
        this.calculatorIcon.classList.add("hidden");
    },
    hide() {
        this.calculatorContainer.style.width = "0vw";
        this.calculatorContainer.style.opacity = "0";
        this.calculatorIcon.classList.remove("hidden");
    },
    updateExpression(e) {
        e.preventDefault();
        if (e.target.closest(".backspace")) {
            this.expression = this.expression.slice(0,-1);
        } else if (e.target.closest(".all-clear")) {
            this.expression = "";            
        } else if (e.target.closest(".equate")) {
            this.expression = this.solve(this.expression);
            this.expression = String(Math.floor(Number(this.expression)));
        } else if (e.target.closest(".expression")) {
            this.expression += e.target.dataset.value;
        }
        this.calculatorDisplay.textContent = this.expression;
    },
    solve(expression) {
        expression += '+';
        let left = "", start = 0, right = "", op = "";
    
        for (const c of expression) {
            if (!isFinite(Number(c)))
                break;
            start++;
            left += c;
        }
        if (start >= expression.length)
            return left;
    
        op = expression[start];
    
        for (let i = start+1; i < expression.length; i++) {
            if (!isFinite(Number(expression[i]))) {
                if (op === '+') {
                    left = String(Number(left) + Number(right));
                } else if (op == '-') {
                    left = String(Number(left) - Number(right));
                } else if (op == '*') {
                    left = String(Number(left) * Number(right));
                } else if (op == '/') {
                    left = String(Number(left) / Number(right));
                } else if (op == '%') {
                    left = String(Number(left) % Number(right));
                }
                right = "";
                op = expression[i];
            } else {
                right += expression[i];
            }
        }
        return left;
    }    
};


let WeeklySpendings = {
    currDate: (Date.now() - Date.now()%DAY + DAY - 10),
    startOfWeek: new Date((Date.now() - (Date.now()%DAY) + DAY - 10) -  6*DAY),
    endOfWeek: new Date((Date.now() - (Date.now()%DAY) + DAY - 10)),
    dateContainer: document.getElementById("week-range-label"),
    spendingsList: document.getElementById("spending-list-container"),
    arrowsContainer: document.querySelector(".spending-nav"),
    spendings: {}, 
    totalExpense: 0,

    changeWeek(e) {
        if (e.target.closest("#prev-week-btn")) {            
            this.currDate -= 7*DAY;      
        } else if (e.target.closest("#next-week-btn")) {
            this.currDate += 7*DAY;      
        } else {
            return;
        }
        this.startOfWeek = new Date(this.currDate - 6*DAY);
        this.endOfWeek = new Date(this.currDate);
        this.updateDates();
        this.updateSpendings();
        this.showSpendings();
    },
    updateDates() {
        this.dateContainer.textContent = `${months[this.startOfWeek.getUTCMonth()]} ${this.startOfWeek.getUTCDate()} - ${months[this.endOfWeek.getUTCMonth()]} ${this.endOfWeek.getUTCDate()}`;
    },
    updateSpendings() {
        this.spendings = {};
        this.totalExpense = 0;
        for (const [key, _] of pockets) {
            this.spendings[key] = 0;
        }
        transactions
        .filter(transaction => transaction.expense && transaction.timeStamp >= this.startOfWeek.getTime() && transaction.timeStamp <= this.endOfWeek.getTime())
        .forEach(transaction => {
            this.totalExpense += transaction.amount;
            this.spendings[transaction.pocket.title.toLowerCase()] += transaction.amount;
        });
    },
    showSpendings() {
        this.spendingsList.innerHTML = "";
        for (const [pocketName, amount] of Object.entries(this.spendings)) {
            if (amount === 0) continue;
            this.spendingsList.insertAdjacentHTML("beforeend", `
                <div class="spending-theme-${colors.get(pocketName)}">
                    <div class="spending-item-header">
                        <span class="spending-item-category"><i class="fas fa-tag"></i>${capitalize(pocketName)}</span>
                        <span class="spending-item-amount">Rs ${amount}</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar" style="width: ${amount/this.totalExpense * 100}%;"></div>
                    </div>
                </div>
            `);
        }
        if (this.spendingsList.innerHTML === "") {
            this.spendingsList.insertAdjacentHTML("beforeend", `<div class="no-spendings-message"> No spendings this week! </div>`);
        }
    }
};


const Data = {
    save() {        
        localStorage.setItem("user", JSON.stringify(user));
        localStorage.setItem("transactions", JSON.stringify(transactions));
        localStorage.setItem("pockets", JSON.stringify([...pockets]));
        localStorage.setItem("notifications", JSON.stringify(notifications));
        localStorage.setItem("colors", JSON.stringify([...colors]));
        localStorage.setItem("themePtr", JSON.stringify(themePtr));
    },
    retrieve() {

        const userObj = JSON.parse(localStorage.getItem("user"));
        user = new Account(userObj?.name ?? "Umair", userObj?.currency ?? "Rs");
        user.balance = userObj?.balance ?? 0;
        user.balanceVisible = userObj?.balanceVisible ?? false;

        const prevPockets = new Map(JSON.parse(localStorage.getItem("pockets")));
        if (prevPockets) {
            for (const [key, pocket] of prevPockets) {
                pockets.set(key, new Pocket(pocket.title, pocket.limit));
                pockets.get(key).amount = pocket.amount;
            }
        }

        transactions = [];
        const prevTransactions = JSON.parse(localStorage.getItem("transactions"));
        if (prevTransactions) {
            for (const trans of prevTransactions) {
                transactions.push(new Transaction(trans.title, new Pocket(trans.pocket.title, trans.pocket.limit), trans.month, trans.date, trans.amount, trans.expense, trans.timeStamp));
            }
        }

        /* ======== NEEDS TO GET UPDATED AFTER FINIALIZING NOTIFICATIONS FEATURE ======== */
        const prevNotifications = JSON.parse(localStorage.getItem("notifications"));
        if (prevNotifications) {
            for (const _ of prevNotifications) {
                notifications.push(new Notification());
            }
        }

        colors = new Map(JSON.parse(localStorage.getItem("colors")) ?? []);
        colors.set("main", "red");
        themePtr = JSON.parse(localStorage.getItem("themePtr")) ?? 0;

        user.updateBalance();
        Pocket.updateAllPockets();
    }
}


/* ============== INITIALIZER FUNCTION ====================== */

function init() {


    pockets.set("main", new Pocket("Main", Number.MAX_SAFE_INTEGER));
    user = new Account("Umair", "Rs");
    user.greet();
    Data.retrieve();
    WeeklySpendings.updateDates();
    Transaction.updateTransactions();
    WeeklySpendings.updateSpendings();
    WeeklySpendings.showSpendings();

    
    // ==========    ADDING EVENT LISTENERS    ========

    pocketsContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("transfer-pocket-btn")) {
            Pocket.openTransferFundsForm();
            Pocket.addPocketOptionsToTransferFundsForm();
        } else if (e.target.classList.contains("manage-pocket-btn")) {
            Pocket.openEditPocketForm(e);
        }
    });

    editPocketCloseButton.addEventListener("click", Pocket.closeEditPocketForm);
    editPocketSaveButton.addEventListener("click", Pocket.saveNewChanges);
    editPocketDeleteButton.addEventListener("click", Pocket.deletePocket);

    newPocketAddButton.addEventListener("click", Pocket.openNewPocketForm);
    newPocketFormCloseButton.addEventListener("click", Pocket.closeNewPocketForm);
    newPocketCreateButton.addEventListener("click", Pocket.addNewPocket);
    
    transferFundsCloseButton.addEventListener("click", Pocket.closeTransferFundsForm);
    transferFundsCofirmButton.addEventListener("click", Pocket.confirmTransferToPocket);

    sendMoneyButton.addEventListener("click", Account.showSendStage1);
    sendMoneyCloseButton.addEventListener("click", Account.closeSendMoneyForm);
    sendMoneyDialpad.addEventListener("click", Account.updateSendingAmount);
    sendMoneyConfirmCredentialsButton.addEventListener("click", Account.getInputFromSendStage1);
    sendMoneyConfirmSendButton.addEventListener("click", Account.sendMoney);

    
    addFundsButton.addEventListener("click", () => user.addFunds());
    toggleBalanceVisibilityButton.addEventListener("click", () => user.toggleBalance());
    transactionViewControlButton.addEventListener("click", Transaction.changeTrasactionsView);

    Calculator.calculatorIcon.addEventListener("click", Calculator.show.bind(Calculator));
    Calculator.calculatorCloseButton.addEventListener("click", Calculator.hide.bind(Calculator));
    Calculator.calculatorDialpad.addEventListener("click", Calculator.updateExpression.bind(Calculator));
    
    notificationsIcon.addEventListener("click", Notification.showNotifications);
    notificationsCloseButton.addEventListener("click", Notification.hideNotifications);

    document.body.addEventListener("click", Data.save);
    WeeklySpendings.arrowsContainer.addEventListener("click", (e) => WeeklySpendings.changeWeek(e));
}

init();