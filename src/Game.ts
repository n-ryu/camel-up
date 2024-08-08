import { Stack } from "./Stack";

const camelKeys = ["r", "y", "g", "b", "p"];
const crazyKeys = ["w", "k"];
const colors = [...camelKeys, ...crazyKeys];
const dicePool = ["r", "y", "g", "b", "p", "wk"];

class Game {
  camels: Map<string, Stack>;
  tracks: Stack[];
  spectators: (1 | -1 | 0)[];
  usedDices: ({ color: string; number: number } | null)[];

  constructor() {
    this.tracks = new Array(16).fill(0).map((_, i) => new Stack(`${i}`));
    this.spectators = new Array(16).fill(0);
    this.usedDices = new Array(5).fill(0).map(() => null);
    this.camels = new Map(colors.map((color) => [color, new Stack(color)]));
  }

  setCamel(color: string, trackIndex: number) {
    const camel = this.camels.get(color);
    if (!camel) throw new Error("No such a camel exists!");

    if (camel.bottom) camel.bottom.top = null;

    camel.bottom = this.tracks[trackIndex].topMost;
    camel.bottom.top = camel;
  }

  setCamelUnder(color: string, trackIndex: number) {
    const camel = this.camels.get(color);
    if (!camel) throw new Error("No such a camel exists!");

    if (camel.bottom) camel.bottom.top = null;

    camel.bottom = this.tracks[trackIndex];
    if (camel.bottom.top) {
      camel.topMost.top = camel.bottom.top;
      camel.bottom.top.bottom = camel.topMost;
    }
    camel.bottom.top = camel;
  }

  setSpectator(type: 1 | -1 | 0, trackIndex: number) {
    [trackIndex - 1, trackIndex, trackIndex + 1]
      .filter((i) => i >= 0 && i < this.spectators.length)
      .forEach((i) => {
        if (this.spectators[i])
          throw new Error("You cannot place spectator there!");
      });

    this.spectators[trackIndex] = type;
  }

  initGame(initialStates: [string, number][]) {
    initialStates.forEach(([color, number]) => this.setCamel(color, number));
  }

  getRank() {
    let rank: string[] = [];
    for (let i = this.tracks.length - 1; i >= 0; i--) {
      const track = this.tracks[i];
      track.topMost.iterate((name) => {
        if (camelKeys.includes(name)) rank.push(name);
      });
    }
    return rank;
  }

  roleDice(dice: string, number: number) {
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

    const spectator = this.spectators[position + delta];

    this.setCamel(color, position + delta + spectator * Math.sign(delta));
  }

  clone() {}

  simulateDice() {}

  printGame() {
    this.tracks.forEach((track, i) =>
      console.log(this.spectators[i], track.toArray())
    );
  }
}

const game = new Game();

game.initGame([
  ["r", 1],
  ["b", 2],
  ["g", 2],
  ["y", 2],
  ["p", 1],
  ["w", 15],
  ["k", 15],
]);

game.setSpectator(-1, 10);
game.roleDice("g", 3);
game.roleDice("w", 3);
game.roleDice("k", 2);

game.printGame();
