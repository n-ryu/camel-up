import {
	advanceRoundLead,
	advanceTurn,
	betGame,
	betRound,
	type Dice,
	type GameState,
	isGameEnded,
	isOnEffectTile,
	isRoundEnded,
	moveRunners,
	resetEffectTiles,
	resolveDiceRollReward,
	resolveEffectTileReward,
	resolveGameBetReward,
	resolvePartnershipReward,
	resolveRoundBetReward,
	rollDice,
	setEffectTile,
	setPartnership,
} from "./gameState";
import { shuffle } from "./utils";

type Action = string;

export interface GameOptions<
	RunnerColors extends string,
	DiceColors extends string,
> {
	trackLength: number;
	gameBetRewards: { first: number[]; last: number[] };
	gameBetPenalty: { first: number; last: number };
	roundBetRewards: number[][];
	runnerOptions: {
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

export type DefaultRunnerColors =
	| "red"
	| "blue"
	| "green"
	| "yellow"
	| "purple"
	| "black"
	| "white";

export type DefaultDiceColors =
	| "red"
	| "blue"
	| "green"
	| "yellow"
	| "purple"
	| "gray";

export class Game<
	RunnerColors extends string = DefaultRunnerColors,
	DiceColors extends string = DefaultDiceColors,
> {
	readonly options: GameOptions<RunnerColors, DiceColors>;
	readonly runners: RunnerColors[];
	readonly madRunners: RunnerColors[];
	gameState: GameState<RunnerColors, DiceColors>;

	constructor(
		readonly playersIds: string[],
		options?: Partial<GameOptions<RunnerColors, DiceColors>>,
	) {
		this.options = { ...defaultOptions, ...options } as GameOptions<
			RunnerColors,
			DiceColors
		>;

		this.madRunners = this.options.runnerOptions.madRunnerColors;
		this.runners = this.options.runnerOptions.runnerColors.filter(
			(color) => !this.madRunners.includes(color),
		);

		this.init();
	}

	init() {
		const {
			runnerOptions: { dices },
			trackLength,
			gameBetRewards,
			gameBetPenalty,
			roundBetRewards,
			rollTokens,
		} = this.options;

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
				...this.runners.map((color) => [
					color,
					roundBetRewards
						.map((value) => ({ color, value: [...value] }))
						.toSorted((a, b) => a.value[0] - b.value[0]),
				]),
				...this.madRunners.map((color) => [color, []]),
			]) as GameState<RunnerColors, DiceColors>["roundBetting"],
			players: this.playersIds.map((id, i) => ({
				id,
				money: 0,
				hasEffectTile: true,
				gameBetting: [...this.runners],
				roundBetting: [],
				partnership: undefined,
				isActive: i === 0,
				isRoundLead: i === 0,
				rollTokens: [],
			})),
		};

		shuffle([...this.runners, ...this.madRunners]).forEach((color) => {
			const dices = this.options.runnerOptions.dices;
			const options = dices.flatMap(({ options }) =>
				options
					.filter(({ runnerColor }) => runnerColor === color)
					.map(({ value }) => value),
			);
			const result = options[Math.floor(Math.random() * options.length)];

			this.gameState.tracks
				.at(this.runners.includes(color) ? result - 1 : -result)
				?.runners.push(color);
		});
	}

	private createActor() {
		const actions: {
			action: Action;
			state: GameState<RunnerColors, DiceColors>;
		}[] = [];

		return (
			action: Action,
			fn: (
				gameState: GameState<RunnerColors, DiceColors>,
			) => GameState<RunnerColors, DiceColors>,
		) => {
			this.gameState = fn(this.gameState);
			actions.push({ action, state: this.gameState });
			return [...actions];
		};
	}

	roll(playerId: string) {
		const act = this.createActor();

		act("rollDice", (gameState) => rollDice(gameState, playerId));
		act("moveRunners", (gameState) => {
			const { runnerColor, value } = gameState.dices.rolled.at(-1)!.prevResult;
			return moveRunners(gameState, runnerColor, value);
		});

		const effectTileValidation = isOnEffectTile(this.gameState);
		if (effectTileValidation) {
			act("resolveEffectTileReward", resolveEffectTileReward);
			act("moveRunners", (gameState) =>
				moveRunners(
					gameState,
					effectTileValidation.runnerColor,
					effectTileValidation.type,
				),
			);
		}

		if (!isGameEnded(this.gameState) && !isRoundEnded(this.gameState))
			return act("advanceTurn", advanceTurn);

		act("resetEffectTiles", resetEffectTiles);
		act("resolvePartnershipReward", resolvePartnershipReward);
		act("resolveDiceRollReward", resolveDiceRollReward);
		act("resolveRoundBetReward", resolveRoundBetReward);

		if (!isGameEnded(this.gameState))
			return act("advanceRoundLead", advanceRoundLead);

		return act("resolveGameBetReward", resolveGameBetReward);
	}

	betRound(playerId: string, color: RunnerColors) {
		const act = this.createActor();

		act("betRound", (gameState) => betRound(gameState, playerId, color));
		return act("advanceTurn", advanceTurn);
	}

	betGame(playerId: string, color: RunnerColors, type: "first" | "last") {
		const act = this.createActor();

		act("betGame", (gameState) => betGame(gameState, playerId, color, type));
		return act("advanceTurn", advanceTurn);
	}

	setEffectTile(playerId: string, trackIndex: number, type: 1 | -1) {
		const act = this.createActor();

		act("setEffectTile", (gameState) =>
			setEffectTile(gameState, playerId, trackIndex, type),
		);
		return act("advanceTurn", advanceTurn);
	}

	partnerWith(playerId: string, partnerId: string) {
		const act = this.createActor();

		act("setPartnership", (gameState) =>
			setPartnership(gameState, playerId, partnerId),
		);
		return act("advanceTurn", advanceTurn);
	}
}
