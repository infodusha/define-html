export class ErrorStackModifier {
	static current() {
		return ErrorStackModifier.fromError(new Error());
	}

	static fromError(e: Error) {
		return new ErrorStackModifier(e.stack?.split("\n") ?? []);
	}

	#items: string[];

	get items() {
		return this.#items.slice();
	}

	constructor(items: string[]) {
		this.#items = items.slice();
	}

	applyToRow(fn: (item: string) => string) {
		this.#items = this.#items.map(fn);
	}

	toString() {
		return this.#items.join("\n");
	}
}
