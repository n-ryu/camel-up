import { Stack } from "./Stack";

const camelKeys = ["r", "y", "g", "b", "p"];
const crazyKeys = ["w", "k"];
export const colors = [...camelKeys, ...crazyKeys];
export const dicePool = ["r", "y", "g", "b", "p", "wk"];
const diceValues = { camel: [1, 2, 3], crazy: [1, 2, 3, -1, -2, -3] };

export class Game {
  camels: Map<string, Stack>;
  tracks: Stack[];
  traps: (1 | -1 | 0)[];
  usedDices: string[];

  constructor(game?: Game) {
    if (game) {
      this.tracks = game.tracks.map((track) => track.cloneFromBottom());
      this.traps = [...game.traps];
      this.usedDices = [...game.usedDices];
      this.camels = new Map();
      this.tracks.forEach((track) => {
        track.iterate((stack) => {
          if (colors.includes(stack.name)) this.camels.set(stack.name, stack);
        }, true);
      });

      return this;
    }

    this.tracks = new Array(16).fill(0).map((_, i) => new Stack(`${i}`));
    this.traps = new Array(16).fill(0);
    this.usedDices = [];
    this.camels = new Map(colors.map((color) => [color, new Stack(color)]));
  }

  clone() {
    return new Game(this);
  }

  resetRound() {
    this.usedDices = [];
    this.traps = new Array(16).fill(0);
  }

  get availableDices() {
    return dicePool.filter((dice) => !this.usedDices.includes(dice));
  }

  setCamel(color: string, trackIndex: number) {
    const camel = this.camels.get(color);
    if (!camel) throw new Error("No such a camel exists!");

    if (camel.bottom) camel.bottom.top = null;

    camel.bottom = this.tracks[trackIndex].topMost;
    camel.bottom.top = camel;
  }

  private setCamelUnder(color: string, trackIndex: number) {
    const camel = this.camels.get(color);
    if (!camel) throw new Error("No such a camel exists!");

    if (camel.bottom) camel.bottom.top = null;

    camel.bottom = this.tracks[trackIndex];
    if (camel.bottom.top) {
      const currentTopMost = camel.topMost;

      currentTopMost.top = camel.bottom.top;
      currentTopMost.top.bottom = currentTopMost;
    }
    camel.bottom.top = camel;
  }

  setTrap(type: 1 | -1 | 0, trackIndex: number) {
    if (type !== 0)
      [trackIndex - 1, trackIndex, trackIndex + 1]
        .filter((i) => i >= 0 && i < this.traps.length)
        .forEach((i) => {
          if (this.traps[i])
            throw new Error("You cannot place spectator there!");
        });

    this.traps[trackIndex] = type;
  }

  initGame(initialStates: [string, number][]) {
    initialStates.forEach(([color, number]) => this.setCamel(color, number));
  }

  getRank() {
    let rank: string[] = [];
    for (let i = this.tracks.length - 1; i >= 0; i--) {
      const track = this.tracks[i];
      track.topMost.iterate(({ name }) => {
        if (camelKeys.includes(name)) rank.push(name);
      });
    }
    return rank;
  }

  roleDice(dice: string, number: number) {
    if (this.usedDices.some((usedDice) => usedDice.includes(dice)))
      throw new Error("You cannot role the same dice twice in a single round");

    const decide = (): [string, number] => {
      if (dice === "w" || dice === "k") {
        const white = this.camels.get("w") as Stack;
        const black = this.camels.get("k") as Stack;

        if (white.top === black) return ["k", -number];
        if (black.top === white) return ["w", -number];

        if (white.top !== null && black.top === null) return ["w", -number];
        if (black.top !== null && white.top === null) return ["k", -number];

        return [dice, -number];
      }
      return [dice, number];
    };

    const [color, delta] = decide();

    const camel = this.camels.get(color);
    if (!camel) throw new Error("No such a camel exists!");

    const position = Number(camel.bottomMost.name);

    const spectator = this.traps[position + delta] ?? 0;

    const nextPosition = position + delta + spectator * Math.sign(delta);

    if (dice === "w" || dice === "k") {
      if (nextPosition < 0) {
        this.tracks = [new Stack("-1"), ...this.tracks];
        this.setCamel(dice, 0);
        return this.getRank();
      }
    } else {
      if (nextPosition >= this.tracks.length) {
        this.tracks = [...this.tracks, new Stack("16")];
        this.setCamel(dice, 16);
        return this.getRank();
      }
    }

    if (spectator >= 0) this.setCamel(color, nextPosition);
    else this.setCamelUnder(color, nextPosition);

    this.usedDices.push(dice === "w" || dice === "k" ? "wk" : dice);
  }

  simulateRound() {
    if (this.usedDices.length >= 5) return [this.getRank()];

    const diceCandidate = dicePool.filter(
      (dice) => !this.usedDices.includes(dice)
    );

    const ranks: string[][] = diceCandidate.flatMap((dice) => {
      if (dice === "wk") {
        return diceValues.crazy.flatMap((number) => {
          const game = this.clone();
          if (number > 0) {
            const result = game.roleDice("w", number);
            if (result) return [result];
          } else {
            const result = game.roleDice("k", -number);
            if (result) return [result];
          }
          return game.simulateRound();
        });
      } else {
        return diceValues.camel.flatMap((number) => {
          const game = this.clone();
          const roleResult = game.roleDice(dice, number);
          if (roleResult) return [roleResult, roleResult];

          const result = game.simulateRound();
          return [...result, ...result];
        });
      }
    });

    return ranks;
  }

  predictRank() {
    const futures = this.simulateRound();
    const colorMap = { r: 0, g: 1, b: 2, y: 3, p: 4 };
    const inverseMap = ["r", "g", "b", "y", "p"];

    const cases = futures.reduce<number[][]>(
      (acc, future) => {
        future.forEach((color, i) => {
          acc[i][colorMap[color as "r" | "g" | "b" | "y" | "p"]]++;
        });
        return acc;
      },
      [
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0],
      ]
    );

    const probabilities = cases.map((byColors) =>
      byColors.map<[string, number]>((number, i) => [
        inverseMap[i],
        (number / futures.length) * 100,
      ])
    );

    return probabilities;
  }

  getTrackInfo() {
    return this.tracks.map((track, i) => {
      const [name, ...camels] = track.toArray();
      return { name, camels, trap: this.traps[i] };
    });
  }
}
