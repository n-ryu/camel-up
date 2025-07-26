export interface Runner<
	RunnerColors extends string,
	Color extends RunnerColors = RunnerColors,
> {
	color: Color;
	bottom: Track<RunnerColors>;
	below: Runner<RunnerColors> | Track<RunnerColors>;
	above: Runner<RunnerColors> | undefined;
	top: Runner<RunnerColors> | undefined;
}

export interface Track<RunnerColors extends string> {
	index: number;
	above: Runner<RunnerColors> | undefined;
	top: Runner<RunnerColors> | undefined;
}

export interface TrackState<RunnerColors extends string> {
	runners: { [RunnerColor in RunnerColors]: Runner<RunnerColors, RunnerColor> };
	tracks: Track<RunnerColors>[];
}

export const createTrack = (index: number) => {
	const track = {
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
	const runner = {
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

export const createTrackState = <RunnerColors extends string>(
	tracks: {
		runners: RunnerColors[];
	}[],
): TrackState<RunnerColors> => {
	const innerTracks = tracks.map((_, i) => createTrack(i));
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
