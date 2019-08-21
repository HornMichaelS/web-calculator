const operations = Object.freeze({
  '±': (n) => -n,
  '%': (n) => n / 100,
  '÷': (m, n) => m / n,
  '×': (m, n) => m * n,
  '−': (m, n) => m - n,
  '+': (m, n) => m + n,
});

function Calculator() {
  let storedOperand;
  let currentValue = 0;
  let displayLength = 1;
  let decimalPressed = false;
  let listener;
  let pendingOperation;
  let previousOperation;
  let replaceCurrentValue = false;

  function notify() {
    if (listener !== undefined && typeof listener === 'function') {
      listener(currentValue);
    }
  }

  this.pressDigit = (number) => {
    if (typeof number !== 'number' || number < 0 || number > 9) {
      return;
    }

    if (replaceCurrentValue) {
      storedOperand = currentValue;
      currentValue = 0;
      replaceCurrentValue = false;
    }

    if (String(currentValue).length > 11) {
      return;
    }

    let newValString = String(currentValue);

    if (decimalPressed && !newValString.includes('.')) {
      newValString += '.';
      decimalPressed = false;
    }

    newValString += number;

    currentValue = parseFloat(newValString);

    notify();
  };

  this.pressDecimal = function () {
    decimalPressed = true;
  }

  this.pressBackspace = function () {
    currentValue = parseFloat(
      String(currentValue).slice(0, -1)
    ) || 0;
    decimalPressed = false;
    notify();
  }

  this.pressClear = function () {
    currentValue = 0;
    decimalPressed = false;
    pendingOperation = null;
    notify();
  }

  this.pressOperation = function (operation) {
    previousOperation = null;

    if ('±%'.includes(operation)) {
      currentValue = operations[operation](currentValue);
      replaceCurrentValue = false;
      notify();
      return;
    }

    console.log(operation);

    storedOperand = currentValue;
    pendingOperation = operations[operation];
    replaceCurrentValue = true;
    console.log(pendingOperation);
  }

  this.pressEquals = function () {
    console.log('pressEquals', currentValue, storedOperand);
    if (previousOperation) {

    }
    if (pendingOperation) {
      const result = pendingOperation(storedOperand, currentValue);
      storedOperand = currentValue;
      currentValue = result;
      notify();
    }
    replaceCurrentValue = true;
  }

  this.getValue = function () {
    return currentValue;
  }

  this.addListener = function (newListener) {
    listener = newListener;
  };
}

const calculator = new Calculator();

function adjustDisplayFontSize(display, value) {
  if (String(value).length < 5) {
    display.style.fontSize = '80pt';
  } else if (String(value).length < 8) {
    display.style.fontSize = '50pt';
  } else {
    display.style.fontSize = '30pt';
  }
}

function onNewCalculatorValue(value) {
  const mainDisplay = document.querySelector('.main-display');
  adjustDisplayFontSize(mainDisplay, value);
  mainDisplay.textContent = value;
}

calculator.addListener(onNewCalculatorValue);

function addClickListener(selector, callback) {
  const elem = document.querySelector(selector);
  elem.addEventListener('click', callback);
}

const buttons = document.querySelectorAll('button');
const digitButtons = Array.from(buttons).filter((button) => !isNaN(parseInt(button.textContent)));

digitButtons.forEach(button => {
  const digit = parseInt(button.textContent);
  button.addEventListener(
    'click',
    calculator.pressDigit.bind(calculator, digit)
  )
});

addClickListener(
  '#backspace-button',
  calculator.pressBackspace.bind(calculator),
);

addClickListener(
  '#clear-button',
  calculator.pressClear.bind(calculator),
);

addClickListener(
  '#decimal-button',
  calculator.pressDecimal.bind(calculator),
);

addClickListener(
  '#equals-button',
  calculator.pressEquals.bind(calculator),
)

const operationButtons = document.querySelectorAll('.operation');
operationButtons.forEach(button => {
  const operation = button.textContent;
  button.addEventListener(
    'click',
    calculator.pressOperation.bind(calculator, operation)
  );
});