const assert = require("assert");

const fs = require("fs");

const parseData = (file) => fs.readFileSync(file).toString().trim();

const extractOperations = (data) => {
  const regex = /(mul\(([0-9]*),([0-9]*)\)|don't\(\)|do\(\))/gi;
  const matches = Array.from(data.matchAll(regex));
  return matches.map((match) => {
    if (match[1] === "don't()" || match[1] === "do()") {
      return match[1].replace("()", "");
    } else {
      return [parseInt(match[2]), parseInt(match[3])];
    }
  });
};

const executeOperations = (ops, useControls = false) => {
  let sum = 0;
  let executing = true;
  for (let i = 0; i < ops.length; i++) {
    const op = ops[i];
    switch (op) {
      case "don't":
        if (useControls) {
          executing = false;
        }
        break;
      case "do":
        executing = true;
        break;
      default:
        if (executing) {
          sum += op[0] * op[1];
        }
        break;
    }
  }
  return sum;
};

const testData = parseData("03.test.dat");

assert.deepEqual(extractOperations(testData), [
  [2, 4],
  "don't",
  [5, 5],
  [11, 8],
  "do",
  [8, 5],
]);

assert.equal(executeOperations(extractOperations(testData)), 161);
assert.equal(executeOperations(extractOperations(testData), true), 48);

const data = parseData("03.dat");

console.log("First answer:", executeOperations(extractOperations(data)));
console.log("Second answer:", executeOperations(extractOperations(data), true));
