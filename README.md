# define-html

Define custom element to import in html

# Motivation

When using vanilla HTML + CSS we sometimes want to split HTML on files but do not use powerful and hard solutions

# Usage

Add link to preload external html file and define-html script in `head`:
```html
...
    <link rel="preload" href="content.html" as="fetch" crossorigin />
    <script src="https://unpkg.com/define-html" type="module"></script>
</head>
```
Where `content.html` is:
```html
<template data-selector="app-content">
    Lorem ipsum
</template>
```
So later you can use include your template with:
```html
<app-content></app-content>
```

# Features

* Read attribute values
* Make conditional elements
* Optionally enable shadow root
* Partial style encapsulation (when not a shadow root mode)
* Watch for attribute changes from js

# TODO

* Full style encapsulation (when not a shadow root mode)
* Extended script support
* Full slot support

# License

Apache-2.0
