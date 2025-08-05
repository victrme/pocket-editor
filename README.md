<h3 align="center">
  <img src="https://raw.githubusercontent.com/victrme/pocket-editor/main/example/public/banner.png" width="50%" align="center" />
</h3>

<p align="center">
    <a href="https://github.com/victrme/pocket-editor">Github</a> -
    <a href="https://www.npmjs.com/package/pocket-editor">Npm</a> -
    <a href="https://pocketeditor.victr.me/">Example</a>
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
interface Options {
  text?: string
  id?: string
  defer?: true | number
}

class PocketEditor {
  constructor(selector: string, options?: Options)
  get value(): string
  set value(string): void
  oninput: ((content: string) => void) => void
}
```

### How to use

```html
<body>
    <div id="wrapper"></div>
</body>
```

```ts
import PocketEditor from "pocket-editor"
import "pocket-editor/style.css"

const editor = new PocketEditor("#wrapper")

editor.value = "## Hello world !!"

editor.oninput((content) => {
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

- Install Deno for:
	- linting
	- formatter
	- installing dependencies
- Install Node for:
	- Playwright
	- npx

```bash
# Install dependencies
deno install

# Build example
deno task example:build

# Build npm package
deno task build

# Work on it
deno task dev

# Test with playwright (node only!)
npx playwright test
# or
npm run test


```
