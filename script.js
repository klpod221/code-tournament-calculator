$(function () {
  console.log("Hi, I'm klpod221");

  const btnClear = $(".calc-button--clear");
  const btnSign = $(".calc-button--sign");
  const btnPercent = $(".calc-button--percent");
  const btnBack = $(".calc-button--backspace");
  const btnSQRT = $(".calc-button--sqrt");

  const btnNumbers = $(".calc-button--number");
  const btnOperators = $(".calc-button--operator");

  const btnEqual = $(".calc-button--equal");

  const operand = $(".operand");
  const expression = $(".expression");

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
  };

  const addNumber = (number) => {
    if (isCalculated) {
      isCalculated = false;
      clear();
      operand.text(number);
      return;
    }

    if (operand.text() === "0" && number === ".") {
      operand.text("0" + number);
      return;
    }

    if (operand.text() === "0") {
      operand.text(number);
      return;
    }

    if (operand.text().length > 13) {
      return;
    }

    if (operand.text().includes(".") && number === ".") {
      return;
    }

    operand.text(operand.text() + number);
  };

  const addOperator = (operator) => {
    if (isCalculated) {
      isCalculated = false;
      expression.text(operand.text() + operator);
      push(operand.text(), operator);
      operand.text("0");
      return;
    }

    if (operand.text().endsWith(".")) {
      operand.text(operand.text() + "0");
    }

    if (expression.text() === "") {
      expression.text(operand.text() + operator);
      push(operand.text(), operator);
      operand.text("0");
      return;
    }

    expression.text(expression.text() + operand.text() + operator);
    push(operand.text(), operator);
    operand.text("0");
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

  const addSQRT = () => {
    if (operand.text() !== "0") {
      operand.text(Math.sqrt(operand.text()));
    }
  };

  const back = () => {
    if (operand.text() !== "0") {
      if (operand.text().length === 1) {
        operand.text("0");
      } else {
        operand.text(operand.text().slice(0, -1));
      }
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
    };

    const calculateMultiplyAndDivide = () => {
      while (operators.includes("*") || operators.includes("/")) {
        for (let i = 0; i < operators.length; i++) {
          if (operators[i] === "*" || operators[i] === "/") {
            numbers[i + 1] = calculate(
              numbers[i],
              numbers[i + 1],
              operators[i]
            );
            numbers[i] = 0;
            operators[i] = "";
          }
        }
      }
    };

    const calculateAddAndSubtract = () => {
      while (operators.includes("+") || operators.includes("-")) {
        for (let i = 0; i < operators.length; i++) {
          if (operators[i] === "+" || operators[i] === "-") {
            numbers[i + 1] = calculate(
              numbers[i],
              numbers[i + 1],
              operators[i]
            );
            numbers[i] = 0;
            operators[i] = "";
          }
        }
      }
    };

    calculateMultiplyAndDivide();
    calculateAddAndSubtract();

    return numbers.reduce((a, b) => a + b);
  };

  btnClear.click(() => clear());
  btnSign.click(() => sign());
  btnPercent.click(() => percent());
  btnBack.click(() => back());
  btnSQRT.click(() => addSQRT());

  btnSQRT.click(() => addSQRT());

  btnNumbers.click(function () {
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
      numbers = [];
      operators = [];
    }
  });

  // Keyboard
  $(document).keydown(function (e) {
    const key = e.key;
    const keyCode = e.keyCode;

    if (keyCode === 8) {
      e.preventDefault();
      btnBack.click();
      btnBack.addClass("active");
    }

    if (keyCode === 13) {
      e.preventDefault();
      btnEqual.click();
      btnEqual.addClass("active");
    }

    if (keyCode === 27) {
      e.preventDefault();
      btnClear.click();
      btnClear.addClass("active");
    }

    if (key === ".") {
      e.preventDefault();
      if (!operand.text().includes(".")) {
        addNumber(key);
      }

      btnNumbers
        .filter(function () {
          return $(this).text() === ".";
        })
        .addClass("active");
    }

    if (keyCode === 53 && e.shiftKey) {
      e.preventDefault();
      btnPercent.click();
      btnPercent.addClass("active");
    }

    if (keyCode === 189 && e.shiftKey) {
      e.preventDefault();
      btnSign.click();
      btnSign.addClass("active");
    }

    if (keyCode === 82 && e.shiftKey) {
      e.preventDefault();
      btnSQRT.click();
      btnSQRT.addClass("active");
    }

    if (
      key === "0" ||
      key === "1" ||
      key === "2" ||
      key === "3" ||
      key === "4" ||
      key === "5" ||
      key === "6" ||
      key === "7" ||
      key === "8" ||
      key === "9"
    ) {
      e.preventDefault();
      btnNumbers
        .filter(function () {
          return $(this).text() === key;
        })
        .click()
        .addClass("active");
    }

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      e.preventDefault();
      btnOperators
        .filter(function () {
          return $(this).text() === key;
        })
        .click()
        .addClass("active");
    }
  });

  $(document).keyup(function (e) {
    const key = e.key;
    const keyCode = e.keyCode;

    if (keyCode === 8) {
      btnBack.removeClass("active");
    }

    if (keyCode === 13) {
      btnEqual.removeClass("active");
    }

    if (keyCode === 27) {
      btnClear.removeClass("active");
    }

    if (key === ".") {
      btnNumbers
        .filter(function () {
          return $(this).text() === ".";
        })
        .removeClass("active");
    }

    if (keyCode === 53 && e.shiftKey) {
      btnPercent.removeClass("active");
    }

    if (keyCode === 189 && e.shiftKey) {
      btnSign.removeClass("active");
    }

    if (keyCode === 82 && e.shiftKey) {
      btnSQRT.removeClass("active");
    }

    if (
      key === "0" ||
      key === "1" ||
      key === "2" ||
      key === "3" ||
      key === "4" ||
      key === "5" ||
      key === "6" ||
      key === "7" ||
      key === "8" ||
      key === "9"
    ) {
      btnNumbers
        .filter(function () {
          return $(this).text() === key;
        })
        .removeClass("active");
    }

    if (key === "+" || key === "-" || key === "*" || key === "/") {
      btnOperators
        .filter(function () {
          return $(this).text() === key;
        })
        .removeClass("active");
    }
  });

  $(".fullscreen").click(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  });
});
