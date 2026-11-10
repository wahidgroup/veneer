import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { OverlayFocusProof } from "./OverlayFocusProof.js";
import "../../../examples/src/styles.css";

const rootEl = document.getElementById("root");
if (rootEl === null) {
	document.body.textContent = "Missing #root";
} else {
	createRoot(rootEl).render(
		<StrictMode>
			<OverlayFocusProof />
		</StrictMode>,
	);
}
