import { useSubscription } from "@trpc/tanstack-react-query";
import { trpc } from "../utils/client";

export const Game = () => {
	const { data } = useSubscription(
		trpc.subscribe.subscriptionOptions({
			roomId: undefined,
			playerName: "myname",
		}),
	);

	return <>{JSON.stringify(data)}</>;
};
