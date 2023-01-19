# Pocket Editor !

This is yet another wysiwyg editor, it focuses mainly on two things:

-   Very fast load time
-   Reliable markdown output

### Install

```bash
$ npm install pocket-editor
```

### How to use

```html
<body>
    <div id="wrapper"></div>
</body>
```

```js
import pocketEditor from "pocket-editor"
import "pocket-editor/dist/style.css"

const editor = pocketEditor("wrapper")

// Add text
editor.set("## Hello World")

// Get content as markdown
console.log(editor.get())
```

### Todo list

#### Not done

-   [ ] Add css style to build output
-   [ ] Fix caret position after paste
-   [ ] Add checkbox "checked" attribute on editor set
-   [ ] Fix list not autocompleting when removing+adding next line

#### Done

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
