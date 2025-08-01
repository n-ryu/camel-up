interface Runner<
	RunnerColors extends string,
	Color extends RunnerColors = RunnerColors,
> {
	color: Color;
	bottom: Track<RunnerColors>;
	below: Runner<RunnerColors> | Track<RunnerColors>;
	above: Runner<RunnerColors> | undefined;
	top: Runner<RunnerColors> | Track<RunnerColors>;
}

interface Track<RunnerColors extends string> {
	index: number;
	above: Runner<RunnerColors> | undefined;
	top: Runner<RunnerColors> | Track<RunnerColors>;
}

interface TrackState<RunnerColors extends string> {
	runners: { [RunnerColor in RunnerColors]: Runner<RunnerColors, RunnerColor> };
	tracks: Track<RunnerColors>[];
}

export const createTrack = <RunnerColors extends string>(index: number) => {
	const track: Track<RunnerColors> = {
		index,
		above: undefined,
		get top() {
			return track.above === undefined ? track : track.above.top;
		},
	};

	return track;
};

export const createRunner = <
	RunnerColors extends string,
	Color extends RunnerColors = RunnerColors,
>(
	color: Color,
	below: Runner<RunnerColors> | Track<RunnerColors>,
): Runner<RunnerColors, Color> => {
	const runner: Runner<RunnerColors, Color> = {
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

export const deserializeTrackState = <RunnerColors extends string>(
	tracks: {
		runners: RunnerColors[];
	}[],
): TrackState<RunnerColors> => {
	const innerTracks = tracks.map((_, i) => createTrack<RunnerColors>(i));
	const runnerList: Runner<RunnerColors>[] = [];
	tracks.forEach(({ runners }, i) =>
		runners.forEach((color) => {
			const runner = createRunner(color, innerTracks[i].top);
			runnerList.push(runner);
		}),
	);

	return {
		tracks: innerTracks,
		runners: Object.fromEntries(
			runnerList.map((runner) => [runner.color, runner]),
		) as { [RunnerColor in RunnerColors]: Runner<RunnerColors, RunnerColor> },
	};
};

export const move = <RunnerColors extends string>(
	trackState: TrackState<RunnerColors>,
	color: RunnerColors,
	amount: number,
	options?: { toTheBottom?: boolean },
): TrackState<RunnerColors> => {
	const targetRunner = trackState.runners[color];
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

export const serializeTrackState = <RunnerColors extends string>(
	trackState: TrackState<RunnerColors>,
): {
	runners: RunnerColors[];
}[] => {
	return trackState.tracks.map((track) => {
		const runners: RunnerColors[] = [];

		if (track.above) {
			const pushRunner = (runner: Runner<RunnerColors>) => {
				runners.push(runner.color);
				if (runner.above) pushRunner(runner.above);
			};
			pushRunner(track.above);
		}

		return { runners };
	});
};
