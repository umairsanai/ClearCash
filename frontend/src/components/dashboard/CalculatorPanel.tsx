import { useState } from "react";

interface CalculatorPanelProps {
  open: boolean;
  onClose: () => void;
}

const BUTTONS = [
  ["back", "⌫", "btn-util"],
  ["clear", "AC", "btn-util"],
  ["%", "%", "btn-util"],
  ["/", "÷", "btn-op"],
  ["7", "7", "btn-num"],
  ["8", "8", "btn-num"],
  ["9", "9", "btn-num"],
  ["*", "x", "btn-op"],
  ["4", "4", "btn-num"],
  ["5", "5", "btn-num"],
  ["6", "6", "btn-num"],
  ["-", "-", "btn-op"],
  ["1", "1", "btn-num"],
  ["2", "2", "btn-num"],
  ["3", "3", "btn-num"],
  ["+", "+", "btn-op"],
] as const;

function calculate(expression: string) {
  const tokens = expression.match(/\d+(?:\.\d+)?|[+\-*/%]/g) ?? [];
  if (!tokens.length) return "";

  let result = Number(tokens[0]);

  for (let index = 1; index < tokens.length; index += 2) {
    const operator = tokens[index];
    const value = Number(tokens[index + 1]);
    if (Number.isNaN(value)) return expression;

    if (operator === "+") result += value;
    if (operator === "-") result -= value;
    if (operator === "*") result *= value;
    if (operator === "/") result /= value;
    if (operator === "%") result %= value;
  }

  return String(Math.floor(result));
}

export function CalculatorPanel({ open, onClose }: CalculatorPanelProps) {
  const [expression, setExpression] = useState("");

  function pressButton(value: string) {
    if (value === "back") {
      setExpression((current) => current.slice(0, -1));
      return;
    }

    if (value === "clear") {
      setExpression("");
      return;
    }

    setExpression((current) => `${current}${value}`);
  }

  return (
    <div
      id="calculator-panel"
      className="no-scrollbar"
      style={{ width: open ? "29vw" : 0, opacity: open ? 1 : 0 }}
    >
      <div className="calculator-content">
        <div className="calculator-header">
          <button type="button" onClick={onClose}>
            <i className="fas fa-times" />
          </button>
        </div>
        <div className="calculator-display no-scrollbar">
          {expression || "0"}
        </div>
        <div className="calculator-grid">
          {BUTTONS.map(([value, label, className]) => (
            <button
              key={value}
              type="button"
              className={`${className} expression`}
              onClick={() => pressButton(value)}
            >
              {label}
            </button>
          ))}
          <button
            type="button"
            className="expression btn-num col-span-2"
            onClick={() => pressButton("0")}
          >
            0
          </button>
          <button
            type="button"
            className="equate btn-op"
            onClick={() => setExpression(calculate(expression))}
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
}
