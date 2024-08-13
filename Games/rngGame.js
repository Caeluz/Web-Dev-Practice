const rngGame = (player) => {
  const nums = [];
  const MAX_PLAY = 100;
  const MID_PLAY = 70;
  const MAX_NUM = 10;

  for (let i = 0; i < 3; i++) {
    let num;
    if (player.play >= MAX_PLAY) {
      num = 1;
    } else if (player.play >= MID_PLAY) {
      num = Math.floor(Math.random() * 5) + 1;
    } else {
      num = Math.floor(Math.random() * MAX_NUM);
    }
    nums.push(num);
  }

  player.play++;

  if (nums[0] === nums[1] && nums[0] === nums[2]) {
    player.coins += 100;
    return `You won 100 coins! ${nums} Play count: ${player.play}`;
  }

  return `You lose ${nums} Play count: ${player.play}`;
};

const player = {
  name: "John",
  coins: 70,
  play: 0,
};

const main = () => {
  let i = 0;
  while (i < 100) {
    console.log(rngGame(player));
    i++
  }
};

main();