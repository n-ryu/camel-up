import { EventEmitter, on } from "node:events";
import {
	type Action,
	type DefaultDiceColors,
	type DefaultRunnerColors,
	Game,
	type GameState,
} from "@camel-up/core";

interface Player {
	id: string;
	name: string;
}

interface Room {
	id: string;
	players: Map<string, Player>;
	ee: EventEmitter;
	publish: (
		data:
			| {
					action: Action;
					state: GameState<DefaultRunnerColors, DefaultDiceColors>;
			  }[]
			| {
					action: "roomUpdate";
					room: { id: string; players: Player[] };
			  },
	) => void;
	game?: Game;
}

export class RoomService {
	private map: Map<string, Room> = new Map();

	async *asyncIterator(
		roomId: string | undefined,
		player: { id: string; name: string },
	) {
		const room = roomId ? this.getRoom(roomId) : this.createRoom(player);

		if (!room.players.has(player.id)) this.enterRoom(room.id, player);

		setTimeout(() =>
			room.publish({
				action: "roomUpdate",
				room: { id: room.id, players: [...room.players.values()] },
			}),
		);

		try {
			for await (const [data] of on(room.ee, "data")) {
				yield data;
			}
		} finally {
			this.exitRoom(room.id, player.id);
		}
	}

	private createRoom(player: { id: string; name: string }) {
		const roomId = crypto.randomUUID();

		const ee = new EventEmitter();
		const room = {
			id: roomId,
			players: new Map([[player.id, player]]),
			ee,
			publish: (data) => ee.emit("data", data),
		};
		this.map.set(roomId, room);

		return room;
	}

	private enterRoom(roomId: string, player: { id: string; name: string }) {
		const room = this.getRoom(roomId);

		if (room.game) throw new Error(`game already started`);

		room.players.set(player.id, player);

		return room;
	}

	private exitRoom(roomId: string, playerId: string) {
		const room = this.getRoom(roomId);

		room.players.delete(playerId);

		if (room.players.size === 0) this.map.delete(roomId);

		return room;
	}

	private getRoom(roomId: string) {
		const room = this.map.get(roomId);
		if (!room) throw new Error(`room <${roomId}> does not exist`);

		return room;
	}

	start(roomId: string) {
		const room = this.getRoom(roomId);

		if (room.game) throw new Error(`game already started`);

		room.game = new Game([...room.players.values()].map(({ id }) => id));

		room.publish(room.game.init());
	}

	roll(roomId: string, playerId: string) {
		const room = this.getRoom(roomId);

		if (!room.game) throw new Error("game is not started yet");

		room.publish(room.game.roll(playerId));
	}

	betRound(roomId: string, playerId: string, color: DefaultRunnerColors) {
		const room = this.getRoom(roomId);

		if (!room.game) throw new Error("game is not started yet");

		room.publish(room.game.betRound(playerId, color));
	}

	betGame(
		roomId: string,
		playerId: string,
		color: DefaultRunnerColors,
		type: "first" | "last",
	) {
		const room = this.getRoom(roomId);

		if (!room.game) throw new Error("game is not started yet");

		room.publish(room.game.betGame(playerId, color, type));
	}

	partnerWith(roomId: string, playerId: string, partnerId: string) {
		const room = this.getRoom(roomId);

		if (!room.game) throw new Error("game is not started yet");

		room.publish(room.game.partnerWith(playerId, partnerId));
	}

	setEffectTile(
		roomId: string,
		playerId: string,
		trackIndex: number,
		type: 1 | -1,
	) {
		const room = this.getRoom(roomId);

		if (!room.game) throw new Error("game is not started yet");

		room.publish(room.game.setEffectTile(playerId, trackIndex, type));
	}
}
