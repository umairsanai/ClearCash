import { API_URL, convertInSnakeCase, fetchUser, request, format, fetchPockets } from "./helpers.js";

let pocketInEdit = null
const pocketsContainer = document.querySelector(".pocket-grid");
const editPocketContainer = document.getElementById("manage-pocket-modal");
const editPocketNameInput = document.getElementById("pocket-name-input");
const editPocketBudgetInput = document.getElementById("pocket-budget-input");
const editPocketColorInput = document.getElementById("pocket-color-input");
const editPocketCloseButton = document.getElementById("close-manage-modal-btn");
const editPocketSaveButton = document.getElementById("save-pocket-btn");

const transferFundsContainer = document.getElementById("transfer-funds-modal");
const transferFundsToInput = document.getElementById("transfer-to-pocket");
const transferFundsAmountInput = document.getElementById("transfer-amount-input");
const transferFundsCofirmButton = document.getElementById("confirm-transfer-btn");
const transferFundsCloseButton = document.getElementById("close-transfer-modal-btn");

const newPocketFormContainer = document.getElementById("add-pocket-modal");
const newPocketNameInput = document.getElementById("new-pocket-name-input");
const newPocketLimitInput = document.getElementById("new-pocket-budget-input");
const newPocketColorInput = document.getElementById("new-pocket-color-input");
const newPocketAddButton = document.getElementById("add-pocket-btn");
const newPocketFormCloseButton = document.getElementById("close-add-modal-btn");
const newPocketCreateButton = document.getElementById("create-pocket-btn");
const editPocketDeleteButton = document.getElementById("delete-pocket-btn");




/* ===============    Update Pockets in DOM    =============== */




export function updatePockets() {
    pocketsContainer.innerHTML = "";
    insertPocketInDOM(window.user.pockets.find(pock => pock.pocket_name === "Main"));
    for (const pocket of window.user.pockets) {
        if (pocket.pocket_name === "Main") continue;
        insertPocketInDOM(pocket);
    }
}
export function closeEditPocketForm() {
    editPocketContainer.classList.add("hidden");
    pocketInEdit = null;
}

function insertPocketInDOM(pocket) {
    const lowercaseTitle = pocket.pocket_name.toLowerCase();
    pocketsContainer.insertAdjacentHTML("beforeend",
        `<div data-pocket_id=${pocket.pocket_id} class="pocket-card pocket-theme-${pocket.color.toLowerCase()}">
            <div class="pocket-card-header">
                <i class="fas fa-archive"></i>
                <span>${pocket.pocket_name}</span>
            </div>
            <p id="pocket-${convertInSnakeCase(pocket.pocket_name)}-balance" class="pocket-card-balance">Rs ${format(pocket.pocket_balance)}</p>
            ${
                pocket.pocket_name === "Main" ? "" :
                `<div class="progress-bar-container">
                    <div id="pocket-${lowercaseTitle}-progress" class="progress-bar" style="width: ${(pocket.pocket_balance/pocket.pocket_limit) * 100}%;"></div>
                </div>
                <p id="pocket-${lowercaseTitle}-info" class="pocket-card-info">Rs ${format(pocket.pocket_balance)} left of ${format(pocket.pocket_limit)}</p>`
            }
            <button class="pocket-card-action ${pocket.pocket_name === "Main" ? " transfer" : "manage"}-pocket-btn" ${pocket.pocket_name === "Main" ? "" : `data-pocket_name="${pocket.pocket_name}" data-pocket_limit="${pocket.pocket_limit}" data-pocket_color="${pocket.color}"`}>
                ${pocket.pocket_name === "Main" ? "Transfer Funds" : "Manage"}
            </button>
    </div>`);
}





/* ===============    Transfer Funds Between Pockets    =============== */




function openTransferFundsForm() {
    transferFundsContainer.classList.remove("hidden");        
    transferFundsAmountInput.focus();
}

function closeTransferFundsForm() {
    transferFundsContainer.classList.add("hidden");
    transferFundsAmountInput.value = "";
}

function addPocketOptionsToTransferFundsForm() {
    transferFundsToInput.innerHTML = "";
    window.user.pockets.forEach((pocket) => {
        if (pocket.pocket_name === "Main") return;
        transferFundsToInput.insertAdjacentHTML("beforeend", `<option value="${pocket.pocket_id}">${pocket.pocket_name}</option>`);
    });
}

async function confirmTransferToPocket(e) {
    e.preventDefault();    
    const transferTo = +transferFundsToInput.value;
    const amountToTransfer = +transferFundsAmountInput.value;
    const mainPocketID = window.user.pockets.find(pock => pock.pocket_name === "Main")?.pocket_id;
        
    if (!amountToTransfer || !Number.isInteger(amountToTransfer))
        return alert("Please enter an Interger amount!");

    try {

        await request(`${API_URL}/users/transfer-to-pocket`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                sender_pocket: mainPocketID,
                receiver_pocket: transferTo,
                amount: amountToTransfer
            }),
            credentials: "include"
        });
        window.user.pockets = await fetchPockets();
        updatePockets();

    } catch (error) {
        alert("Couldn't transfer money");
        throw error;
    }

    closeTransferFundsForm();
}





/* ===============    Edit / Delete Pocket    =============== */



function openEditPocketForm(e) {
    editPocketContainer.classList.remove("hidden");
    editPocketNameInput.focus();
    editPocketNameInput.value = e.target.dataset.pocket_name;
    editPocketBudgetInput.value = Number(e.target.dataset.pocket_limit);
    editPocketColorInput.value = e.target.dataset.pocket_color;
    pocketInEdit = e.target.dataset.pocket_name;
}

async function deletePocket(e) {
    e.preventDefault();
    const selected_pocket = window.user.pockets.find(pocket => pocket.pocket_name === pocketInEdit);
    const pocket_id = selected_pocket?.pocket_id;

    
    try {
        
        await fetch(`${API_URL}/pockets/delete/${pocket_id}`, {
            method: 'DELETE',
            credentials: "include"
        });
        window.user.pockets = await fetchPockets();
        updatePockets();        

    } catch (error) {
        alert("Couldn't delete the pocket!", 400);
        throw error;
    }

    closeEditPocketForm();
}

async function submitEditPocketForm(e) {
    e.preventDefault();
    if (!pocketInEdit) return;

    const old_pocket_name = pocketInEdit;
    const new_pocket_name = editPocketNameInput.value;
    const new_pocket_limit = Math.floor(+editPocketBudgetInput.value);
    const new_pocket_color = editPocketColorInput.value;
    let updatedPocket;
    
    if (!new_pocket_name || !new_pocket_limit || !new_pocket_color) 
        return alert("Please enter full data!");

    try {
 
        updatedPocket = await request(`${API_URL}/pockets/update`, {
            method: "PATCH",
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({
                old_pocket_name,
                new_pocket_name,
                new_pocket_limit,
                new_pocket_color
            }),
            credentials: "include"
        })
        window.user.pockets = await fetchPockets(); 
        updatePockets();
 
    } catch (error) {
        alert("Error: Couldn't Edit Pocket.");
        throw error;
    }

    closeEditPocketForm();
}





/* ===============    Create New Pocket    =============== */





function openNewPocketForm() {
    newPocketFormContainer.classList.remove("hidden");
    newPocketNameInput.focus();
}

function closeNewPocketForm() {
    newPocketFormContainer.classList.add("hidden");
    newPocketNameInput.value = newPocketLimitInput.value = "";
}

async function createNewPocket(e) {        
    e.preventDefault();
    const newPocketName = newPocketNameInput.value;
    const newPocketLimit = Math.abs(Number(newPocketLimitInput.value));
    const newPocketColor = newPocketColorInput.value; 
    let newPocket;

    if (!newPocketName || !newPocketLimit || !newPocketColor) 
        return alert("Please enter full details!");

    try {
        
        newPocket = await request(`${API_URL}/pockets/create`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'  
            },
            body: JSON.stringify({
                pocket_name: newPocketName, 
                pocket_limit: newPocketLimit, 
                color: newPocketColor
            }),
            credentials: "include"
        });
        window.user.pockets.push(newPocket);
        updatePockets();

    } catch (error) {
        alert("Error: Couldn't Add new Pocket!");
        throw error;
    }        

    closeNewPocketForm();
}





/* ===============    Event Listeners    =============== */




transferFundsCloseButton.addEventListener("click", closeTransferFundsForm);
transferFundsCofirmButton.addEventListener("click", confirmTransferToPocket);

newPocketAddButton.addEventListener("click", openNewPocketForm);
newPocketFormCloseButton.addEventListener("click", closeNewPocketForm);
newPocketCreateButton.addEventListener("click", createNewPocket);

editPocketSaveButton.addEventListener("click", submitEditPocketForm);
editPocketCloseButton.addEventListener("click", closeEditPocketForm);
editPocketDeleteButton.addEventListener("click", deletePocket);

pocketsContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("transfer-pocket-btn")) {
        openTransferFundsForm();
        addPocketOptionsToTransferFundsForm();
    } else if (e.target.classList.contains("manage-pocket-btn")) {
        openEditPocketForm(e);
    }
});