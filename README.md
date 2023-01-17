# Tiny notes !

### Why

This vanilla javascript editor focuses mainly on two things: 
- Very fast load time
- Reliable markdown outputs 

### How to use

```html
<body>
  <div id="wrapper">
  </div>
</body>
```

```js
import tinyNotes from "@victr/tinynotes"

const editor = tinyNotes("wrapper")
editor.set("Hello World")
```

###  Todo list

-   [ ] Prevent adding multiple modif on same line
-   [ ] Force plain text before pasting data
-   [ ] Paste insert & delete content line transform
-   [ ] Get markdown string from editors content
-   [ ] Add css style to build output
-   [x] Left / right arrow key line movement
-   [x] Added mouse selection behavior (no use for now)
-   [x] Insert Paragraph on empty transform removes it
-   [x] Set editors content from markdown string
-   [x] Text insert line transform
-   [x] Insert paragraph between text
-   [x] Up / down arrow key line movement
