import type { Dice, GameState } from "./gameState";

export interface GameOptions<
	RunnerColors extends string,
	DiceColors extends string,
> {
	trackLength: number;
	gameBetRewards: { first: number[]; last: number[] };
	gameBetPenalty: { first: number; last: number };
	roundBetRewards: number[][];
	runnerOptions?: {
		runnerColors: RunnerColors[];
		madRunnerColors: RunnerColors[];
		dices: {
			color: DiceColors;
			options: { runnerColor: RunnerColors; value: number }[];
		}[];
	};
	rollTokens: number[];
}

const defaultOptions = {
	runnerOptions: {
		runnerColors: [
			"red",
			"blue",
			"green",
			"yellow",
			"purple",
			"black",
			"white",
		],
		madRunnerColors: ["black", "white"],
		dices: [
			...["red", "blue", "green", "yellow", "purple"].map((color) => ({
				color,
				options: [1, 2, 3].map((value) => ({ runnerColor: color, value })),
			})),
			{
				color: "gray",
				options: ["black", "white"].flatMap((runnerColor) =>
					[1, 2, 3].map((value) => ({ runnerColor, value })),
				),
			},
		],
	},
	trackLength: 12,
	gameBetRewards: { first: [8, 5, 3, 2, 1], last: [8, 5, 3, 2, 1] },
	gameBetPenalty: { first: -1, last: -1 },
	roundBetRewards: [
		[5, 1, -1],
		[3, 2, -1],
		[2, 1, -1],
		[2, 1, -1],
	],
	rollTokens: [1, 1, 1, 1, 1],
};

export class Game<
	RunnerColors extends string =
		| "red"
		| "blue"
		| "green"
		| "yellow"
		| "purple"
		| "black"
		| "white",
	DiceColors extends string =
		| "red"
		| "blue"
		| "green"
		| "yellow"
		| "purple"
		| "gray",
> {
	gameState: GameState<RunnerColors, DiceColors>;

	constructor(
		playersIds: string[],
		options?: Partial<GameOptions<RunnerColors, DiceColors>>,
	) {
		const {
			runnerOptions: { runnerColors, madRunnerColors, dices },
			trackLength,
			gameBetRewards,
			gameBetPenalty,
			roundBetRewards,
			rollTokens,
		} = { ...defaultOptions, ...options };
		this.gameState = {
			initialTrackLength: trackLength,
			gameBetRewards,
			gameBetPenalty,
			tracks: new Array(trackLength).fill(0).map(() => ({
				runners: [],
			})),
			dices: {
				unrolled: dices as Dice<DiceColors, RunnerColors>[],
				rolled: [],
			},
			rollTokens,
			gameBetting: { first: [], last: [] },
			roundBetting: Object.fromEntries([
				...runnerColors
					.filter((color) => !madRunnerColors.includes(color))
					.map((color) => [
						color,
						roundBetRewards.map((value) => ({ color, value: [...value] })),
					]),
				...madRunnerColors.map((color) => [color, []]),
			]) as GameState<RunnerColors, DiceColors>["roundBetting"],
			players: playersIds.map((id, i) => ({
				id,
				money: 0,
				hasEffectTile: true,
				gameBetting: runnerColors.filter(
					(color) => !madRunnerColors.includes(color),
				) as RunnerColors[],
				roundBetting: [],
				partnership: undefined,
				isActive: i === 0,
				isRoundLead: i === 0,
				rollTokens: [],
			})),
		};
	}
}
