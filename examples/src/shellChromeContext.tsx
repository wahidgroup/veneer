import type { AppShellRailPosition } from "@wahidgroup/veneer";
import type { ReactNode } from "react";
import { createContext, useContext, useState } from "react";

interface ShellChromeValue {
	railPosition: AppShellRailPosition;
	setRailPosition: (value: AppShellRailPosition) => void;
}

const ShellChromeContext = createContext<ShellChromeValue | null>(null);

function ShellChromeProvider({ children }: { children: ReactNode }) {
	const [railPosition, setRailPosition] = useState<AppShellRailPosition>("end");

	return (
		<ShellChromeContext.Provider value={{ railPosition, setRailPosition }}>{children}</ShellChromeContext.Provider>
	);
}

function useShellChrome(): ShellChromeValue {
	const value = useContext(ShellChromeContext);
	if (value === null) {
		throw new Error("ShellChromeProvider required");
	}

	return value;
}

export { ShellChromeProvider, useShellChrome };
export type { ShellChromeValue };
