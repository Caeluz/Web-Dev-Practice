class Solution {
  /**
   * @param {number[]} nums
   * @param {number} k
   * @return {number[]}
   */
  topKFrequent(nums, k) {
    const map = new Map();

    for (let element of nums) {
      if (map.has(element)) {
        map.set(element, map.get(element) + 1);
      } else {
        map.set(element, 1);
      }
    }

    const sortedArray = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);

    console.log(sortedArray);

    return sortedArray.slice(0, k).map((entry) => entry[0]);
  }
}

const solution = new Solution();

console.log(solution.topKFrequent([1, 2, 2, 3, 3, 3, 3], 2));
