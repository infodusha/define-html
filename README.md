# define-html

Define custom element to import in html

## Motivation

When using vanilla HTML + CSS we sometimes want to split HTML on files but do not use powerful and hard solutions

## Usage

Add link to preload external html file and define-html script in `head`:

```html
<head>
    <!-- Other tags here -->
    <link rel="preload" href="app-content.html" as="fetch" crossorigin />
    <script src="https://unpkg.com/define-html" type="module"></script>
</head>
```

Where `app-content.html` is:

```html
<template>
    Lorem ipsum
</template>
```

So later you can use include your template with:

```html
<app-content></app-content>
```

## Features

* Read attribute values
* Make conditional elements
* Full slot support
* Full style encapsulation
* Optionally enable shadow root

## Docs

[Read the docs](./DOCS.md)

## Troubleshooting

For the framework to work, you either need to use some static server (e.g. [Live Server for VS Code](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer)) or use a compiler (see below).

## Compiler (optional)

Additionally, you can compile your components inside your pages.

That may be useful when your run your app in production and you want to reduce load time for your users.

Install [node](https://nodejs.org) or [bun](https://bun.sh/) and run:

```sh
npx --yes define-html
```

or

```sh
bunx --bun define-html
```

This will create `dist` folder with the output files. Also, it will copy runtime and replace it in all pages.

## Development

This project uses [Bun](https://bun.sh) as a build tool and package manager.

## License

Apache-2.0
