import {
	betGame,
	betRound,
	type GameState,
	isOnEffectTile,
	moveRunners,
	resolveDiceRollReward,
	resolveEffectTileReward,
	resolveGameBetReward,
	resolvePartnershipReward,
	resolveRoundBetReward,
	rollDice,
	setEffectTile,
	setPartnership,
} from "./gameState";

const gameState: GameState<"red" | "blue", "red" | "green"> = {
	initialTrackLength: 0,
	gameBetRewards: {
		first: [],
		last: [],
	},
	gameBetPenalty: {
		first: -1,
		last: -1,
	},
	tracks: [],
	dices: {
		unrolled: [],
		rolled: [],
	},
	rollTokens: [],
	gameBetting: {
		first: [],
		last: [],
	},
	roundBetting: {
		red: [],
		blue: [],
	},
	players: [],
};

const player: (typeof gameState)["players"][number] = {
	id: "player-0",
	money: 0,
	gameBetting: [],
	roundBetting: [],
	hasEffectTile: true,
	isActive: false,
	isRoundLead: false,
	rollTokens: [],
};

it("moveRunners", () => {
	expect(
		moveRunners(
			{
				...gameState,
				tracks: [{ runners: ["red"] }, { runners: ["blue"] }, { runners: [] }],
			},
			"red",
			1,
		),
	).toEqual({
		...gameState,
		tracks: [{ runners: [] }, { runners: ["blue", "red"] }, { runners: [] }],
	});
});

it("rollDice", () => {
	jest.spyOn(Math, "random").mockReturnValueOnce(1 / 2 + 0.0001);
	jest.spyOn(Math, "random").mockReturnValueOnce(1 / 3 + 0.0001);

	expect(
		rollDice(
			{
				...gameState,
				players: [{ ...player }],
				rollTokens: [1, 2, 3],
				dices: {
					unrolled: [
						{
							color: "red",
							options: [
								{ runnerColor: "red", value: 1 },
								{ runnerColor: "red", value: 2 },
								{ runnerColor: "red", value: 3 },
							],
						},
						{
							color: "green",
							options: [
								{ runnerColor: "blue", value: 1 },
								{ runnerColor: "blue", value: 2 },
								{ runnerColor: "blue", value: 3 },
							],
						},
					],
					rolled: [],
				},
			},
			"player-0",
		),
	).toEqual({
		...gameState,
		players: [{ ...player, rollTokens: [3] }],
		rollTokens: [1, 2],
		dices: {
			unrolled: [
				{
					color: "red",
					options: [
						{ runnerColor: "red", value: 1 },
						{ runnerColor: "red", value: 2 },
						{ runnerColor: "red", value: 3 },
					],
				},
			],
			rolled: [
				{
					color: "green",
					prevResult: { runnerColor: "blue", value: 2 },
				},
			],
		},
	});
});

it.todo("rollDice throws an error if no such player exists");
it.todo("rollDice throws an error if no unrolled dice remains");
it.todo("rollDice throws an error if no rollToken remains");

it("resolveDiceRollReward", () => {
	expect(
		resolveDiceRollReward({
			...gameState,
			players: [
				{ ...player, id: "player-0", money: 1, rollTokens: [1, 2] },
				{ ...player, id: "player-1", money: 10, rollTokens: [3] },
			],
		}),
	).toEqual({
		...gameState,
		players: [
			{ ...player, id: "player-0", money: 4, rollTokens: [] },
			{ ...player, id: "player-1", money: 13, rollTokens: [] },
		],
	});
});

it("setEffectTile", () => {
	expect(
		setEffectTile(
			{
				...gameState,
				tracks: [{ runners: ["red"] }, { runners: ["blue"] }, { runners: [] }],
				players: [{ ...player, hasEffectTile: true }],
			},
			"player-0",
			2,
			-1,
		),
	).toEqual({
		...gameState,
		tracks: [
			{ runners: ["red"] },
			{ runners: ["blue"] },
			{ runners: [], effectTile: { owner: "player-0", type: -1 } },
		],
		players: [{ ...player, hasEffectTile: false }],
	});
});

it("setEffectTile moves existing effectTile if it is already set", () => {
	expect(
		setEffectTile(
			{
				...gameState,
				tracks: [
					{ runners: ["red"] },
					{ runners: [], effectTile: { owner: "player-0", type: 1 } },
					{ runners: [] },
				],
				players: [{ ...player, hasEffectTile: false }],
			},
			"player-0",
			2,
			-1,
		),
	).toEqual({
		...gameState,
		tracks: [
			{ runners: ["red"] },
			{ runners: [] },
			{ runners: [], effectTile: { owner: "player-0", type: -1 } },
		],
		players: [{ ...player, hasEffectTile: false }],
	});
});

it.todo("setEffectTile throws an error if no such player exists");
it.todo(
	"setEffectTile throws an error if no such track with given index exists",
);
it.todo("setEffectTile throws an error if target track has runners on it");
it.todo(
	"setEffectTile throws an error if target track has adjacent track with effect tile",
);

it("isOnEffectTile returns index of track having runner on the effect tile", () => {
	expect(
		isOnEffectTile({
			...gameState,
			tracks: [
				{ runners: ["red"] },
				{ runners: ["blue"], effectTile: { owner: "player-0", type: 1 } },
				{ runners: [] },
			],
		}),
	).toEqual({ value: true, index: 1 });
});

it("isOnEffectTile returns value with false when no track has runner on the effect tile", () => {
	expect(
		isOnEffectTile({
			...gameState,
			tracks: [
				{ runners: ["red"] },
				{ runners: [], effectTile: { owner: "player-0", type: 1 } },
				{ runners: [] },
			],
		}),
	).toEqual({ value: false, index: undefined });
});

it("resolveEffectTileReward", () => {
	expect(
		resolveEffectTileReward({
			...gameState,
			tracks: [
				{ runners: ["red"] },
				{ runners: ["blue"], effectTile: { owner: "player-0", type: 1 } },
				{ runners: [] },
			],
			players: [{ ...player, id: "player-0", money: 1 }],
		}),
	).toEqual({
		...gameState,
		tracks: [
			{ runners: ["red"] },
			{ runners: ["blue"], effectTile: { owner: "player-0", type: 1 } },
			{ runners: [] },
		],
		players: [{ ...player, id: "player-0", money: 2 }],
	});
});

it.todo(
	"resolveEffectTileReward throws an error if no track has runner on the effect ",
);

it("betRound", () => {
	expect(
		betRound(
			{
				...gameState,
				players: [{ ...player, id: "player-0", roundBetting: [] }],
				roundBetting: {
					red: [
						{ color: "red", value: [2, 1, -1] },
						{ color: "red", value: [3, 1, -1] },
					],
					blue: [{ color: "blue", value: [2, 1, -1] }],
				},
			},
			"player-0",
			"red",
		),
	).toEqual({
		...gameState,
		players: [
			{
				...player,
				id: "player-0",
				roundBetting: [{ color: "red", value: [3, 1, -1] }],
			},
		],
		roundBetting: {
			red: [{ color: "red", value: [2, 1, -1] }],
			blue: [{ color: "blue", value: [2, 1, -1] }],
		},
	});
});
it.todo("betRound throws error if no betting card remains for desired color");

it("resolveRoundBetReward", () => {
	expect(
		resolveRoundBetReward({
			...gameState,
			roundBetting: {
				red: [],
				blue: [],
			},
			tracks: [{ runners: [] }, { runners: ["blue", "red"] }, { runners: [] }],
			players: [
				{
					...player,
					id: "player-0",
					money: 10,
					roundBetting: [
						{ color: "red", value: [3, -1] },
						{ color: "red", value: [1, -1] },
						{ color: "blue", value: [3, 1, -1] },
					],
				},
				{
					...player,
					id: "player-1",
					money: 10,
					roundBetting: [{ color: "blue", value: [-1] }],
				},
			],
		}),
	).toEqual({
		...gameState,
		roundBetting: {
			red: [
				{ color: "red", value: [1, -1] },
				{ color: "red", value: [3, -1] },
			],
			blue: [
				{ color: "blue", value: [-1] },
				{ color: "blue", value: [3, 1, -1] },
			],
		},
		tracks: [{ runners: [] }, { runners: ["blue", "red"] }, { runners: [] }],
		players: [
			{
				...player,
				id: "player-0",
				money: 15,
				roundBetting: [],
			},
			{
				...player,
				id: "player-1",
				money: 9,
				roundBetting: [],
			},
		],
	});
});
it.todo("resolveRoundBetReward set player money to zero if it goes below zero");

it("betGame", () => {
	expect(
		betGame(
			{
				...gameState,
				gameBetting: {
					first: [],
					last: [{ owner: "player-0", color: "blue" }],
				},
				players: [{ ...player, id: "player-0", gameBetting: ["red"] }],
			},
			"player-0",
			"red",
			"last",
		),
	).toEqual({
		...gameState,
		gameBetting: {
			first: [],
			last: [
				{ owner: "player-0", color: "blue" },
				{ owner: "player-0", color: "red" },
			],
		},
		players: [{ ...player, id: "player-0", gameBetting: [] }],
	});
});
it.todo(
	"betGame throws an error if the player already made a bet for desired color",
);

it("resolveGameBetReward", () => {
	expect(
		resolveGameBetReward({
			...gameState,
			tracks: [{ runners: ["red"] }, { runners: ["blue"] }],
			gameBetRewards: { first: [8], last: [5] },
			gameBetPenalty: { first: -1, last: -1 },

			gameBetting: {
				first: [
					{ owner: "player-0", color: "red" },
					{ owner: "player-0", color: "blue" },
					{ owner: "player-1", color: "blue" },
				],
				last: [{ owner: "player-1", color: "red" }],
			},

			players: [
				{ ...player, id: "player-0", money: 10 },
				{ ...player, id: "player-1", money: 10 },
			],
		}),
	).toEqual({
		...gameState,
		tracks: [{ runners: ["red"] }, { runners: ["blue"] }],
		gameBetRewards: { first: [8], last: [5] },
		gameBetPenalty: { first: -1, last: -1 },

		gameBetting: { first: [], last: [] },
		players: [
			{
				...player,
				id: "player-0",
				money: 10 + 8 - 1,
				gameBetting: expect.any(Array),
			},
			{
				...player,
				id: "player-1",
				money: 10 + 0 + 5,
				gameBetting: expect.any(Array),
			},
		],
	});
});

it("setPartnership", () => {
	expect(
		setPartnership(
			{
				...gameState,
				players: [
					{ ...player, id: "player-0", partnership: undefined },
					{ ...player, id: "player-1", partnership: undefined },
				],
			},
			"player-0",
			"player-1",
		),
	).toEqual({
		...gameState,
		players: [
			{ ...player, id: "player-0", partnership: "player-1" },
			{ ...player, id: "player-1", partnership: "player-0" },
		],
	});
});
it.todo("setPartnership throws an error if one of player already has partner");

it("resolvePartnershipReward", () => {
	expect(
		resolvePartnershipReward({
			...gameState,
			tracks: [{ runners: ["blue", "red"] }],
			players: [
				{
					...player,
					id: "player-0",
					partnership: "player-1",
					money: 0,
					rollTokens: [1],
				},
				{
					...player,
					id: "player-1",
					partnership: "player-0",
					money: 0,
					roundBetting: [{ color: "red", value: [5, 1, -1] }],
				},
			],
		}),
	).toEqual({
		...gameState,
		tracks: [{ runners: ["blue", "red"] }],
		players: [
			{
				...player,
				id: "player-0",
				rollTokens: [1],
				partnership: undefined,
				money: 5,
			},
			{
				...player,
				id: "player-1",
				roundBetting: [{ color: "red", value: [5, 1, -1] }],
				partnership: undefined,
				money: 1,
			},
		],
	});
});
