import { select } from "@inquirer/prompts";
import { colors, dicePool, Game } from "./src/Game";
import chalk from "chalk";

const game = new Game();

const coloringMap = {
  r: chalk.red,
  y: chalk.yellow,
  g: chalk.green,
  b: chalk.blue,
  p: chalk.magenta,
  w: chalk.white,
  k: chalk.black,
};

const camelMap = {
  r: chalk.red("r>"),
  y: chalk.yellow("y>"),
  g: chalk.green("g>"),
  b: chalk.blue("b>"),
  p: chalk.magenta("p>"),
  w: chalk.white("<w"),
  k: chalk.black("<k"),
};

const print = (noPrediction?: boolean) => {
  const info = game.getTrackInfo();

  const trapLayer = info
    .map(({ trap }) =>
      trap === 0
        ? "  "
        : trap === 1
        ? chalk.bgGreen.black("+1")
        : chalk.bgRed.black("-1")
    )
    .join("|");
  const trackLayer = info.map(({ name }) => `0${name}`.slice(-2)).join("|");
  const camelLayer = [0, 1, 2, 3, 4]
    .map(
      (layer) =>
        " " +
        info
          .map(({ camels }) =>
            camels[layer]
              ? camelMap[camels[layer] as keyof typeof camelMap]
              : "  "
          )
          .join(" ") +
        " "
    )
    .reverse()
    .join("\n");

  const rankLayer =
    "Rank: " +
    game
      .getRank()
      .map((color) => coloringMap[color as keyof typeof coloringMap](color))
      .join(" > ");

  console.log(camelLayer);
  console.log("|" + trackLayer + "|");
  console.log("|" + trapLayer + "|");
  console.log(rankLayer);

  if (!noPrediction) {
    const [first, second] = game.predictRank().map((ranks) => {
      const sortedRanks = [...ranks].sort((a, b) => b[1] - a[1]);
      return sortedRanks
        .map(([color, probability]) =>
          coloringMap[color as keyof typeof coloringMap](
            `${color}: ${probability.toFixed(2)}%`
          )
        )
        .join(", ");
    });
    const predictionLayer = `% for 1st: ${first}\n% for 2nd: ${second}`;

    console.log(predictionLayer);
  }
};

const set = async (noPrediction?: boolean) => {
  const camel = await select({
    message: "which camel you want to set?",
    choices: colors.map((camel) => ({
      value: camel,
    })),
  });

  const track = await select({
    message: "to where you want to place a camel?",
    choices: new Array(16).fill(0).map((_, i) => ({
      value: i,
    })),
  });

  game.setCamel(camel, track);

  print(noPrediction);
};

const manualInit = async () => {
  while ([...game.camels].some(([_, { bottom }]) => !bottom)) {
    await set(true);
  }
};

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
    await manualInit();
  }

  print();
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

  const result = game.roleDice(...roleValue);

  print();

  if (game.usedDices.length >= 5) {
    console.log("round ended! resetting traps and dices...");
    game.resetRound();

    print();
  }

  if (result) {
    return result;
  }
};

const roleByRandom = () => {
  const dice =
    game.availableDices[Math.floor(Math.random() * game.availableDices.length)];

  const camel = dice === "wk" ? (Math.random() >= 0.5 ? "w" : "k") : dice;

  const number = Math.floor(Math.random() * 3) + 1;

  console.log(
    chalk.bold(
      `\n\nDice roled! ${coloringMap[camel as keyof typeof coloringMap](
        camel + number
      )}`
    )
  );

  const result = game.roleDice(camel, number);

  print();

  if (game.usedDices.length >= 5) {
    console.log("round ended! resetting traps and dices...");
    game.resetRound();

    print();
  }

  if (result) {
    return result;
  }
};

const trap = async () => {
  const value: 1 | -1 | 0 = await select({
    message: "which type of trap you to place?",
    choices: [
      { value: +1 },
      {
        value: 0,
        disabled: game.traps.filter((trap) => trap !== 0).length === 0,
      },
      { value: -1 },
    ],
  });

  const track = await select({
    message: "to where you want to place a trap?",
    choices: new Array(16)
      .fill(0)
      .map((_, i) => ({
        value: i,
        disabled: Boolean(
          value !== 0
            ? game.tracks[i].top !== null ||
                game.traps[i] ||
                game.traps[i - 1] ||
                game.traps[i + 1]
            : !game.traps[i]
        ),
      }))
      .slice(1),
  });

  game.setTrap(value, track);
  print();
};

const predictBet = () => {
  const [first, second] = game.predictRank();
  const values = [5, 3, 2];

  const expectedValues = first.map(([color, prob], i) =>
    values
      .map((value) =>
        coloringMap[color as keyof typeof coloringMap](
          `${color}*${value}: ${
            (value * prob + 1 * second[i][1] - (prob + second[i][1])) / 100
          }`
        )
      )
      .join(", ")
  );
  console.log(expectedValues.join("\n"));
};

const predictTrap = async () => {
  const value: 1 | -1 | 0 = await select({
    message: "which type of trap you to place?",
    choices: [
      { value: +1 },
      {
        value: 0,
        disabled: game.traps.filter((trap) => trap !== 0).length === 0,
      },
      { value: -1 },
    ],
  });

  const track = await select({
    message: "to where you want to place a trap?",
    choices: new Array(16)
      .fill(0)
      .map((_, i) => ({
        value: i,
        disabled: Boolean(
          value !== 0
            ? game.tracks[i].top !== null ||
                game.traps[i] ||
                game.traps[i - 1] ||
                game.traps[i + 1]
            : !game.traps[i]
        ),
      }))
      .slice(1),
  });

  const clonedGame = game.clone();
  clonedGame.setTrap(value, track);

  const original = game.predictRank();
  const [first, second] = clonedGame.predictRank().map((ranks, i) => {
    const sortedRanks = [...ranks].sort((a, b) => b[1] - a[1]);
    return sortedRanks
      .map(([color, probability]) =>
        coloringMap[color as keyof typeof coloringMap](
          `${color}: ${original[i]
            .find(([c]) => c === color)?.[1]
            .toFixed(2)} -> ${chalk.bold(probability.toFixed(2))}%`
        )
      )
      .join(", ");
  });
  const predictionLayer = `% delta for 1st: ${first}\n% delta for 2nd: ${second}`;

  console.log(predictionLayer);
};

const proceedTurn = async () => {
  const action = await select({
    message: "which action you want to play?",
    choices: [
      { value: "role (random)" },
      { value: "role" },
      { value: "trap" },
      { value: "set" },
      { value: "predict bet" },
      { value: "predict trap" },
    ],
  });

  if (action === "role") {
    const result = await role();
    if (result) return result;
  }
  if (action === "role (random)") {
    const result = roleByRandom();
    if (result) return result;
  }
  if (action === "trap") await trap();
  if (action === "set") await set();
  if (action === "predict bet") predictBet();
  if (action === "predict trap") await predictTrap();
};

const main = async () => {
  console.log(chalk.bold.white("============================="));
  console.log(chalk.bold.white("#  WELCOM TO THE CAMEL-UP!  #"));
  console.log(chalk.bold.white("=============================\n"));

  await initiate();

  while (!(await proceedTurn())) {}

  const rank = game
    .getRank()
    .map((color) => coloringMap[color as keyof typeof coloringMap](color))
    .join(" > ");
  console.log(chalk.bold.white("\n\n\n\n============================"));
  console.log(chalk.bold.white("#        GAME ENDED!       #"));
  console.log(chalk.bold.white(`#     ${rank}    #`));
  console.log(chalk.bold.white("============================\n"));
  print();
};

main();
