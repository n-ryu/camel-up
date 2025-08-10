import { initTRPC } from "@trpc/server";
import z from "zod";
import type { Context } from "./context";
import { RoomService } from "./room";

const t = initTRPC.context<Context>().create();

const router = t.router;
const procedure = t.procedure;

const roomService = new RoomService();

export const appRouter = router({
	// for game play
	start: procedure
		.input(z.object({ roomId: z.string() }))
		.mutation(({ input: { roomId } }) => {
			roomService.start(roomId);
		}),
	roll: procedure
		.input(z.object({ roomId: z.string() }))
		.mutation(({ ctx: { connectionId }, input: { roomId } }) => {
			roomService.roll(roomId, connectionId);
		}),
	betRound: procedure
		.input(
			z.object({
				roomId: z.string(),
				color: z.enum(["red", "blue", "green", "yellow", "purple"]),
			}),
		)
		.mutation(({ ctx: { connectionId }, input: { roomId, color } }) => {
			roomService.betRound(roomId, connectionId, color);
		}),
	betGame: procedure
		.input(
			z.object({
				roomId: z.string(),
				color: z.enum(["red", "blue", "green", "yellow", "purple"]),
				type: z.enum(["first", "last"]),
			}),
		)
		.mutation(({ ctx: { connectionId }, input: { roomId, color, type } }) => {
			roomService.betGame(roomId, connectionId, color, type);
		}),
	partnerWith: procedure
		.input(z.object({ roomId: z.string(), partnerId: z.string() }))
		.mutation(({ ctx: { connectionId }, input: { roomId, partnerId } }) => {
			roomService.partnerWith(roomId, connectionId, partnerId);
		}),
	setEffectTile: procedure
		.input(
			z.object({
				roomId: z.string(),
				index: z.number(),
				type: z.enum(["1", "-1"]),
			}),
		)
		.mutation(({ ctx: { connectionId }, input: { roomId, index, type } }) => {
			roomService.setEffectTile(
				roomId,
				connectionId,
				index,
				Number(type) as 1 | -1,
			);
		}),

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
