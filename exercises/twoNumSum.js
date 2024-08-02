class Solution {
  twoNumSum(nums, target) {
    // Initialize a new map to add the element and it's index
    const arr = new Map();

    for (const [index, element] of nums.entries()) {
      // For easy checking of what is on the map
      // Example 7-4 = 3,
      const complement = target - element;

      // Get the value of arr
      // Ex. 4:0 = 0
      const sumIndex = arr.get(complement);

      // if arr has 3 then it would show both indexes
      if (arr.has(complement)) {
        return [index, sumIndex];
      }

      // Automatically puts the element and index here, if arr has no complement
      // arr.set(4,0)
      arr.set(element, index);
    }
    return 0;
  }
}

const solution = new Solution();

nums = [4, 2, 3, 1];
target = 7;

console.log(solution.twoNumSum(nums, target));
