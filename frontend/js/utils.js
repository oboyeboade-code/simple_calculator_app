// utils.js
export const MAX_DIGITS = 12;
export const OPERATORS = ["+", "-", "*", "/"];
export const INVALID_RESULTS = ["Infinity", "-Infinity", "NaN", "Error"];

export const isOperator = (char) => OPERATORS.includes(char);
export const isInvalidResult = (value) => INVALID_RESULTS.includes(value);

export const applyOperation = (left, right, operator) => {
  switch (operator) {
    case "+": return left + right;
    case "-": return left - right;
    case "*": return left * right;
    case "/": return right === 0 ? NaN : left / right;
    default:  return right;
  }
};

export const formatResult = (value, maxDigits = 12) => {
  if (!Number.isFinite(value)) return "Error";
  const text = String(value);
  if (text.length <= maxDigits) return text;
  return value.toPrecision(maxDigits - 2).replace(/\.?0+(e|$)/, "$1");
};
