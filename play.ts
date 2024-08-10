import { select } from "@inquirer/prompts";
import { dicePool, Game } from "./src/Game";

const game = new Game();

const initiate = async () => {
  const initMethod = await select({
    message: "how you want to set the game?",
    choices: [{ value: "default" }, { value: "random" }, { value: "manual" }],
  });

  if (initMethod === "default") {
    game.initGame([
      ["r", 0],
      ["y", 0],
      ["g", 0],
      ["b", 0],
      ["p", 0],
      ["w", 15],
      ["k", 15],
    ]);
  } else if (initMethod === "random") {
    const order = ["r", "y", "g", "b", "p", "w", "k"]
      .map<[string, number]>((color) => [color, Math.random()])
      .sort((a, b) => a[1] - b[1])
      .map<[string, number]>(([color]) => [
        color,
        color === "w" || color === "k"
          ? 15 - Math.floor(Math.random() * 3)
          : Math.floor(Math.random() * 3),
      ]);

    game.initGame([...order]);
  } else if (initMethod === "manual") {
    throw new Error("not implemented");
  }

  console.log(game.getTrackInfo());
};

const role = async () => {
  const dice = await select({
    message: "which dice would role?",
    choices: dicePool.map((dice) => ({
      value: dice,
      disabled: game.usedDices.includes(dice),
    })),
  });

  const roleValue = (await select({
    message: "how much the camel would go?",
    choices:
      dice !== "wk"
        ? [1, 2, 3].map((number) => ({
            value: [dice, number],
          }))
        : [
            ["w", 1],
            ["w", 2],
            ["w", 3],
            ["k", 1],
            ["k", 2],
            ["k", 3],
          ].map((value) => ({
            value: value,
          })),
  })) as [string, number];

  game.roleDice(...roleValue);
  console.log(game.getTrackInfo());

  if (game.usedDices.length >= 5) {
    console.log("round ended! resetting traps and dices...");
    game.resetRound();

    console.log(game.getTrackInfo());
  }
};

const trap = async () => {
  const track = await select({
    message: "to where you want to place a trap?",
    choices: new Array(16).fill(0).map((_, i) => ({
      value: i,
    })),
  });

  const value: 1 | -1 = await select({
    message: "which type of trap you to place?",
    choices: [{ value: +1 }, { value: -1 }],
  });

  game.setTrap(value, track);
  console.log(game.getTrackInfo());
};

const proceedTurn = async () => {
  const action = await select({
    message: "which action you want to play?",
    choices: [{ value: "role" }, { value: "trap" }],
  });

  if (action === "role") await role();
  if (action === "trap") await trap();

  console.log(game.predictRank());
};

const main = async () => {
  await initiate();

  while (1) {
    await proceedTurn();
  }
};

main();
