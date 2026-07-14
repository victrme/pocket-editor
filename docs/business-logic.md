# Business Logic

_Last updated: 2026-07-13_

All non-trivial logic in src/. Pure DOM glue and trivial getters/setters omitted.

## Editor lifecycle

- PocketEditor constructor — build container, attach to selector/element, defer or run init
- PocketEditor.init — seed text, wire beforeinput/input/keydown/paste/copy/cut, init selection/caret/deletion/undo, MutationObserver to track lines
- PocketEditor.value get — export editor content as markdown via toMarkdown
- PocketEditor.value set — clear container, parse markdown to HTML via toHTML
- PocketEditor.oninput — bridge cut/paste/input/beforeinput to a markdown-content listener; defers deleteContentBackward + insertParagraph to after mutation
- PocketEditor.createLine — build a div line wrapping a p contenteditable, apply modifier if recognized
- PocketEditor.removeLines — remove a set of lines, leave one empty line behind, focus it, fire mock input
- PocketEditor.getSelectedLines / getPrevLine / getNextLine / getLineFromEditable / insertAfter — line navigation / lookup helpers over this.lines

## Markdown conversion

- checkModifs — match a line's text against mods prefixes, return modifier name
- toHTML — parse markdown (split on blank lines / newlines) into a DocumentFragment of lines with modifiers applied
- toMarkdown — serialize line elements back to markdown, re-adding prefixes, choosing single vs double newlines for list grouping

## Line transforms

- lineTransform — convert a line to heading/list/todo/checked-todo; clears existing modifier first
- toHeading — strip #/##/### prefix, swap editable for h1-3, set data-h*
- toList — strip -, prepend bullet marker span, set data-list
- toTodolist — strip [ ]/[x], prepend checkbox input + marker span, set data-todo / data-todo-checked, wire checkbox toggle
- removeModifier — clear all modifier data-* attrs, replace editable with a fresh p holding text content

## Input handling

- paragraphControl — on Enter: split line at caret, propagate list/todo modifier to new line, drop modifier if Enter at start of modifier line; on insertText: detect typed markdown prefix and trigger lineTransform
- keybindings — map Ctrl/Cmd+Shift+1..6 to transforms; digit 5 (or matching modifier) removes the modifier
- pasteEvent — if pasted text starts with a modifier prefix, insert parsed lines after caret/selection and clean up empty same-mod line; else insert plain text into selection at caret offset
- copyEvent — copy selected lines as markdown to clipboard
- cutEvent — copy selected lines as markdown, then remove them and push undo

## Deletion

- lineDeletion — backspace handling: at line start, strip modifier if present, else merge into / remove previous line; adds undo history
- removeLineNoText — remove an empty line and focus previous
- removeLineWithText — append current line's text to previous line's last text node, place caret at join, remove current

## Selection

- lineSelection — multi-line selection: keyboard select via Shift+Arrows, Ctrl/Cmd+A select all, Escape/Tab reset, typing over selection removes it; mouse drag selection
- applyLineSelection / addToLineSelection / changeLineSelection / initLineSelection — toggle data-selected over an index interval, grow interval by direction
- resetLineSelection — clear interval, focus last highlighted line, remove mock selection node
- createRange — build a hidden mock pre selection so native clipboard ops cover non-contiguous lines

## Caret movement

- caretControl — vertical arrow-key caret movement across lines while preserving horizontal X position; handles wrapped paragraphs
- initAverageCharWidth — measure average half-char width from a probe string
- rangePosInCharLen — find the character offset matching the saved X within a (possibly wrapped) line
- getParagraphAsArray — split a line's text into visual rows by range Y positions, with WebKit newline-trim quirk handling
- getHorizontalPosition — get caret X relative to the editable element
- detectLineJump — detect whether an arrow keypress will cross a line boundary (left/right at ends, up/down by geometry) and return direction
- setCaret — place selection at end (or start) of the last text node of an element

## Undo

- addUndoHistory — snapshot markdown + caret line index; dedupes consecutive identical snapshots; caps history at 50
- initUndo — MutationObserver guard + Ctrl/Cmd+Z listener to trigger applyUndo after native undo resolves
- applyUndo — restore last snapshot as HTML, refocus saved line, shift history, fire mock input

## DOM helpers

- lastTextNode — walk to the deepest last #text child of a node
