interface UnrolledDice<DiceColor extends string, RunnerColor extends string> {
	color: DiceColor;
	options: { runnerColor: RunnerColor; value: number }[];
}

interface RolledDice<DiceColor extends string, RunnerColor extends string> {
	color: DiceColor;
	prevResult: { runnerColor: RunnerColor; value: number };
}

interface RoundBetCard<Color extends string> {
	color: Color;
	value: number[];
}

const mutableTuple = <T extends string[]>(...args: T) => args;

export const RUNNER_COLORS = mutableTuple(
	"red",
	"blue",
	"green",
	"yellow",
	"purple",
);

export const MAD_RUNNER_COLORS = mutableTuple("black", "white");

export const DEFAULT_DICES: UnrolledDice<
	(typeof RUNNER_COLORS)[number] | "gray",
	(typeof RUNNER_COLORS)[number] | (typeof MAD_RUNNER_COLORS)[number]
>[] = [
	...RUNNER_COLORS.map((color) => ({
		color,
		options: [1, 2, 3].map((value) => ({
			runnerColor: color,
			value,
		})),
	})),
	{
		color: "gray",
		options: MAD_RUNNER_COLORS.flatMap((color) =>
			[1, 2, 3].map((value) => ({
				runnerColor: color,
				value,
			})),
		),
	},
];

export interface GameState<
	RunnerColors extends string,
	DiceColors extends string,
> {
	tracks: {
		runners: RunnerColors[];
		effectTile: { type: 1 | -1; owner: string };
	}[];

	dices: {
		unrolled: UnrolledDice<DiceColors, RunnerColors>[];
		rolled: RolledDice<DiceColors, RunnerColors>[];
	};

	gameBetting: {
		first: { owner: string; color: RunnerColors }[];
		last: { owner: string; color: RunnerColors }[];
	};

	roundBetting: {
		[Color in RunnerColors]: RoundBetCard<Color>[];
	};

	players: {
		id: string;
		money: number;
		hasEffectTile: true | undefined;
		gameBetting: RunnerColors[];
		roundBetting: RoundBetCard<RunnerColors>[];
		partnership: string | undefined;
		isActive: boolean;
		isRoundLead: boolean;
	}[];
}
