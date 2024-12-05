const assert = require("assert");

const fs = require("fs");

const parseData = (file) => {
  const contents = fs.readFileSync(file).toString().trim();
  const original = contents.split("\n").map((line) => line.split(""));

  const rows = original.length;
  const cols = original[0].length;

  let rotated = [];
  for (let c = cols - 1; c >= 0; c--) {
    let row = [];
    for (let r = 0; r < rows; r++) {
      row.push(original[r][c]);
    }
    rotated.push(row);
  }

  let allDiagonals = [];
  for (let r = 0; r < rows; r++) {
    let diagonalDir = [[], [], [], []];
    for (let c = 0; c < cols - r; c++) {
      diagonalDir[0].push(original[r + c][c]);
      diagonalDir[1].push(rotated[r + c][c]);
      if (rows % 2 == 0 && r > 0) {
        // Don't count the center diagonal twice if the matrix is symmetric.
        diagonalDir[2].push(original[c][r + c]);
        diagonalDir[3].push(rotated[c][r + c]);
      }
    }
    allDiagonals.push(diagonalDir[0]);
    allDiagonals.push(diagonalDir[1]);
    if (diagonalDir[2].length > 0) {
      allDiagonals.push(diagonalDir[2]);
      allDiagonals.push(diagonalDir[3]);
    }
  }

  return {
    original: original.map((r) => r.join("")),
    rotated: rotated.map((r) => r.join("")),
    diagonals: allDiagonals.map((r) => r.join("")),
  };
};

const countMatchesInGroup = (group, regexp) => {
  const r = new RegExp(regexp, "g");
  return group.reduce((sum, line, index) => {
    const matches = Array.from(line.matchAll(r));
    return sum + matches.length;
  }, 0);
};

const countMatches = (data) => {
  return ["original", "rotated", "diagonals"].reduce((totalSum, key) => {
    // (XMAS|SAMX) doesn't work as they exclude overlapping matches.
    totalSum += countMatchesInGroup(data[key], "XMAS");
    totalSum += countMatchesInGroup(data[key], "SAMX");
    return totalSum;
  }, 0);
};

const testData = parseData("04.test.dat");

assert.equal(testData.original[0], "MMMSXXMASM");
assert.equal(testData.rotated[0], "MAMXMASAMX");
assert.equal(testData.diagonals[0], "MSXMAXSAMX");
assert.equal(testData.diagonals[1], "MSAMMMMXAM");
assert.equal(testData.diagonals[2], "MMASMASMS");
assert.equal(testData.diagonals[3], "SMASAMSAM");
assert.equal(testData.diagonals[4], "MASAMXXAM");
assert.equal(testData.diagonals[5], "AMSXXSAMX");

assert.equal(countMatchesInGroup(testData.original, "XMAS"), 3);
assert.equal(countMatchesInGroup(testData.rotated, "XMAS"), 1);
assert.equal(countMatchesInGroup(testData.diagonals, "XMAS"), 2);
assert.equal(countMatchesInGroup(testData.original, "SAMX"), 2);
assert.equal(countMatchesInGroup(testData.rotated, "SAMX"), 2);
assert.equal(countMatchesInGroup(testData.diagonals, "SAMX"), 8);

assert.equal(countMatches(testData), 18);

const countXMas = (data) => {
  const map = data.map((line) => line.split(""));
  let total = 0;
  const rows = map.length;
  const cols = map[0].length;
  for (let row = 1; row < rows - 1; row++) {
    for (let col = 1; col < cols - 1; col++) {
      if (map[row][col] === "A") {
        if (
          ((map[row - 1][col - 1] === "S" && map[row + 1][col + 1] === "M") ||
            (map[row - 1][col - 1] === "M" && map[row + 1][col + 1] === "S")) &&
          ((map[row + 1][col - 1] === "S" && map[row - 1][col + 1] === "M") ||
            (map[row + 1][col - 1] === "M" && map[row - 1][col + 1] === "S"))
        ) {
          total++;
        }
      }
    }
  }
  return total;
};

assert.equal(countXMas(testData.original), 9);

const data = parseData("04.dat");
console.log("First Answer", countMatches(data));
console.log("Second Answer", countXMas(data.original));
