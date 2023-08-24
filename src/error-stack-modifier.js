export class ErrorStackModifier {
    static current() {
        return ErrorStackModifier.fromError(new Error());
    }

    static fromError(e) {
        return new ErrorStackModifier(e.stack.split('\n'));
    }

    #items;

    get items() {
        return this.#items.slice();
    }

    constructor(items) {
        this.#items = items.slice();
    }

    applyToRow(fn) {
        this.#items = this.#items.map(fn);
    }

    toString() {
        return this.#items.join('\n');
    }
}
