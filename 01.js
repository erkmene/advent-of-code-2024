const assert = require("assert");

const fs = require("fs");

const transposeData = (data) => {
  const transposed = [[], []];

  for (let i = 0; i < data.length; i++) {
    for (let j = 0; j < 2; j++) {
      transposed[j].push(data[i][j]);
    }
  }

  assert(transposed[0].length === transposed[1].length);
  assert(transposed[0][5] === data[5][0]);
  assert(transposed[1][5] === data[5][1]);

  return transposed;
};

const parseData = (file) =>
  transposeData(
    fs
      .readFileSync(file)
      .toString()
      .trim()
      .split("\n")
      .map((line) => line.split("   ").map((x) => parseInt(x)))
  );

const sortedDiff = (sets) => {
  const sorted = [[...sets[0]].sort(), [...sets[1]].sort()];
  const sortedPairs = sorted[0].map((x, i) => [x, sorted[1][i]]);

  return sortedPairs.reduce((acc, pair) => {
    return acc + Math.abs(pair[0] - pair[1]);
  }, 0);
};

const occurrenceMap = (sets) => {
  const map = new Map();

  for (let i = 0; i < sets[0].length; i++) {
    const key = sets[0][i];
    const count = sets[1].filter((x) => x === key).length;
    map.set(key, count);
  }

  return map;
};

const similarityScore = (sets) => {
  const oMap = occurrenceMap(sets);
  let sum = 0;
  for (let i = 0; i < sets[0].length; i++) {
    const key = sets[0][i];
    sum += key * oMap.get(key);
  }
  return sum;
};

const testData = parseData("01.test.dat");
const testDataOccurrenceMap = occurrenceMap(testData);

assert.equal(sortedDiff(testData), 11);
assert.equal(testDataOccurrenceMap.get(3), 3);
assert.equal(testDataOccurrenceMap.get(4), 1);
assert.equal(testDataOccurrenceMap.get(2), 0);
assert.equal(similarityScore(testData), 31);

const data = parseData("01.dat");

console.log("First Answer:", sortedDiff(data));
console.log("Second Answer:", similarityScore(data));
