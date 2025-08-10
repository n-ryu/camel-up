import { QueryClientProvider } from "@tanstack/react-query";
import { Game } from "./components/Game";
import { queryClient } from "./utils/client";

function App() {
	return (
		<QueryClientProvider client={queryClient}>
			<Game />
		</QueryClientProvider>
	);
}

export default App;
