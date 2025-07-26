import {
	createRunner,
	createTrack,
	deserializeTrackState,
	move,
	serializeTrackState,
} from "./track";

describe("createTrack", () => {
	it("creates track with given index", () => {
		const track = createTrack(2);

		expect(track.index).toBe(2);
	});
});

describe("createRunner", () => {
	it("creates runner with given color", () => {
		const track = createTrack(0);
		const runner = createRunner("red", track);

		expect(runner.color).toBe("red");
	});

	it("creates runner which has runner/track given as second argument as `below` property", () => {
		const track = createTrack(0);
		const runner = createRunner("red", track);

		expect(runner.below).toBe(track);
	});

	it("also sets the `above` of the runner/track given as second argument to the returning object", () => {
		const track = createTrack(0);
		const runner = createRunner("red", track);

		expect(track.above).toBe(runner);
	});
});

describe("track & runner", () => {
	it("returns the very top object when reading `top` property", () => {
		const track = createTrack(0);
		const runner1 = createRunner("red", track);
		const runner2 = createRunner("red", runner1);
		const runner3 = createRunner("red", runner2);

		expect(track.top).toBe(runner3);
		expect(runner1.top).toBe(runner3);
		expect(runner2.top).toBe(runner3);
		expect(runner3.top).toBe(runner3);
	});

	it("returns the very bottom object when reading `bottom` property", () => {
		const track = createTrack(0);
		const runner1 = createRunner("red", track);
		const runner2 = createRunner("red", runner1);
		const runner3 = createRunner("red", runner2);

		expect(runner1.bottom).toBe(track);
		expect(runner2.bottom).toBe(track);
		expect(runner3.bottom).toBe(track);
	});
});

describe("deserializeTrackState", () => {
	it("creates deserialized tracks and runners with given state", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue", "green", "yellow"] },
			{ runners: [] },
			{ runners: ["purple"] },
		]);

		expect(trackState.tracks[0].above).toBeUndefined();
		expect(trackState.tracks[1].above).toHaveProperty("color", "red");
		expect(trackState.tracks[2].above).toHaveProperty("color", "blue");
		expect(trackState.tracks[3].above).toBeUndefined();
		expect(trackState.tracks[4].above).toHaveProperty("color", "purple");

		expect(trackState.runners.red.below).toBe(trackState.tracks[1]);
		expect(trackState.runners.red.above).toBeUndefined();
		expect(trackState.runners.blue.below).toBe(trackState.tracks[2]);
		expect(trackState.runners.blue.above).toBe(trackState.runners.green);
		expect(trackState.runners.green.below).toBe(trackState.runners.blue);
		expect(trackState.runners.green.above).toBe(trackState.runners.yellow);
		expect(trackState.runners.yellow.below).toBe(trackState.runners.green);
		expect(trackState.runners.yellow.above).toBeUndefined();
		expect(trackState.runners.purple.below).toBe(trackState.tracks[4]);
		expect(trackState.runners.purple.above).toBeUndefined();
	});
});

describe("move", () => {
	it("moves runner with given color for given amount of spaces", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue", "green", "yellow"] },
			{ runners: [] },
			{ runners: ["purple"] },
		]);

		move(trackState, "red", 2);

		expect(trackState.runners.red.bottom.index).toBe(3);
		expect(trackState.tracks[3].above).toBe(trackState.runners.red);
	});

	it("moves runner to the top of the destination", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue", "green", "yellow"] },
			{ runners: [] },
			{ runners: ["purple"] },
		]);

		move(trackState, "red", 1);

		expect(trackState.runners.red.below).toBe(trackState.runners.yellow);
		expect(trackState.runners.yellow.above).toBe(trackState.runners.red);

		expect(trackState.runners.red.bottom).toBe(trackState.tracks[2]);
		expect(trackState.tracks[2].top).toBe(trackState.runners.red);
	});

	it("moves the runners above the designated runner along with it.", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue", "green", "yellow"] },
			{ runners: [] },
			{ runners: ["purple"] },
		]);

		move(trackState, "green", 2);

		expect(trackState.runners.blue.above).toBeUndefined();

		expect(trackState.runners.green.below).toBe(trackState.runners.purple);
		expect(trackState.runners.purple.above).toBe(trackState.runners.green);

		expect(trackState.tracks[4].top).toBe(trackState.runners.yellow);
		expect(trackState.runners.yellow.bottom).toBe(trackState.tracks[4]);
	});

	it("(with `toTheBottom` flag) puts the runner and runners above it to the bottom of the destination", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue", "green", "yellow"] },
			{ runners: [] },
			{ runners: ["purple"] },
		]);

		move(trackState, "green", 2, { toTheBottom: true });

		expect(trackState.runners.blue.above).toBeUndefined();

		expect(trackState.runners.green.below).toBe(trackState.tracks[4]);
		expect(trackState.tracks[4].above).toBe(trackState.runners.green);

		expect(trackState.runners.yellow.above).toBe(trackState.runners.purple);
		expect(trackState.runners.purple.below).toBe(trackState.runners.yellow);

		expect(trackState.tracks[4].top).toBe(trackState.runners.purple);
		expect(trackState.runners.purple.bottom).toBe(trackState.tracks[4]);
	});

	it("appends the tracks array if the destination should be latter than the last track", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
		]);

		move(trackState, "red", 3, { toTheBottom: true });

		expect(trackState.tracks.length).toBe(5);
		expect(trackState.tracks[1].above).toBeUndefined();
		expect(trackState.tracks[2].above).toBeUndefined();
		expect(trackState.tracks[3].above).toBeUndefined();
		expect(trackState.tracks[4].above).toBe(trackState.runners.red);
	});

	it("throws an error if the destination should be former than the first track", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
		]);

		expect(() => move(trackState, "red", -3, { toTheBottom: true })).toThrow(
			"runner cannot be former than the first track",
		);
	});
});

describe("serializeTrackState", () => {
	it("serializes given deserialized trackState", () => {
		const trackState = deserializeTrackState([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue", "green", "yellow"] },
			{ runners: [] },
			{ runners: ["purple"] },
		]);

		move(trackState, "green", 2);

		expect(serializeTrackState(trackState)).toEqual([
			{ runners: [] },
			{ runners: ["red"] },
			{ runners: ["blue"] },
			{ runners: [] },
			{ runners: ["purple", "green", "yellow"] },
		]);
	});
});
