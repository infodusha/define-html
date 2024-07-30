function createCssLink(cssText: string) {
	const url = URL.createObjectURL(new Blob([cssText], { type: "text/css" }));
	const element = document.createElement("link");
	element.setAttribute("rel", "stylesheet");
	element.setAttribute("type", "text/css");
	element.href = url;
	return element;
}

export function getGlobalStyles() {
	const links = document.querySelectorAll<HTMLLinkElement>(
		"link[rel='stylesheet']"
	);
	const styles = Array.from(
		document.querySelectorAll<HTMLStyleElement>("style")
	).map((el) => createCssLink(el.textContent ?? ""));
	return [...links, ...styles];
}
