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

You can use `<template data-selector="app-root">` to set selector for the component. If not specified, filename is used.

Must include dash `-` and be unique.

You can use `<template data-shadow="closed">` to enable [shadow DOM](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_shadow_DOM#encapsulation_from_css).

Can be `open`, `closed`. If not specified, no shadow DOM is used, but styles are still encapsulated.

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

## Attributes

Inside your template you can use attributes to read component values itself (value would be set as child text):

```html
<template data-selector="app-title">
 <h1 data-attr="title"></h1>
</template>
```

So later you can use it like this:

```html
<app-title title="Hello world"></app-title>
```

You can use `data-if` attribute to make conditional elements:

```html
<template>
 <h2 data-if="greet">Would be shown only if greet attribute is set for the component</h2>
</template>
```

You can use `data-if-not` attribute along with `data-if` to reverse the condition:

```html
<template>
 <h2 data-if="greet" data-if-not>Would be shown only if greet attribute is NOT set for the component</h2>
</template>
```

You can use `data-if-equal` attribute along with `data-if` to check if attribute value is equal to some value:

```html
<template>
 <h2 data-if="greet" data-if-equal="hello">Would be shown only if greet attribute is equal to "hello" for the component</h2>
</template>
```

## Slots

You can use `<slot>` tag to define a place for elements, that are nested inside the component:

```html
<template data-selector="app-card">
 <div class="card">
   <slot></slot>
 </div>
</template>
```

So later you can use it like this:

```html
<app-card>
 <p>Lorem ipsum</p>
</app-card>
```

You can use `<slot name="header">` to have multiple slots:

```html
<template data-selector="app-card">
 <slot name="header"></slot>
 <div class="card">
   <slot></slot>
 </div>
</template>
```

So later you can use it like this:

```html
<app-card>
 <h1 slot="header">Hello world</h1>
 <p>Lorem ipsum</p>
</app-card>
```

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
