// Rules odd - same on left and right  1 2 1
// 12321

// Get the middle then check the left and right

const isPalindrome = (int) => {
  const str = int.toString();
  const strArr = str.slice("");
  const strLength = strArr.length;
  let middle = Math.floor(strLength / 2);

  let left = middle - 1;
  let right = strLength % 2 === 0 ? middle : middle + 1;

  while (left >= 0 && right < strLength) {
    if (strArr[left] !== strArr[right]) {
      return false;
    }
    left--;
    right++;
  }
  return true;
};

const num = isPalindrome(11211);
console.log(num);
