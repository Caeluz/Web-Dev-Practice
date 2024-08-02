class Test {
  practiceMaps() {
    const test = new Map();

    test.set(1, []);

    if (test.has(1)) {
      test.get(1).push(1);

      console.log(test);
    }
    return 0;

    return test;
  }
}

const test = new Test();

console.log(test.practiceMaps());
