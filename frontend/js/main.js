// main.js — calculator UI
import {
  MAX_DIGITS,
  isOperator,
  isInvalidResult,
  applyOperation,
  formatResult,
} from "./utils.js";
import { syncApi } from "./api.js";
import { historyStore } from "./storage.js";

const display = document.getElementById("inputString");
const errorLabel = document.querySelector(".display__error");
const keypad = document.getElementById("keypad");
const resetButton = document.querySelector('[data-action="reset"]');

const setDisplay = (value) => {
  const text = String(value).slice(0, MAX_DIGITS);
  display.textContent = text;
  display.scrollLeft = display.scrollWidth;
  errorLabel.style.display = text.length >= MAX_DIGITS ? "inline" : "none";
};

const appendValue = (value) => {
  const current = display.textContent.trim();

  if (isInvalidResult(current)) {
    setDisplay(isOperator(value) ? "0" + value : value);
    return;
  }

  if (isOperator(value)) {
    if (current === "0" && value !== "-") return;
    if (isOperator(current.slice(-1))) {
      setDisplay(current.slice(0, -1) + value);
      return;
    }
    setDisplay(current + value);
    return;
  }

  if (current === "0") {
    setDisplay(value);
    return;
  }
  setDisplay(current + value);
};

const clearLast = () => {
  const current = display.textContent.trim();
  if (isInvalidResult(current) || current.length <= 1) {
    setDisplay("0");
    return;
  }
  setDisplay(current.slice(0, -1));
};

const resetAll = () => setDisplay("0");

const calculate = async () => {
  const expression = display.textContent.trim();
  if (isInvalidResult(expression)) { setDisplay("0"); return; }
  if (isOperator(expression.slice(-1))) {
    setDisplay(expression.slice(0, -1) || "0");
    return;
  }

  let accumulator = null;
  let pendingOperator = null;
  let currentNumber = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];
    const isUnaryMinus = char === "-" && (i === 0 || isOperator(expression[i - 1]));
    if (isOperator(char) && !isUnaryMinus) {
      const value = parseFloat(currentNumber);
      accumulator = accumulator === null ? value : applyOperation(accumulator, value, pendingOperator);
      pendingOperator = char;
      currentNumber = "";
    } else {
      currentNumber += char;
    }
  }

  const lastValue = parseFloat(currentNumber);
  const rawResult = accumulator === null
    ? lastValue
    : applyOperation(accumulator, lastValue, pendingOperator);
  const formattedResult = formatResult(rawResult, MAX_DIGITS);

  setDisplay(formattedResult);

  if (isInvalidResult(formattedResult)) return;

  // Always remember locally; if signed in, push to cloud and mark synced.
  if (syncApi.isSignedIn()) {
    const res = await syncApi.addCalculation(expression, formattedResult);
    historyStore.add(expression, formattedResult, res.ok);
  } else {
    historyStore.add(expression, formattedResult, false);
  }
};

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value], button[data-action]");
  if (!button) return;
  if (button.dataset.action === "equals") return calculate();
  if (button.dataset.action === "clear") return clearLast();
  appendValue(button.dataset.value);
});

if (resetButton) resetButton.addEventListener("click", resetAll);

document.addEventListener("keydown", (event) => {
  const target = event.target;
  if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;
  const { key } = event;
  if (/^[0-9]$/.test(key) || isOperator(key)) {
    appendValue(key);
  } else if (key === "Enter" || key === "=") {
    event.preventDefault();
    calculate();
  } else if (key === "Backspace") {
    clearLast();
  } else if (key === "Escape") {
    resetAll();
  }
});