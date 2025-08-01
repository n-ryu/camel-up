import * as calculator from "./calculator";
import { type GameState, moveRunners, rollDice } from "./gameState";

const gameState: GameState<"red" | "blue", "red" | "green"> = {
	tracks: [],
	dices: {
		unrolled: [],
		rolled: [],
	},
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
	isActive: false,
	isRoundLead: false,
	rollCount: 0,
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
		rollDice("player-0", {
			...gameState,
			players: [{ ...player }],
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
		}),
	).toEqual({
		gameState: {
			...gameState,
			players: [{ ...player, rollCount: 1 }],
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
		},
		diff: {
			dice: { color: "green", prevResult: { runnerColor: "blue", value: 2 } },
			player: { id: "player-0", rollCount: 1 },
		},
	});
});

it("resolveDiceRollReward", () => {});

it("setEffectTile", () => {});
it("resolveEffectTileReward", () => {});
it("isOnEffectTile", () => {});

it("betRound", () => {});
it("resolveRoundBetReward", () => {});

it("betGame", () => {});
it("resolveRoundBetReward", () => {});

it("setPartnership", () => {});
it("resolvePartnershipReward", () => {});

it("isRoundEnded", () => {});

it("isGameEnded", () => {});

it("endGame", () => {});
