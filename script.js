$(function () {
  console.log("Hi, I'm klpod221");

  const btnClear = $(".calc-button--clear");
  const btnSign = $(".calc-button--sign");
  const btnPercent = $(".calc-button--percent");
  const btnBack = $(".calc-button--backspace");

  const btnNumbers = $(".calc-button--number");
  const btnOperators = $(".calc-button--operator");

  const btnEqual = $(".calc-button--equal");

  const operand = $(".operand");
  const expression = $(".expression");

  // when operand value is changed, change font size
  const changeFontSize = () => {
    if (operand.text().length > 9) {
      operand.addClass("over");
    } else {
      operand.removeClass("over");
    }
  };

  const observer = new MutationObserver(changeFontSize);
  observer.observe(operand[0], { childList: true });

  let numbers = [];
  let operators = [];
  let isCalculated = false;

  const push = (number, operator) => {
    numbers.push(parseFloat(number));
    operators.push(operator);
  }

  const addNumber = (number) => {
    if (operand.text() === "0") {
      operand.text(number);
    } else {
      // when operand value is over 13 digits, return
      if (operand.text().length > 12) {
        return;
      }

      operand.text(operand.text() + number);
    }

    if (isCalculated) {
      isCalculated = false;
      operand.text(number);
    }
  };

  const addOperator = (operator) => {
    if (isCalculated) {
      isCalculated = false;
    } else if (operand.text() === "0") {
      return;
    }

    if (expression.text() === "") {
      expression.text(operand.text() + operator);
      push(operand.text(), operator);
      operand.text("0");
    } else {
      expression.text(expression.text() + operand.text() + operator);
      push(operand.text(), operator);
      operand.text("0");
    }
  };

  const clear = () => {
    operand.text("0");
    expression.text("");
    numbers = [];
    operators = [];
  };

  const sign = () => {
    if (operand.text() !== "0") {
      if (operand.text().includes("-")) {
        operand.text(operand.text().replace("-", ""));
      } else {
        operand.text("-" + operand.text());
      }
    }
  };

  const percent = () => {
    if (operand.text() !== "0") {
      operand.text(operand.text() / 100);
    }
  };

  const back = () => {
    if (operand.text() !== "0") {
      operand.text(operand.text().slice(0, -1));
    }
  };

  const calculate = () => {
    numbers.push(parseFloat(operand.text()));

    const percent = (a) => a / 100;
    const multiply = (a, b) => a * b;
    const divide = (a, b) => a / b;
    const add = (a, b) => a + b;
    const subtract = (a, b) => a - b;

    const calculate = (a, b, operator) => {
      switch (operator) {
        case "%":
          return percent(a);
        case "*":
          return multiply(a, b);
        case "/":
          return divide(a, b);
        case "+":
          return add(a, b);
        case "-":
          return subtract(a, b);
      }
    }

    const calculateMultiplyAndDivide = () => {
      while (operators.includes("*") || operators.includes("/")) {
        for (let i = 0; i < operators.length; i++) {
          if (operators[i] === "*" || operators[i] === "/") {
            numbers[i + 1] = calculate(numbers[i], numbers[i + 1], operators[i]);
            numbers[i] = 0;
            operators[i] = "";
          }
        }
      }
    }

    const calculateAddAndSubtract = () => {
      while (operators.includes("+") || operators.includes("-")) {
        for (let i = 0; i < operators.length; i++) {
          if (operators[i] === "+" || operators[i] === "-") {
            numbers[i + 1] = calculate(numbers[i], numbers[i + 1], operators[i]);
            numbers[i] = 0;
            operators[i] = "";
          }
        }
      }
    }

    calculateMultiplyAndDivide();
    calculateAddAndSubtract();

    return numbers.reduce((a, b) => a + b);
  };

  btnClear.click(() => clear());
  btnSign.click(() => sign());
  btnPercent.click(() => percent());
  btnBack.click(() => back());

  btnNumbers.click(function () {
    if ($(this).hasClass("disable")) {
      return;
    }

    addNumber($(this).text());
  });

  btnOperators.click(function () {
    addOperator($(this).text());
  });

  btnEqual.click(() => {
    if (expression.text() !== "") {
      expression.text(expression.text() + operand.text());
      operand.text(calculate());
      isCalculated = true;
      expression.text("");
      numbers = [];
      operators = [];
    }
  });
});
