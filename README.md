# html-template
The WIP implementation of the HTML5 &lt;template> v2 with parse() support and part of [WHATWG/HTML proposal #2254](https://github.com/whatwg/html/issues/2254)

For tests open index.html and use the test() function in DevTools. Tests, data and templates defined at the bottom of index.html.

template.js contains the implementation of the .parse(data) method on the Template prototype.

### Use-cases:

#### Global:

1. parse() should return a single Node. outerHTML can be used to check the result string.
2. Only first child element in DocumentFragment (template) is used as a template (root node). If no root node found, exception thrown.
3. Current algorithm transforms first child element to an HTML string (outerHTML) and parses template as a single string
4. It finds all the expressions
5. If data was not found, expression should be replaced with an empty string

#### A:

```html
<template id="1">
  <div class="box">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
  </div>
</template>
```

```javascript
document.getElementById('1').parse({title: 'Hello, World', message: 'Lorem Ipsum'});
```
1. It should replace `{{ title }}` with `Hello, World` and `{{ message }}` with `Lorem Ipsum`.
2. If there are no any argument specified in data (key is undefined) then according to Global 5 it should be replaced with an empty string

#### B:

```html
<template id="2">
  <box>
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <p>{{ title }}</p>
  </box>
</template>
```

Same data set.

It should replace all occurrences of `{{ title }}`.

#### C:

It should replace nested vars

```html
<template id="3">
  <div class="box">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    <div>{{ author.name }}</div>
  </div>
</template>
```


#### D:

Currently block statements (if/endif) in progress:

```html
<template id="4">
  <div class="box">
    <h1>{{ title }}</h1>
    <p>{{ message }}</p>
    {{ if (author) }}
    <div>{{ author.name }}</div>
    {{ endif }}
  </div>
</template>
```

It should parse if block and do not display it if expression is false 