const display = document.getElementById("inputString");
const errorLabel = document.getElementById("error");
const keypad = document.getElementById("keypad");
const resetButton = document.querySelector('[data-action="reset"]');

const MAX_DIGITS = 12;
const OPERATORS = ["+", "-", "*", "/"];
const INVALID_RESULTS = ["Infinity", "-Infinity", "NaN", "Error"];

const isOperator = (char) => OPERATORS.includes(char);
const isInvalidResult = (value) => INVALID_RESULTS.includes(value);

const setDisplay = (value) => {
  const text = String(value).slice(0, MAX_DIGITS);
  display.value = text;
  display.scrollLeft = display.scrollWidth;
  errorLabel.style.display = text.length >= MAX_DIGITS ? "inline" : "none";
};

const appendValue = (value) => {
  const current = display.value;

  if (isInvalidResult(current)) {
    setDisplay(isOperator(value) ? "0" + value : value);
    return;
  }

  if (isOperator(value)) {
    // disallow leading operators except minus (for negative numbers)
    if (current === "0" && value !== "-") return;
    if (isOperator(current.slice(-1))) {
      setDisplay(current.slice(0, -1) + value);
      return;
    }
    setDisplay(current + value);
    return;
  }

  // replace the leading zero with the typed digit
  if (current === "0") {
    setDisplay(value);
    return;
  }

  setDisplay(current + value);
};

const clearLast = () => {
  const current = display.value;
  if (isInvalidResult(current) || current.length <= 1) {
    setDisplay("0");
    return;
  }
  setDisplay(current.slice(0, -1));
};

const resetAll = () => setDisplay("0");

const applyOperation = (left, right, operator) => {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default:  return right;
  }
};

const formatResult = (value) => {
  if (!Number.isFinite(value)) return "Error";
  // trim long decimals to fit the display
  const text = String(value);
  if (text.length <= MAX_DIGITS) return text;
  return value.toPrecision(MAX_DIGITS - 2).replace(/\.?0+(e|$)/, "$1");
};

const calculate = () => {
  const expression = display.value;

  if (isInvalidResult(expression)) {
    setDisplay("0");
    return;
  }
  if (isOperator(expression.slice(-1))) {
    setDisplay(expression.slice(0, -1) || "0");
    return;
  }

  let accumulator = null;
  let pendingOperator = null;
  let currentNumber = "";

  for (let i = 0; i < expression.length; i++) {
    const char = expression[i];

    // treat leading minus and a minus right after an operator as a sign, not an op
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
  const result = accumulator === null ? lastValue : applyOperation(accumulator, lastValue, pendingOperator);

  setDisplay(formatResult(result));
};

keypad.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-value], button[data-action]");
  if (!button) return;

  if (button.dataset.action === "equals") return calculate();
  if (button.dataset.action === "clear") return clearLast();
  appendValue(button.dataset.value);
});

resetButton.addEventListener("click", resetAll);

document.addEventListener("keydown", (event) => {
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