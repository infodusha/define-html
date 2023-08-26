import {createComponent} from './create-component.js';
import {throwIfNotDefined} from './helpers.js';

const parser = new DOMParser();
const ignoreDataAttribute = 'data-define-html-ignore';

document.addEventListener('DOMContentLoaded', () => {
    fetchFromLinks(document).catch(console.error);
});

async function fetchFromLinks(element: Document): Promise<void> {
    const links = Array.from(element.querySelectorAll(`link[rel='preload'][as='fetch'][href$='.html']:not([${ignoreDataAttribute}])`));
    await Promise.all(links.map((link) => link.getAttribute('href')).map(defineHtml));
}

async function defineHtml(href: string | null): Promise<void> {
    throwIfNotDefined(href);
    const response = await fetch(href);
    const text = await response.text();
    const definedElement = parser.parseFromString(text, 'text/html');
    customElements.define(...createComponent(definedElement));
}
