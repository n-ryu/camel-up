import { createRunner, createTrack, createTrackState } from "./track";

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

describe("createTrackState", () => {
	it("creates tracks, runners, and tiles in given state", () => {
		const trackState = createTrackState([
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
	it.todo("moves runner with given color for given amount of spaces");
	it.todo("moves runner to the top of the destination");
	it.todo("moves the runners above the designated runner along with it.");
	it.todo(
		"(with `toTheBottom` flag) puts the runner and runners above it to the bottom of the destination",
	);
});
