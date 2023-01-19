# Pocket Editor !

### Why

This vanilla javascript wysiwyg editor focuses mainly on two things:

-   Very fast load time
-   Reliable markdown output

### How to use

```html
<body>
	<div id="wrapper"></div>
</body>
```

```js
import pocketEditor from "@victr/pocket-editor"

const editor = pocketEditor("wrapper")
editor.set("Hello World")
```

### Todo list

-   [ ] Add css style to build output
-   [ ] Fix caret position after paste
-   [x] Fix last lines and todo element having only one \n on copy
-   [x] Fix copy + paste from pasting outside of editor
-   [x] Get markdown string from editors content
-   [x] Force plain text before pasting data
-   [x] Paste insert & delete content line transform
-   [x] Prevent adding multiple modif on same line
-   [x] Left / right arrow key line movement
-   [x] Added mouse selection behavior (no use for now)
-   [x] Insert Paragraph on empty transform removes it
-   [x] Set editors content from markdown string
-   [x] Text insert line transform
-   [x] Insert paragraph between text
-   [x] Up / down arrow key line movement
