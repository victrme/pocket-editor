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

### What you can do

```ts
function pocketEditor(string): {
  get: () => string
  set: (string) => void
  oninput: (Function) => void
}
```

### How to use

```html
<body>
  <div id="wrapper"></div>
</body>
```

```ts
import pocketEditor from "pocket-editor"
import "pocket-editor/dist/style.css"

const editor = pocketEditor("wrapper")

editor.set("## Hello world !!")

editor.oninput(function logToConsole() {
  const content = editor.get()
  console.log(content)
})
```

### Keybindings

| Keybind            | Action            |
| ------------------ | ----------------- |
| `Ctrl + Shift + 1` | To big heading    |
| `Ctrl + Shift + 2` | To medium heading |
| `Ctrl + Shift + 3` | To small heading  |
| `Ctrl + Shift + 4` | To bullet list    |
| `Ctrl + Shift + 5` | To todo list      |
| `Ctrl + Shift + 6` | To normal line    |

_Ctrl is Cmd key on MacOS_

### Developement

```bash
# Install pnpm to use these scripts
npm i -g pnpm

# First install all
pnpm i -r

pnpm dev
pnpm preview
pnpm build
```
