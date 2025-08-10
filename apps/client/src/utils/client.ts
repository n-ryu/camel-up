import type { AppRouter } from "@camel-up/server";
import { QueryClient } from "@tanstack/react-query";
import { createTRPCClient, createWSClient, wsLink } from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";

export const queryClient = new QueryClient();

const wsClient = createWSClient({
	url: `ws://localhost:3001`,
});

export const client = createTRPCClient<AppRouter>({
	links: [
		wsLink({
			client: wsClient,
		}),
	],
});

export const trpc = createTRPCOptionsProxy<AppRouter>({
	client,
	queryClient,
});
