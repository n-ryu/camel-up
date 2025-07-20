import { COLORS } from "../constants";
import type { Action, Board, GameManager, GameState } from "../types";
import { shuffle } from "../utils";
import { createBoard } from "./board";

const findRunnerByColor = (
	board: Board,
	color: string,
): { trackIndex: number; runnerIndex: number } => {
	let runnerIndex = -1;
	const trackIndex = board.tracks.findIndex(({ runners }) => {
		runnerIndex = runners.findIndex((runner) => runner.color === color);
		return runnerIndex !== -1;
	});

	return { trackIndex, runnerIndex };
};

const findRunnerByDice = (
	board: Board,
	dice: { color: string; value: number },
): { color: string; trackIndex: number; runnerIndex: number } => {
	if (dice.color !== "gray")
		return { color: dice.color, ...findRunnerByColor(board, dice.color) };

	const white = findRunnerByColor(board, "white");
	const onTheWhite =
		board.tracks.at(white.trackIndex).runners.length - white.runnerIndex - 1;
	const black = findRunnerByColor(board, "black");
	const onTheBlack =
		board.tracks.at(black.trackIndex).runners.length - black.runnerIndex - 1;

	if (!!onTheWhite === !!onTheBlack) {
		return Math.floor(dice.value / 3)
			? { color: "white", ...white }
			: { color: "black", ...black };
	}

	return onTheWhite > onTheBlack
		? { color: "white", ...white }
		: { color: "black", ...black };
};

const roll = (playerId: string, board: Board): Board[] => {
	const result: Board[] = [];
	const targetIndex = Math.floor(board.unrolledDices.length * Math.random());
	const dice = board.unrolledDices.at(targetIndex);

	// roll dice
	dice.roll();
	board.unrolledDices.splice(targetIndex, 1);
	board.rolledDices.push(dice);
	board.players
		.find(({ id }) => playerId === id)
		.rollTokens.push(board.rollTokens.pop());

	result.push(JSON.parse(JSON.stringify(board)));

	// move runners
	const {
		color: targetColor,
		trackIndex,
		runnerIndex,
	} = findRunnerByDice(board, dice);
	const direction = COLORS.includes(targetColor as (typeof COLORS)[number])
		? 1
		: -1;

	const fromTrack = board.tracks.at(trackIndex);
	const toTrackIndex = trackIndex + ((dice.value % 3) + 1) * direction;
	const toTrack = board.tracks.at(toTrackIndex);

	const spliced = fromTrack.runners.splice(
		runnerIndex,
		fromTrack.runners.length - runnerIndex,
	);
	toTrack.runners.push(...spliced);

	result.push(JSON.parse(JSON.stringify(board)));

	// apply tile effect
	if (toTrack.effectTile) {
		if (toTrack.effectTile.positive) {
			const nextTrack = board.tracks.at(toTrackIndex + direction);
			const spliced = toTrack.runners.splice(0);
			nextTrack.runners.push(...spliced);

			const tileOwner = board.players.find(
				({ id }) => id === toTrack.effectTile.positive.owner,
			);
			tileOwner.money++;
		} else {
			const prevTrack = board.tracks.at(toTrackIndex - direction);
			const spliced = toTrack.runners.splice(0);
			prevTrack.runners.splice(0, 0, ...spliced);

			const tileOwner = board.players.find(
				({ id }) => id === toTrack.effectTile.negative.owner,
			);
			tileOwner.money++;
		}
		result.push(JSON.parse(JSON.stringify(board)));
	}

	return result;
};

export const createGameManager = (playerList: string[]): GameManager => {
	const playerIds = shuffle(playerList);

	let board: Board = createBoard(playerIds);
	let activePlayerIndex = 0;

	const read = () => ({ board, activePlayer: playerIds.at(0) });

	const advanceTurn = () => {
		activePlayerIndex = (activePlayerIndex + 1) % playerIds.length;
		return read();
	};

	const init = () => {
		board = createBoard(playerIds);
		return read();
	};

	const play = (playerId: string, action: Action): GameState[] => {
		let result: GameState[];

		if (playerId !== board.players.at(activePlayerIndex).id)
			throw new Error(`This turn is ${playerId}'s turn!`);

		if (action.type === "roll") {
			result = roll(playerId, board).map((board) => ({
				board,
				activePlayer: board.players.at(activePlayerIndex).id,
			}));
		}

		advanceTurn();
		return result;
	};

	return { read, init, play };
};
