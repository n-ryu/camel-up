export const createContext = async () => {
	const connectionId = crypto.randomUUID();
	return { connectionId };
};

export type Context = Awaited<ReturnType<typeof createContext>>;
