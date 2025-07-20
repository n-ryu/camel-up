// atom types
export interface Dice {
	color: string;
	value: number;
	roll: () => number;
}

export interface EffectTile {
	owner: string;
}

export interface Runner {
	color: string;
}

export interface GameBetCard {
	color: string;
	owner: string;
}

export interface RoundBetCard {
	color: string;
	value: number;
}

export interface PartnershipCard {
	owner: string;
}

export interface Player {
	id: string;
	money: number;
	effectTile: EffectTile | undefined;
	partnershipCard: PartnershipCard;
	gameBetCards: GameBetCard[];
	roundBetCards: RoundBetCard[];
	rollTokens: unknown[];
}

// composite types
export interface Track {
	effectTile:
		| { negative: EffectTile; positive: never }
		| { positive: EffectTile; negative: never }
		| undefined;
	runners: Runner[];
}

export interface Board {
	players: Player[];
	unrolledDices: Dice[];
	rolledDices: Dice[];
	roundBetCards: Record<string, RoundBetCard[]>;
	firstOfTheGameBetCards: GameBetCard[];
	lastOfTheGameBetCards: GameBetCard[];
	tracks: Track[];
	rollTokens: unknown[];
}

export interface GameState {
	board: Board;
	activePlayer: string;
}

export type Action =
	| { type: "roll" }
	| { type: "roundBet"; color: string }
	| { type: "setEffectTile"; trackIndex: number; effect: "+" | "-" }
	| { type: "firstOfTheGameBet"; color: string }
	| { type: "lastOfTheGameBet"; color: string }
	| { type: "makePartnership"; targetPlayer: string };

export interface GameManager {
	read: () => GameState;
	init: () => GameState;
	play: (playerId: string, action: Action) => GameState[];
}
