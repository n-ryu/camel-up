import * as http from "node:http";
import * as express from "express";
import { appRouter } from "./src/router";

const PANEL_PORT = 9999;
const SERVER_PORT = 3001;

const app = express();
const server = http.createServer(app);

app.get("/panel", async (_req, res) => {
	if (process.env.NODE_ENV === "production") {
		return res.status(404).send("Not Found");
	}

	// 패널 렌더러 동적 로드 (개발환경 전용)
	let html: string | null = null;

	try {
		// 1) trpc-ui (선호)
		const mod = (await import("trpc-ui").catch(() => null)) as any;
		if (mod?.renderTrpcPanel) {
			html = mod.renderTrpcPanel(appRouter, {
				url: `ws://localhost:${SERVER_PORT}`,
				theme: "system",
			});
		}
	} catch {}

	res.type("html").send(html);
});

// 헬스 체크
app.get("/", (_req, res) => {
	res.send("tRPC + WS server running. Open /panel in dev.");
});

server.listen(PANEL_PORT, () => {
	console.log(`Open panel at: http://localhost:${PANEL_PORT}/panel (dev only)`);
});
