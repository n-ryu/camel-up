import {
	COLORS,
	DEFAULT_MONEY,
	DICE_FACES,
	MAD_COLORS,
	NUMBER_OF_ROLL_TOKENS,
	TRACK_LENGTH,
} from "../constants";
import type { Board, Dice, Player } from "../types";
import { shuffle } from "../utils";

const createDice = (color: string): Dice => {
	let value: number = Math.ceil(DICE_FACES * Math.random());

	const roll = () => {
		value = Math.floor(DICE_FACES * Math.random());
		return value;
	};

	return { color, value, roll };
};

const createPlayer = (id: string): Player => ({
	id,
	money: DEFAULT_MONEY,
	effectTile: { owner: id },
	partnershipCard: { owner: id },
	gameBetCards: COLORS.map((color) => ({ owner: id, color })),
	roundBetCards: [],
	rollTokens: [],
});

export const createBoard = (playerIds: string[]): Board => {
	const board: Board = {
		players: playerIds.map((id) => createPlayer(id)),
		unrolledDices: [...COLORS, "gray"].map((color) => createDice(color)),
		rolledDices: [],
		roundBetCards: Object.fromEntries(
			COLORS.map((color) => [
				color,
				[5, 3, 2, 2].map((value) => ({ color, value })),
			]),
		),
		rollTokens: new Array(NUMBER_OF_ROLL_TOKENS).fill(0),
		firstOfTheGameBetCards: [],
		lastOfTheGameBetCards: [],
		tracks: new Array(TRACK_LENGTH)
			.fill(0)
			.map(() => ({ effectTile: undefined, runners: [] })),
	};

	shuffle(COLORS.map((color) => ({ color }))).forEach((runner) => {
		board.tracks.at(Math.floor(3 * Math.random()))?.runners.push(runner);
	});
	shuffle(MAD_COLORS.map((color) => ({ color }))).forEach((runner) => {
		board.tracks.at(-Math.floor(3 * Math.random()) - 1)?.runners.push(runner);
	});

	return board;
};
