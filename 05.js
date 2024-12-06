const assert = require("assert");

const fs = require("fs");

const generateRuleMap = (rules) => {
  const map = new Map();
  for (let i = 0; i < rules.length; i++) {
    const rule = rules[i];
    const pages = { before: rule[0], after: rule[1] };
    ["before", "after"].forEach((key) => {
      const rule = pages[key];
      if (!map.get(rule)) {
        map.set(rule, { before: new Set(), after: new Set() });
      }
    });
    map.get(pages.before).after.add(pages.after);
    map.get(pages.after).before.add(pages.before);
  }
  return map;
};

const checkUpdate = (ruleMap, update) => {
  let valid = true;
  for (let i = 0; i < update.length; i++) {
    const page = update[i];
    const rule = ruleMap.get(page);
    const pagesBefore = update.slice(0, i);
    const pagesAfter = update.slice(i + 1);
    // console.log(
    //   "Checking page",
    //   page,
    //   "pagesBefore",
    //   pagesBefore,
    //   rule.before,
    //   pagesBefore.every((page) => !rule.after.has(page)),
    //   "pagesAfter",
    //   pagesAfter,
    //   rule.after,
    //   pagesAfter.every((page) => !rule.before.has(page))
    // );
    valid =
      valid &&
      pagesBefore.every((page) => !rule.after.has(page)) &&
      pagesAfter.every((page) => !rule.before.has(page));
  }
  return valid;
};

const parseData = (file) => {
  const contents = fs.readFileSync(file).toString().trim();
  const [rulesString, updatesString] = contents.split("\n\n");
  const rules = rulesString
    .split("\n")
    .map((line) => line.split("|").map((n) => parseInt(n)));
  const updates = updatesString
    .split("\n")
    .map((line) => line.split(",").map((n) => parseInt(n)));
  const ruleMap = generateRuleMap(rules);
  const validUpdates = updates.filter((update) => checkUpdate(ruleMap, update));
  const invalidUpdates = updates.filter(
    (update) => !checkUpdate(ruleMap, update)
  );
  return { rules, ruleMap, updates, validUpdates, invalidUpdates };
};

const testData = parseData("05.test.dat");

assert(testData.ruleMap.get(75).after.has(47));
assert(testData.ruleMap.get(75).after.has(61));
assert(testData.ruleMap.get(75).after.has(53));
assert(testData.ruleMap.get(75).after.has(29));
assert(testData.ruleMap.get(47).before.has(97));
assert(testData.ruleMap.get(47).before.has(75));

const sumOfMiddlePageNumbersOfUpdates = (ruleMap, updates) => {
  return updates.reduce(
    (sum, update) => sum + update[Math.floor(update.length / 2)],
    0
  );
};

assert(testData.validUpdates.length === 3);
assert(testData.invalidUpdates.length === 3);
assert(
  sumOfMiddlePageNumbersOfUpdates(testData.ruleMap, testData.validUpdates) ===
    143
);

const fixUpdates = (ruleMap, updates) => {
  // console.log(ruleMap);
  return updates.map((update) => {
    return [...update].sort((a, b) => {
      const ruleA = ruleMap.get(a);
      const ruleB = ruleMap.get(b);
      if (ruleB.before.has(a) || ruleA.after.has(b)) {
        return -1;
      } else if (ruleA.before.has(b) || ruleB.after.has(a)) {
        return 1;
      } else {
        return 0;
      }
    });
  });
};

const data = parseData("05.dat");

assert.deepEqual(fixUpdates(testData.ruleMap, [testData.invalidUpdates[0]]), [
  [97, 75, 47, 61, 53],
]);

assert(
  sumOfMiddlePageNumbersOfUpdates(
    testData.ruleMap,
    fixUpdates(testData.ruleMap, testData.invalidUpdates)
  ) === 123
);

console.log(
  "First Answer:",
  sumOfMiddlePageNumbersOfUpdates(data.ruleMap, data.validUpdates)
);

console.log(
  "Second Answer:",
  sumOfMiddlePageNumbersOfUpdates(
    data.ruleMap,
    fixUpdates(data.ruleMap, data.invalidUpdates)
  )
);
