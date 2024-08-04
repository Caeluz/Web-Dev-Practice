// Find if there are duplicates in the arr
// [0,1,2,3,2] = true
// [0,1,2,3,4] = false

const guessTheNumber = () => {
  const num = Math.round(Math.random() * 100);
  const array = [0, 1, 2, 3, 4, 2];
  //   console.log(num);

  for (let arr = 0; arr < 5; arr++) {
    const element = array[arr];
    setTimeout(10);
    console.log(element);
  }
};

guessTheNumber();
