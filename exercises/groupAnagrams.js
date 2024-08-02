class Solution {
  /**
   * @param {string[]} strs
   * @return {string[][]}
   */
  groupAnagrams(strs) {
    if (strs.length <= 0 || strs.length >= 1000) {
      return;
    }

    const anagramsMap = new Map();
    strs.map((ele) => {
      const sortedEle = ele.split("").sort().join("");

      if (!anagramsMap.has(sortedEle)) {
        anagramsMap.set(sortedEle, []);
      }
      anagramsMap.get(sortedEle).push(ele);
    });
    const groupedAnagrams = Array.from(anagramsMap.values());
    return groupedAnagrams;
  }
}

/* 
pseudo code
sortedArray = [1,1,2,3]
parentArray = []
childrenArray = []
output = [[1,1],[2],[3]]

rules


for ele of sortedArray
  if childrenArray has that ele:
    put it on childrenArray
  else if childrenArray[0] !== ele:  // The problem would be this code as always childrenArray[0] would be always false in initialization
    put the childrenArray to the parentArray
    then initialize new childrenArray

  childrenArray.push(ele)

another way to solve

arr = []
for loop arr
  initialize add
  if the next is same then add
  

  if next not the same push the arr in parent
  then create new arr

*/

const solution = new Solution();

strs = ["act", "pots", "tops", "cat", "stop", "hat"];

console.log(
  // solution.groupAnagrams(["act", "pots", "tops", "cat", "stop", "hat"])
  solution.groupAnagrams(strs)
);
