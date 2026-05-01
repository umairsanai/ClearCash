"use strict";
import { fetchUser } from "./helpers.js";
import { greet, showBalance } from "./user.js";
import { updatePockets } from "./pockets.js";
import { updateDates, updateSpendings, showSpendings } from "./spendings.js";
import { updateTransactions } from "./transactions.js";
import "./calculator.js";
import "./notifications.js"
import "./account.js"


window.user = await fetchUser();
greet();
showBalance();
updatePockets();

updateDates();
updateSpendings();
showSpendings();
updateTransactions();