# define-html docs

## Setup

In order to use this library you need to add script tag to your html:

```html
<script src="https://unpkg.com/define-html" type="module"></script>
```

Then add files with components to preload, before the script above:

```html
<link rel="preload" href="app-root.html" as="fetch" crossorigin />
<link rel="preload" href="app-header.html" as="fetch" crossorigin />
```

Please, include dash in you filename and make sure it is unique.

Each file needs to have `<template>`. That is the only required element.

All the link tags, that have `as="fetch"` and href that ends with `.html`, are processed by define-html.

If you ever don't want it to process via define-html, you can use `data-define-html-ignore` attribute:

```html
<link rel="preload" href="config.html" as="fetch" crossorigin data-define-html-ignore />
```

## Template

You can use `<template>` tag to define your component:

```html
<template>
	<h1>Hello world</h1>
</template>
```

That is the only required element. That tag can be uses only once per file.

### Attributes

#### `data-selector`

Selector for the component. If not specified, filename is used.

Must include dash `-` and be unique.

#### `data-shadow`

[Shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM#encapsulation_from_css) mode for the component. Can be `open`, `closed`. If not specified, no shadow root is used, but styles are still encapsulated.

## Styles

Just add `<style>` tag next to your template and it will be encapsulated:

```html
<template>
	<h1>Hello world</h1>
</template>

<style>
h1 {
	color: red;
}
</style>
```

You can have multiple style tags in one file.

Inside you can use [:host](https://developer.mozilla.org/en-US/docs/Web/CSS/:host) pseudo-class to target the component itself.

You can use `data-global` attribute to make style global.

## Scripts

Just add `<script>` tag next to your template and it will be executed:

```html
<template>
	<h1>Hello world</h1>
</template>

<script>
	console.log("Hello world");
</script>
```

Inside script tag you can use `this` at the root level to reference the component instance itself:

```html
<template>
	<h1>Hello world</h1>
</template>

<script>
	console.log(this.querySelector("h1").innerText);
</script>
```

You can set `type="module"` attribute to use ES modules.
