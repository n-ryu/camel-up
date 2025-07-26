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
	}[];
}
