/**
 * Locks document body scroll and compensates for disappearing scrollbar
 * so layout does not shift horizontally. Returns an unlock function.
 */
function lockBodyScroll(): () => void {
	const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
	const previousOverflow = document.body.style.overflow;
	const previousPaddingRight = document.body.style.paddingRight;

	document.body.style.overflow = "hidden";

	if (scrollbarWidth > 0) {
		document.body.style.paddingRight = `${scrollbarWidth}px`;
	}

	return () => {
		document.body.style.overflow = previousOverflow;
		document.body.style.paddingRight = previousPaddingRight;
	};
}

export { lockBodyScroll };
