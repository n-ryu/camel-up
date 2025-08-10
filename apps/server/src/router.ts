import { initTRPC } from "@trpc/server";
import z from "zod";
import type { Context } from "./context";
import { RoomService } from "./services/room.service";

const t = initTRPC.context<Context>().create();

const router = t.router;
const procedure = t.procedure;

const roomService = new RoomService();

export const appRouter = router({
	// for game play
	getGame: procedure.query(() => {}),
	start: procedure.mutation(() => {}),
	roll: procedure.mutation(() => {}),
	betRound: procedure.mutation(() => {}),
	betGame: procedure.mutation(() => {}),
	partnerWith: procedure.mutation(() => {}),
	setEffectTile: procedure.mutation(() => {}),

	// for game subscription
	subscribe: procedure
		.input(
			z.object({
				roomId: z.string().or(z.undefined()),
				playerName: z.string(),
			}),
		)
		.subscription(({ ctx, input: { roomId, playerName } }) =>
			roomService.asyncIterator(roomId, {
				id: ctx.connectionId,
				name: playerName,
			}),
		),
});

export type AppRouter = typeof appRouter;
