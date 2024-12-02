const assert = require("assert");

const fs = require("fs");

const parseData = (file) =>
  fs
    .readFileSync(file)
    .toString()
    .trim()
    .split("\n")
    .map((line) => line.split(" ").map((x) => parseInt(x)));

const testData = parseData("02.test.dat");
assert(testData.length === 6);
assert.deepEqual(testData, [
  [7, 6, 4, 2, 1],
  [1, 2, 7, 8, 9],
  [9, 7, 6, 2, 1],
  [1, 3, 2, 4, 5],
  [8, 6, 4, 4, 1],
  [1, 3, 6, 7, 9],
]);

const checkReport = (report) => {
  let descentDirection = null;
  let gradualDescent = null;
  let withinTolerance = null;

  for (let i = 1; i < report.length; i++) {
    const [prev, curr] = report.slice(i - 1, i + 1);
    const diff = Math.abs(prev - curr);
    withinTolerance =
      (withinTolerance === null || withinTolerance) && diff >= 1 && diff <= 3;
    if (!descentDirection) {
      descentDirection = curr < prev ? "down" : "up";
    }
    const currentDescentDirection = curr < prev ? "down" : "up";
    gradualDescent =
      (gradualDescent === null || gradualDescent) &&
      descentDirection === currentDescentDirection;
  }

  return {
    withinTolerance,
    gradualDescent,
    result: withinTolerance && gradualDescent,
  };
};

// Generate a list of all possible subsets of a set with one element removed
const generateSubsets = (set) =>
  set.map((_, i) => {
    const subset = [...set];
    subset.splice(i, 1);
    return subset;
  });

assert.deepEqual(generateSubsets(testData[0]), [
  [6, 4, 2, 1],
  [7, 4, 2, 1],
  [7, 6, 2, 1],
  [7, 6, 4, 1],
  [7, 6, 4, 2],
]);

const checkReports = (data, testFunction = checkReport) => {
  const reports = data.map((r) => testFunction(r));
  return reports;
};

assert.deepEqual(checkReports(testData), [
  {
    withinTolerance: true,
    gradualDescent: true,
    result: true,
  },
  {
    withinTolerance: false,
    gradualDescent: true,
    result: false,
  },
  {
    withinTolerance: false,
    gradualDescent: true,
    result: false,
  },
  {
    withinTolerance: true,
    gradualDescent: false,
    result: false,
  },
  {
    withinTolerance: false,
    gradualDescent: false,
    result: false,
  },
  {
    withinTolerance: true,
    gradualDescent: true,
    result: true,
  },
]);

const checkReportWithDampening = (report) => {
  const subsets = generateSubsets(report);
  return {
    result:
      [checkReport(report), ...subsets.map(checkReport)].filter((r) => r.result)
        .length > 0,
  };
};

assert.deepEqual(checkReports(testData, checkReportWithDampening), [
  { result: true },
  { result: false },
  { result: false },
  { result: true },
  { result: true },
  { result: true },
]);

const countSafeReports = (reports, testFunction = checkReport) =>
  checkReports(reports, testFunction).filter((r) => r.result).length;

assert(countSafeReports(testData) === 2);
assert(countSafeReports(testData, checkReportWithDampening) === 4);

const data = parseData("02.dat");
console.log("First Answer:", countSafeReports(data));
console.log("Second Answer:", countSafeReports(data, checkReportWithDampening));
