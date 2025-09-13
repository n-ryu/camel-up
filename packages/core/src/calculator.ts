interface Runner {
	color: string;
	bottom: Track;
	below: Runner | Track;
	above: Runner | undefined;
	top: Runner | Track;
}

interface Track {
	index: number;
	above: Runner | undefined;
	top: Runner | Track;
}

interface TrackState {
	runners: Map<string, Runner>;
	tracks: Track[];
}

export const createTrack = (index: number) => {
	const track: Track = {
		index,
		above: undefined,
		get top() {
			return track.above === undefined ? track : track.above.top;
		},
	};

	return track;
};

export const createRunner = (color: string, below: Runner | Track): Runner => {
	const runner: Runner = {
		color,
		below,
		above: undefined,
		get bottom() {
			return "below" in runner.below ? runner.below.bottom : runner.below;
		},
		get top() {
			return runner.above === undefined ? runner : runner.above.top;
		},
	};

	runner.below.above = runner;

	return runner;
};

export const parseTrackState = (
	tracks: {
		runners: string[];
	}[],
): TrackState => {
	const innerTracks = tracks.map((_, i) => createTrack(i));
	const runnerList: Runner[] = [];
	tracks.forEach(({ runners }, i) =>
		runners.forEach((color) => {
			const runner = createRunner(color, innerTracks[i].top);
			runnerList.push(runner);
		}),
	);

	return {
		tracks: innerTracks,
		runners: new Map(runnerList.map((runner) => [runner.color, runner])),
	};
};

export const move = (
	trackState: TrackState,
	color: string,
	amount: number,
	options?: { toTheBottom?: boolean },
): TrackState => {
	const targetRunner = trackState.runners.get(color);

	if (!targetRunner) throw new Error("No runner exists in given color");
	const currentIndex = targetRunner.bottom.index;
	const targetIndex = currentIndex + amount;

	if (targetIndex < 0)
		throw new Error("runner cannot be former than the first track");

	if (targetIndex >= trackState.tracks.length) {
		trackState.tracks.push(
			...new Array(targetIndex - trackState.tracks.length + 1)
				.fill(0)
				.map((_, i) => createTrack(trackState.tracks.length + i)),
		);

		return move(trackState, color, amount, options);
	}

	if (options?.toTheBottom) {
		const destination = trackState.tracks[targetIndex];
		targetRunner.below.above = undefined;

		const runnerToBeAbove = destination.above;
		if (runnerToBeAbove) runnerToBeAbove.below = targetRunner.top;
		targetRunner.top.above = runnerToBeAbove;

		targetRunner.below = destination;
		destination.above = targetRunner;

		return trackState;
	}

	const destination = trackState.tracks[targetIndex].top;
	targetRunner.below.above = undefined;
	destination.above = targetRunner;
	targetRunner.below = destination;

	return trackState;
};

export const serializeTrackState = (
	trackState: TrackState,
): {
	runners: string[];
}[] => {
	return trackState.tracks.map((track) => {
		const runners: string[] = [];

		if (track.above) {
			const pushRunner = (runner: Runner) => {
				runners.push(runner.color);
				if (runner.above) pushRunner(runner.above);
			};
			pushRunner(track.above);
		}

		return { runners };
	});
};
