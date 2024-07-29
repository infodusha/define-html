import { returnIfDefined } from "./helpers";

class Optional {
	readonly #element: Element;
	readonly #marker: Comment;

	#isVisible = true;

	constructor(element: Element, marker: string) {
		this.#element = element;
		this.#marker = document.createComment(` ${marker} `);
	}

	hide(): void {
		if (!this.#isVisible) {
			return;
		}
		this.#element.before(this.#marker);
		this.#element.remove();
		this.#isVisible = false;
	}

	show() {
		if (this.#isVisible) {
			return;
		}
		this.#marker.after(this.#element);
		this.#marker.remove();
		this.#isVisible = true;
	}
}

export class OptionalIf {
	readonly #element: Element;
	readonly #optional: Optional;

	get attr() {
		return returnIfDefined(
			this.#element.getAttribute("data-if"),
			"data-if is required"
		);
	}

	constructor(element: Element) {
		this.#element = element;
		this.#optional = new Optional(element, `data-if="${this.attr}"`);
	}

	#isVisible(value: string | undefined): boolean {
		const hasAttr = value !== undefined;
		const hasIfNot = this.#element.hasAttribute("data-if-not");
		if (this.#element.hasAttribute("data-if-equal")) {
			const isEqual = value === this.#element.getAttribute("data-if-equal");
			return hasIfNot ? !isEqual : isEqual;
		}
		return hasIfNot ? !hasAttr : hasAttr;
	}

	update(attributes: NamedNodeMap) {
		const value = attributes.getNamedItem(this.attr);
		const isVisible = this.#isVisible(value?.value);
		if (isVisible) {
			this.#optional.show();
		} else {
			this.#optional.hide();
		}
	}
}
