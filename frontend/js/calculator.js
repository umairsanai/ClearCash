const calculatorContainer = document.getElementById("calculator-panel");
const calculatorIcon = document.getElementById("calculator-toggle-btn");
const calculatorCloseButton = document.getElementById("close-calculator-btn");
const calculatorDialpad = document.querySelector(".calculator-grid");
const calculatorDisplay = document.querySelector(".calculator-display");
let expression = "";




/* ===============    Functions    =============== */


    

function showCalculator() {
    calculatorContainer.style.width = "29vw";
    calculatorContainer.style.opacity = "1";
    calculatorIcon.classList.add("hidden");
}
function hideCalculator() {
    calculatorContainer.style.width = "0vw";
    calculatorContainer.style.opacity = "0";
    calculatorIcon.classList.remove("hidden");
}
function updateExpression(e) {
    e.preventDefault();
    if (e.target.closest(".backspace")) {
        expression = expression.slice(0,-1);
    } else if (e.target.closest(".all-clear")) {
        expression = "";            
    } else if (e.target.closest(".equate")) {
        expression = solve(expression);
        expression = String(Math.floor(Number(expression)));
    } else if (e.target.closest(".expression")) {
        expression += e.target.dataset.value;
    }
    calculatorDisplay.textContent = expression;
}
function solve(expression) {
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




/* ===============    Event Listeners    =============== */





calculatorIcon.addEventListener("click", showCalculator);
calculatorCloseButton.addEventListener("click", hideCalculator);
calculatorDialpad.addEventListener("click", updateExpression);