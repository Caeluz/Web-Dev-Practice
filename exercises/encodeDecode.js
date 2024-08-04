class Solution {
  encode(strs) {
    const arr = [];
    for (let str of strs) {
      const count = str.split("").length;

      arr.push(count + "#" + str);
    }
    return arr.join("");
  }

  decode(str) {
    const arrTwo = [];
    let i = 0;
    while (i < str.length) {
      let j = i;
      while (str[j] !== "#") {
        j++;
      }

      let length = parseInt(str.slice(i, j));

      const word = str.slice(j + 1, j + 1 + length);
      arrTwo.push(word);
      i = j + 1 + length;
    }
    return arrTwo;
  }
}

const sol = new Solution();

test = sol.encode(["test", "te", "helloworld"]);
testTwo = sol.decode("4#test2#te10#helloworld");

console.log(testTwo);
