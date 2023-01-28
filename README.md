<h3 align="center">
  <img src="https://raw.githubusercontent.com/victrme/pocket-editor/main/example/public/banner.png" width="50%" align="center" />
</h3>

<p align="center">
    <a href="https://github.com/victrme/pocket-editor">Github</a> - 
    <a href="https://www.npmjs.com/package/pocket-editor">Npm</a> - 
    <a href="https://pocketeditor.netlify.app/">Example</a>
</p>

<br />

This is yet another wysiwyg editor, it focuses mainly on two things:

-   Very fast load time
-   Reliable markdown output

### Install

```
npm install pocket-editor
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

// Replaces editor content
editor.set("## Hello World")

// Get content as markdown
console.log(editor.get())

// Event for all editor changes
editor.oninput(function () {
	// ...
})
```

### Todo list

-   [ ] Fix caret position after paste
-   [ ] Fix list not autocompleting when removing+adding next line
-   [x] Mobile touch event
-   [x] Add line mod removal to oninput
