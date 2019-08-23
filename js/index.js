let calculatorState = {
  r1: '0',
  r2: '0',
  shouldShift: false,
  pendingOperation: null,
  replaceOperation: false,
  repeatOperation: false,
};

function renderCalculator(calculatorState) {
  const display = document.querySelector('.main-display');
  const numChars = calculatorState.r1.length;
  if (numChars < 5) {
    display.style.fontSize = '80pt';
    display.style.lineHeight = '60pt';
  } else if (numChars < 9) {
    display.style.fontSize = '45pt';
    display.style.lineHeight = '35pt';
  } else {
    display.style.fontSize = '30pt';
    display.style.lineHeight = '22.5pt';
  }

  display.textContent = numChars > 12
    ? parseFloat(calculatorState.r1).toExponential(7)
    : calculatorState.r1
}

function setState(state) {
  calculatorState = Object.assign(calculatorState, state);
  console.log(calculatorState);
  renderCalculator(calculatorState);
}

function performPendingOperation() {
  const { pendingOperation, repeatOperation, r1, r2 } = calculatorState;

  if (!pendingOperation) {
    setState({
      shouldShift: true,
    })
    return;
  }

  if (repeatOperation) {
    const result = pendingOperation(parseFloat(r1), parseFloat(r2));
    setState({
      r1: result.toString(),
      shouldShift: true,
    })
  } else {
    const result = pendingOperation(parseFloat(r2), parseFloat(r1));
    setState({
      r1: result.toString(),
      r2: r1,
      shouldShift: true,
      repeatOperation: true,
    })
  }
}

function isUnary(operation) {
  return '±%'.includes(operation);
}

function setOperation(operation) {
  const operations = Object.freeze({
    '±': (n) => -n,
    '%': (n) => n / 100,
    '÷': (m, n) => m / n,
    '×': (m, n) => m * n,
    '−': (m, n) => m - n,
    '+': (m, n) => m + n,
  });

  const { r1, r2, pendingOperation, replaceOperation } = calculatorState;

  if (isUnary(operation)) {
    setState({
      r1: operations[operation](calculatorState.r1).toString(),
    });
  } else {
    if (pendingOperation && !replaceOperation) {
      setState({
        r1: pendingOperation(r2, r1).toString(),
        r2: r1,
        shouldShift: true,
        pendingOperation: operations[operation],
        replaceOperation: true,
        repeatOperation: false,
      });
    } else {
      setState({
        pendingOperation: operations[operation],
        repeatOperation: false,
        shouldShift: true,
      });
    }
  }
}

function concatDigit(digit) {
  const { r1, shouldShift } = calculatorState;

  if (shouldShift) {
    setState({
      r1: `${digit}`,
      r2: r1,
      shouldShift: false,
      replaceOperation: false,
      repeatOperation: false,
    })
  } else {
    setState({
      r1: r1 === '0' ? `${digit}` : `${r1}${digit}`,
      replaceOperation: false,
      repeatOperation: false,
    });
  }
}

function concatDecimal() {
  const { r1, shouldShift } = calculatorState;

  if (shouldShift) {
    setState({
      r1: '0.',
      r2: r1,
      shouldShift: false,
      replaceOperation: false,
      repeatOperation: false,
    })
  } else {
    setState({
      r1: r1.includes('.') ? r1 : `${r1}.`,
      replaceOperation: false,
      repeatOperation: false,
    });
  }
}

function clear() {
  setState({
    r1: '0',
    r2: '0',
    shouldShift: false,
    pendingOperation: null,
    replaceOperation: false,
    repeatOperation: false,
  });
}

function backspace() {
  const { r1, shouldShift } = calculatorState;

  const replaceOperation = false;
  const pendingOperation = null;

  if (shouldShift) {
    setState({
      r1: '0',
      r2: '0',
      shouldShift: false,
      pendingOperation,
      replaceOperation,
      repeatOperation: false,
    })
  } else {
    const newValue = r1.length < 2 ? '0' : r1.split('').slice(0, -1).join('');
    setState({
      r1: newValue === '-' ? '0' : newValue,
      pendingOperation,
      replaceOperation,
      repeatOperation,
    });
  }
}

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
    concatDigit.bind(null, digit)
  )
});

addClickListener(
  '#backspace-button',
  backspace
);

addClickListener(
  '#clear-button',
  clear,
);

addClickListener(
  '#decimal-button',
  concatDecimal,
);

addClickListener(
  '#equals-button',
  performPendingOperation,
)

const operationButtons = document.querySelectorAll('.operation');
operationButtons.forEach(button => {
  const operation = button.textContent;
  button.addEventListener(
    'click',
    setOperation.bind(null, operation),
  );
});