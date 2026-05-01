import { API_URL, request, format, fetchUser } from "./helpers.js";
import { showBalance } from "./user.js";
import { updatePockets } from "./pockets.js";

const sendMoneyButton = document.getElementById("send-money-btn");
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
const matchingContactsList = document.querySelector(".matching-contacts-list-container");

const WAIT_PERIOD_FOR_RECIPIENT_SEARCH_CALL = 0.5;    // (seconds)

let findUserTimeoutID = null;
let sendingPocket = null, recipientID = null, recipientName = null;
let sendingAmount = 0;
let matchingContacts = [];





/* ===============    Sending Money    =============== */




function showSendStage1() {
    addPocketOptionsToSendMoneyForm();
    sendMoneyContainer.classList.remove("hidden");
    sendMoneyStep1Container.classList.remove("hidden");
    sendMoneyRecipeintIDInput.focus();
}

function hideSendStage1() {
    sendMoneyStep1Container.classList.add("hidden");
}

function showSendStage2() {
    sendMoneyStep2Container.classList.remove("hidden");        
    sendMoneyRecipientName.textContent = recipientName;
}

function hideSendStage2() {
    sendMoneyContainer.classList.add("hidden");
    sendMoneyStep2Container.classList.add("hidden");
}

function getRecipients() {
    if (findUserTimeoutID) {
        clearTimeout(findUserTimeoutID);
        findUserTimeoutID = null;
    }
    if (!sendMoneyRecipeintIDInput.value) {
        matchingContacts = [];
        updateMatchingContactsList();
        return;
    }
    findUserTimeoutID = setTimeout(async () => {
        matchingContacts = await request(`${API_URL}/users/find?search=${sendMoneyRecipeintIDInput.value}`, {
            method: "GET",
            credentials: "include"
        });
        updateMatchingContactsList();
    }, WAIT_PERIOD_FOR_RECIPIENT_SEARCH_CALL * 1000);
}

function selectRecipient(event) {
    recipientName = event.target.closest(".contact-item").dataset.recipient_name;
    recipientID = event.target.closest(".contact-item").dataset.recipient_id;
    sendingPocket = +sendMoneyPocketOptionsInput.value;
    hideSendStage1();
    showSendStage2();
}

function updateMatchingContactsList() {
    matchingContactsList.innerHTML = "";
    matchingContacts.forEach(recipient => {
        matchingContactsList.insertAdjacentHTML("beforeend", `
            <li data-recipient_id="${recipient.user_id}" data-recipient_name="${recipient.name}" class="contact-item">
                    <div class="contact-info">
                    <div class="contact-icon">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <div>
                        <p class="name">${recipient.name}</p>
                        <p class="handle">${recipient.username}</p> 
                    </div>
                </div>
                <i class="fas fa-chevron-right"></i>
            </li>
        `);
    })
}


function addPocketOptionsToSendMoneyForm() {
    sendMoneyPocketOptionsInput.innerHTML = "";

    // First insert "Main" pocket
    window.user.pockets.forEach((pocket) => {
        if (pocket.pocket_name === "Main")
            sendMoneyPocketOptionsInput.insertAdjacentHTML("beforeend", `<option value="${pocket.pocket_id}">${pocket.pocket_name}</option>`);
    });    
    // Then insert other pockets
    window.user.pockets.forEach((pocket) => {
        if (pocket.pocket_name === "Main") return;
        sendMoneyPocketOptionsInput.insertAdjacentHTML("beforeend", `<option value="${pocket.pocket_id}">${pocket.pocket_name}</option>`);
    });
}

function updateSendingAmount(e) {
    if (e.target.closest(".dialpad-back")) {
        sendingAmount = Math.floor(sendingAmount/10);
    } else if (e.target.classList.contains("dialpad-num")) {
        sendingAmount = (sendingAmount * 10) + Number(e.target.dataset.value);
    }
    sendMoneyAmmountInput.value = format(sendingAmount);
}

async function sendMoney() {
    if (!recipientID || !recipientName || !sendingAmount)
        return;

    try {
        
        await request(`${API_URL}/users/send`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender_pocket_id: +sendingPocket,
                recipient_user_id: +recipientID,
                amount: +sendingAmount
            }),
            credentials: "include"
        });
        window.user = await fetchUser();

    } catch (error) {
        alert("Error: Transaction Failed - Couldn't Send Money!");
    }
    
    showBalance();
    updatePockets();
    closeSendMoneyForm();
}

function closeSendMoneyForm() {
    hideSendStage1();
    hideSendStage2();
    sendingAmount = 0;
    recipientName = recipientID = sendingPocket;
    sendMoneyRecipeintIDInput.value = "";
    sendMoneyAmmountInput.value = sendingAmount;
}




/* ===============    Event Handlers    =============== */





sendMoneyButton.addEventListener("click", showSendStage1);
sendMoneyDialpad.addEventListener("click", updateSendingAmount);
sendMoneyRecipeintIDInput.addEventListener("keyup", getRecipients);
sendMoneyConfirmSendButton.addEventListener("click", sendMoney);
sendMoneyCloseButton.addEventListener("click", closeSendMoneyForm);
matchingContactsList.addEventListener("click", selectRecipient);