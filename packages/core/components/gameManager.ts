import type { Board, Dice, Player } from "./types";

const TRACK_LENGTH = 16;
const DEFAULT_MONEY = 3;
const DICE_FACES = 6;
const COLORS = ["red", "blue", "green", "purple", "yellow"] as const;
const MAD_COLORS = ["white", "black"] as const;

const createDice = (color: string): Dice => {
	let value: number = Math.ceil(DICE_FACES * Math.random());

	const role = () => {
		const result = Math.ceil(DICE_FACES * Math.random());
		value = result;
		return value;
	};

	return {
		color,
		value,
		role,
	};
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

const createBoard = (): Board => ({
	players: ([] as string[]).map((id) => createPlayer(id)),
	unrolledDices: COLORS.map((color) => createDice(color)),
	rolledDices: [],
	roundBetCards: Object.fromEntries(
		COLORS.map((color) => [
			color,
			[5, 3, 2, 2].map((value) => ({ color, value })),
		]),
	),
	firstOfTheGameBetCards: [],
	lastOfTheGameBetCards: [],
	tracks: new Array(TRACK_LENGTH)
		.fill(0)
		.map(() => ({ effectTile: undefined, runners: [] })),
});
