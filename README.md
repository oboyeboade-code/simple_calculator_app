# Simple Calculator

A sleek, responsive web-based calculator built with vanilla HTML, CSS, and JavaScript. This project features a modern dark-themed interface with a 12-digit display and basic arithmetic capabilities.

## Features

- **Basic Arithmetic**: Supports addition, subtraction, multiplication, and division.
- **12-Digit Display**: Limits input to 12 digits to maintain layout integrity, with a visual warning when the limit is reached.
- **Responsive Design**: Fully optimized for various screen sizes, from mobile devices to desktops.
- **Modern UI**: A clean, dark-themed aesthetic with intuitive button layouts and smooth transitions.
- **Error Handling**: Gracefully handles mathematical anomalies like `Infinity` and `NaN`.
- **Reset & Clear**: Includes a dedicated "D" (Delete/Backspace) button and a "RESET" function to clear the display.

## Technical Implementation

- **Vanilla JavaScript**: Logic is implemented without external libraries, using a custom parser to evaluate expressions sequentially.
- **CSS Flexbox & Grid**: Utilizes modern CSS layout techniques for centering and responsiveness.
- **Media Queries**: Custom breakpoints ensure the calculator remains usable on small screens.

## Note on Calculation Logic

This calculator processes operations sequentially as they are entered and **does not follow BODMAS/PEMDAS** rules. For example, `2 + 3 * 4` will be calculated as `(2 + 3) * 4 = 20`.

## How to Use

1. Clone the repository.
2. Open `index.html` in any modern web browser.
3. Start calculating!

## Project Structure

```text
simpleCalculator/
├── index.html      # Structure and layout
├── index.css       # Styling and responsiveness
├── index.js        # Calculation logic and interactivity
└── calculator.png  # Project icon
```

## License

This project is open-source and available under the [MIT License](LICENSE).

