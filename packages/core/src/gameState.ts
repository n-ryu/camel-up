import { type Draft, produce } from "immer";
import { deserializeTrackState, move, serializeTrackState } from "./calculator";

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

export interface GameState<
	RunnerColors extends string,
	DiceColors extends string,
> {
	tracks: {
		runners: RunnerColors[];
		effectTile?: { type: 1 | -1; owner: string };
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
		hasEffectTile?: true;
		gameBetting: RunnerColors[];
		roundBetting: RoundBetCard<RunnerColors>[];
		partnership?: string;
		isActive: boolean;
		isRoundLead: boolean;
		rollCount: number;
	}[];
}

export const moveRunners = <R extends string, D extends string>(
	gameState: GameState<R, D>,
	runnerColor: R,
	value: number,
	{ toTheBottom }: { toTheBottom?: boolean } = {},
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		serializeTrackState(
			move(
				deserializeTrackState(draft.tracks),
				runnerColor as Draft<R>,
				value,
				{
					toTheBottom,
				},
			),
		).forEach(({ runners }, i) => {
			draft.tracks[i].runners = runners;
		});
	});
};

export const rollDice = <R extends string, D extends string>(
	playerId: string,
	gameState: GameState<R, D>,
): {
	gameState: GameState<R, D>;
	diff: { dice: RolledDice<D, R>; player: { id: string; rollCount: number } };
} => {
	const newGameState = produce(gameState, (draft) => {
		const player = draft.players.find(({ id }) => playerId === id);

		if (!player) throw new Error("player does not exist");

		const diceIndex = Math.floor(Math.random() * draft.dices.unrolled.length);
		const dice = draft.dices.unrolled[diceIndex];

		const optionIndex = Math.floor(Math.random() * dice.options.length);
		const option = dice.options[optionIndex];

		draft.dices.unrolled = draft.dices.unrolled.filter(
			(diceEl) => diceEl !== dice,
		);

		draft.dices.rolled.push({ color: dice.color, prevResult: option });

		player.rollCount++;
	});

	return {
		diff: {
			// biome-ignore lint/style/noNonNullAssertion: an existence is guaranteed
			dice: newGameState.dices.rolled.at(-1)!,
			player: {
				id: playerId,
				// biome-ignore lint/style/noNonNullAssertion: an existence is guaranteed
				rollCount: newGameState.players.find(({ id }) => playerId === id)!
					.rollCount,
			},
		},
		gameState: newGameState,
	};
};

export const resolveDiceRollReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const setEffectTile = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const resolveEffectTileReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const isOnEffectTile = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const betRound = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const resolveRoundBetReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const betGame = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const resolveGameBetReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const setPartnership = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const resolvePartnershipReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const isRoundEnded = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};

export const isGameEnded = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return gameState;
};
