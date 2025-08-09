import { initTRPC } from "@trpc/server";
import * as z from "zod";

const t = initTRPC.create();

const router = t.router;
const procedure = t.procedure;

export const appRouter = router({
	// for room management
	getRoom: procedure.query(() => {}),
	createRoom: procedure
		.input(z.object({ playerName: z.string() }))
		.mutation(({ playerName }) => {}),
	enterRoom: procedure.mutation(() => {}),
	exitRoom: procedure.mutation(() => {}),

	// for game play
	getGame: procedure.query(() => {}),
	start: procedure.mutation(() => {}),
	roll: procedure.mutation(() => {}),
	betRound: procedure.mutation(() => {}),
	betGame: procedure.mutation(() => {}),
	partnerWith: procedure.mutation(() => {}),
	setEffectTile: procedure.mutation(() => {}),

	// for game subscription
	// subscribeRoom: procedure.subscription(() => {})
	// subscribeGame: procedure.subscription(() => {}),
});

export type AppRouter = typeof appRouter;
