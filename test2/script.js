class Solution {
  isAnagram(s, t) {
    const sortedS = s.split("").sort().join("");
    const sortedT = t.split("").sort().join("");

    if (sortedS === sortedT) {
      return true;
    }
    return false;
  }
}

const solution = new Solution();
console.log(solution.isAnagram("test", "stet"));
