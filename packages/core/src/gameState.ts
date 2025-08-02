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
	initialTrackLength: number;
	gameBetRewards: {
		first: number[];
		last: number[];
	};
	gameBetPenalty: {
		first: number;
		last: number;
	};

	tracks: {
		runners: RunnerColors[];
		effectTile?: { type: 1 | -1; owner: string };
	}[];

	dices: {
		unrolled: UnrolledDice<DiceColors, RunnerColors>[];
		rolled: RolledDice<DiceColors, RunnerColors>[];
	};

	rollTokens: number[];

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
		hasEffectTile: boolean;
		gameBetting: RunnerColors[];
		roundBetting: RoundBetCard<RunnerColors>[];
		partnership?: string;
		isActive: boolean;
		isRoundLead: boolean;
		rollTokens: number[];
	}[];
}

const getLeaderboard = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): R[] => gameState.tracks.flatMap(({ runners }) => runners).toReversed();

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
	gameState: GameState<R, D>,
	playerId: string,
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		const player = draft.players.find(({ id }) => playerId === id);
		if (!player) throw new Error("player does not exist");

		if (draft.dices.unrolled.length < 1)
			throw new Error("no unrolled dice remains");

		const diceIndex = Math.floor(Math.random() * draft.dices.unrolled.length);
		const dice = draft.dices.unrolled[diceIndex];

		const optionIndex = Math.floor(Math.random() * dice.options.length);
		const option = dice.options[optionIndex];

		draft.dices.unrolled = draft.dices.unrolled.filter(
			(diceEl) => diceEl !== dice,
		);

		draft.dices.rolled.push({ color: dice.color, prevResult: option });

		const rollToken = draft.rollTokens.pop();
		if (!rollToken) throw new Error("no roll token remains");

		player.rollTokens.push(rollToken);
	});
};

export const resolveDiceRollReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		draft.players.forEach((player) => {
			player.money += player.rollTokens.reduce((sum, value) => sum + value, 0);
			player.rollTokens = [];
		});
	});
};

export const setEffectTile = <R extends string, D extends string>(
	gameState: GameState<R, D>,
	playerId: string,
	trackIndex: number,
	type: 1 | -1,
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		const player = draft.players.find(({ id }) => playerId === id);
		if (!player) throw new Error("player does not exist");

		player.hasEffectTile = false;

		const prevSetTrack = draft.tracks.find(
			({ effectTile }) => playerId === effectTile?.owner,
		);
		if (prevSetTrack) prevSetTrack.effectTile = undefined;

		const targetTrack = draft.tracks.at(trackIndex);
		if (!targetTrack) throw new Error("targetIndex is out of bound");

		if (targetTrack.runners.length > 0)
			throw new Error("targetTrack has runners on it");

		if (
			(draft.tracks[trackIndex + 1] &&
				draft.tracks[trackIndex + 1].effectTile) ||
			(draft.tracks[trackIndex - 1] && draft.tracks[trackIndex - 1].effectTile)
		)
			throw new Error("effectTile is already set in adjacent track");

		targetTrack.effectTile = { owner: playerId, type };
	});
};

export const isOnEffectTile = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): { value: true; index: number } | { value: false; index: undefined } => {
	const index = gameState.tracks.findIndex(
		({ runners, effectTile }) => runners.length > 0 && !!effectTile,
	);
	return index === -1
		? { value: false, index: undefined }
		: { value: true, index };
};

export const resolveEffectTileReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	const { value, index } = isOnEffectTile(gameState);
	if (!value) throw new Error("no track has runners on an effect tile");

	return produce(gameState, (draft) => {
		// biome-ignore lint/style/noNonNullAssertion: existence is guaranteed
		const { owner, type } = draft.tracks[index].effectTile!;

		const player = draft.players.find(({ id }) => owner === id);
		if (!player) throw new Error("player does not exist");

		player.money += type;
	});
};

export const betRound = <R extends string, D extends string>(
	gameState: GameState<R, D>,
	playerId: string,
	color: R,
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		const player = draft.players.find(({ id }) => playerId === id);
		if (!player) throw new Error("player does not exist");

		const roundBetting = draft.roundBetting[color as string].pop();
		if (!roundBetting)
			throw new Error("no place for betting is left for desired runner color");

		player.roundBetting.push(roundBetting);
	});
};

export const resolveRoundBetReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
	sort: (a: RoundBetCard<R>, b: RoundBetCard<R>) => number = (a, b) =>
		a.value[0] - b.value[0],
): GameState<R, D> => {
	const ranks = Object.fromEntries(
		getLeaderboard(gameState).map((color, index) => [color, index]),
	);
	return produce(gameState, (draft) => {
		draft.players.forEach((player) => {
			player.roundBetting.forEach((bet) => {
				if (bet.value.length < 1)
					throw new Error("roundBet has empty value cannot exist");

				const rank = ranks[bet.color];
				if (rank >= bet.value.length)
					player.money += bet.value[bet.value.length - 1];
				else player.money += bet.value[rank];

				player.money = Math.max(0, player.money);

				draft.roundBetting[bet.color as string].push(bet);
			});
			player.roundBetting = [];
		});

		Object.keys(draft.roundBetting).forEach((color) =>
			draft.roundBetting[color].sort(sort),
		);
	});
};

export const betGame = <R extends string, D extends string>(
	gameState: GameState<R, D>,
	playerId: string,
	color: R,
	betType: "first" | "last",
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		const player = draft.players.find(({ id }) => playerId === id);
		if (!player) throw new Error("player does not exist");

		if (!player.gameBetting.includes(color as Draft<R>))
			throw new Error("player already made a bet for desired color");

		player.gameBetting = player.gameBetting.filter(
			(runnerColor) => color !== runnerColor,
		);

		draft.gameBetting[betType].push({
			owner: playerId,
			color: color as Draft<R>,
		});
	});
};

export const resolveGameBetReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	const rewards = {
		first: [...gameState.gameBetRewards.first],
		last: [...gameState.gameBetRewards.last],
	};
	const [firstRunner] = getLeaderboard(gameState);
	const [lastRunner] = getLeaderboard(gameState).toReversed();

	return produce(gameState, (draft) => {
		draft.gameBetting.first.forEach(({ owner, color }) => {
			const player = draft.players.find(({ id }) => owner === id);
			if (!player) throw new Error("player does not exist");

			if (color === firstRunner) player.money += rewards.first.pop() ?? 0;
			else player.money += gameState.gameBetPenalty.first;

			player.gameBetting.push(color);
		});
		draft.gameBetting.first = [];

		draft.gameBetting.last.forEach(({ owner, color }) => {
			const player = draft.players.find(({ id }) => owner === id);
			if (!player) throw new Error("player does not exist");

			if (color === lastRunner) player.money += rewards.last.pop() ?? 0;
			else player.money += gameState.gameBetPenalty.last;

			player.gameBetting.push(color);
		});
		draft.gameBetting.last = [];
	});
};

export const setPartnership = <R extends string, D extends string>(
	gameState: GameState<R, D>,
	playerId1: string,
	playerId2: string,
): GameState<R, D> => {
	return produce(gameState, (draft) => {
		const player1 = draft.players.find(({ id }) => playerId1 === id);
		if (!player1) throw new Error("player does not exist");

		const player2 = draft.players.find(({ id }) => playerId2 === id);
		if (!player2) throw new Error("player does not exist");

		if (player1.partnership || player2.partnership)
			throw new Error("one of player already has partner");

		player1.partnership = playerId2;
		player2.partnership = playerId1;
	});
};

export const resolvePartnershipReward = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): GameState<R, D> => {
	const ranks = Object.fromEntries(
		getLeaderboard(gameState).map((color, index) => [color, index]),
	);

	return produce(gameState, (draft) => {
		draft.players.forEach((player) => {
			const partner = draft.players.find(({ id }) => player.partnership === id);
			if (player.partnership && !partner)
				throw new Error("player does not exist");
			if (!partner) return;

			const partnershipReward = Math.max(
				...partner.rollTokens,
				...partner.roundBetting.map(({ color, value }) => {
					const rank = ranks[color];
					if (rank >= value.length) return value[value.length - 1];
					else return value[rank];
				}),
				0,
			);

			player.money += partnershipReward;
			player.partnership = undefined;
		});
	});
};

export const isRoundEnded = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): boolean => {
	return gameState.rollTokens.length === 0;
};

export const isGameEnded = <R extends string, D extends string>(
	gameState: GameState<R, D>,
): boolean => {
	return gameState.tracks.length > gameState.initialTrackLength;
};
