"use strict";
(() => {
  // src/lib/contentControl.ts
  function checkModifs(text, mods) {
    for (const [name, str] of Object.entries(mods)) {
      if (text.startsWith(str + " ")) {
        return name;
      }
    }
    return "";
  }
  function toHTML(self, markdown) {
    const fragment = document.createDocumentFragment();
    markdown = markdown.replaceAll("	", "");
    for (const line of markdown.split("\n\n")) {
      if (line.indexOf("\n") === -1) {
        fragment.appendChild(self.createLine({ text: line, modif: checkModifs(line, self.mods) }));
        continue;
      }
      for (const subline of line.split("\n")) {
        fragment.appendChild(self.createLine({ text: subline, modif: checkModifs(subline, self.mods) }));
      }
    }
    return fragment;
  }
  function toMarkdown(lines) {
    function addModif(line) {
      if (line.dataset.list === "") return "- ";
      else if (line.dataset.h1 === "") return "# ";
      else if (line.dataset.h2 === "") return "## ";
      else if (line.dataset.h3 === "") return "### ";
      else if (line.dataset.todoChecked === "") return "[x] ";
      else if (line.dataset.todo === "") return "[ ] ";
      return "";
    }
    let plaintext = "";
    let modif = "";
    const isList = (line) => {
      return line?.dataset.list || line?.dataset.todo;
    };
    lines.forEach((line, i) => {
      modif = addModif(line);
      plaintext += modif + line.textContent;
      const isWithinList = isList(lines[i + 1]) && isList(line);
      const isLastLine = lines.length - 1 === i;
      plaintext += isLastLine ? "" : isWithinList ? "\n" : "\n\n";
    });
    return plaintext;
  }

  // src/utils/lastTextNode.ts
  function lastTextNode(line) {
    let lastNode = line;
    while (lastNode?.childNodes.length > 0) {
      const childNodes = Object.values(lastNode.childNodes).reverse();
      const textNodes = childNodes.filter((child) => child.nodeName === "#text");
      if (textNodes.length > 0) {
        return textNodes[0];
      } else {
        lastNode = childNodes[0];
      }
    }
    return lastNode;
  }

  // src/utils/setCaret.ts
  function setCaret(elem, atStart) {
    const node = lastTextNode(elem);
    let sel = window.getSelection();
    let range = document.createRange();
    let textlen = node.nodeValue?.length || 0;
    range.setStart(node, atStart ? 0 : textlen);
    range.setEnd(node, atStart ? 0 : textlen);
    sel?.removeAllRanges();
    sel?.addRange(range);
    sel?.collapseToEnd();
  }

  // src/lib/undo.ts
  var history = [];
  function addUndoHistory(self, lastline) {
    const lines = self.lines;
    const markdown = toMarkdown(lines);
    const index = lastline ? lines.indexOf(lastline) : 0;
    if (markdown === history[0]?.markdown || "") {
      return;
    }
    history.unshift({ markdown, index });
    if (history.length > 50) {
      history.pop();
    }
  }
  function initUndo(self) {
    let timeout;
    const observer = new MutationObserver(() => {
      if (timeout) clearTimeout(timeout);
    });
    observer.observe(self.container, {
      characterData: true,
      subtree: true
    });
    self.container.addEventListener("keydown", (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        timeout = window.setTimeout(() => {
          applyUndo(self);
        }, 1);
      }
    });
  }
  function applyUndo(self) {
    const { markdown, index } = history[0] ?? {};
    if (!markdown) {
      return;
    }
    Object.values(self.container.children).forEach((node) => node.remove());
    self.container.appendChild(toHTML(self, markdown));
    setTimeout(() => {
      const editable = self.container.querySelectorAll("[contenteditable]")[index];
      if (editable) {
        editable.focus();
        setCaret(editable, false);
      }
    }, 0);
    history.shift();
    self.container.dispatchEvent(
      new InputEvent("input", {
        inputType: "insertText",
        bubbles: true,
        data: ""
      })
    );
  }

  // src/lib/clipboardControl.ts
  function copyEvent(self, ev) {
    const selected = self.getSelectedLines();
    if (selected.length > 0) {
      ev.clipboardData?.setData("text/plain", toMarkdown(selected));
      ev.preventDefault();
    }
  }
  function cutEvent(self, ev) {
    const selected = self.getSelectedLines();
    if (selected.length > 0) {
      ev.clipboardData?.setData("text/plain", toMarkdown(selected));
      ev.preventDefault();
      self.removeLines(selected);
      addUndoHistory(self, selected[selected.length - 1]);
    }
  }
  function pasteEvent(self, ev) {
    ev.preventDefault();
    const selection = window.getSelection();
    const range = selection?.getRangeAt(0);
    const text = ev.clipboardData?.getData("text") || "";
    if (checkModifs(text, self.mods) !== "") {
      const editable = ev.target;
      const newHTML = toHTML(self, text);
      const linesInNew = newHTML.childElementCount - 1;
      let line = self.getLineFromEditable(editable);
      const selected = self.getSelectedLines();
      if (selected.length > 0) {
        line = selected[selected.length - 1];
      }
      if (!line?.parentElement?.dataset.pocketEditor) {
        return;
      }
      self.container.insertBefore(newHTML, self.getNextLine(line));
      let lastline = line.nextSibling;
      for (let ii = 0; ii < linesInNew; ii++) lastline ? lastline = lastline.nextSibling : "";
      if (lastline) setCaret(lastline);
      if (line && line.textContent === "") {
        const areSameMods = (mod) => {
          const currIsMod = line?.dataset[mod] === mod;
          const nextIsMod = self.getNextLine(line)?.dataset[mod] === mod;
          return currIsMod === nextIsMod;
        };
        if (line || areSameMods("list") || areSameMods("todo") || areSameMods("todo-checked")) {
          line.remove();
        }
      }
      self.container.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          bubbles: true,
          data: ""
        })
      );
      return;
    }
    if (selection?.rangeCount && range) {
      const offset = selection?.anchorOffset ?? 0;
      const value = selection.focusNode?.nodeValue ?? "";
      if (value && selection.focusNode) {
        selection.focusNode.nodeValue = value.slice(0, offset) + text + value.slice(offset);
        selection.collapse(selection.focusNode, offset + text.length);
      } else {
        range.insertNode(document.createTextNode(text));
        setCaret(range.endContainer);
      }
    }
    self.container.dispatchEvent(
      new InputEvent("input", {
        inputType: "insertText",
        bubbles: true,
        data: ""
      })
    );
  }

  // src/utils/removeModifier.ts
  function removeModifier(editable) {
    const content = document.createElement("div");
    const parent = editable.parentElement;
    if (!parent) {
      return;
    }
    delete parent.dataset.list;
    delete parent.dataset.todo;
    delete parent.dataset.h1;
    delete parent.dataset.h2;
    delete parent.dataset.h3;
    delete parent.dataset.todoChecked;
    content.textContent = parent.textContent;
    content.setAttribute("contenteditable", "true");
    Object.values(parent.childNodes).forEach((node) => node.remove());
    parent.appendChild(content);
    content.focus();
    return content;
  }

  // src/lib/lineTransform.ts
  function lineTransform(self, editable, mod, focus = true) {
    if (!mod) return;
    const line = self.getLineFromEditable(editable);
    if (!line || line?.dataset[mod]) {
      return;
    }
    line.querySelector("span[data-list-marker]")?.remove();
    line.querySelector("span[data-todo-marker]")?.remove();
    switch (mod) {
      case "h1":
      case "h2":
      case "h3":
        toHeading(mod);
        break;
      case "list":
        toList();
        break;
      case "todo":
        toTodolist(false);
        break;
      case "todo-checked":
        toTodolist(true);
        break;
    }
    function toHeading(tag) {
      const heading = document.createElement(tag);
      let mod2 = tag === "h1" ? "#" : tag === "h2" ? "##" : "###";
      heading.textContent = editable.textContent?.replace(mod2, "").trimStart() || "";
      heading.setAttribute("contenteditable", "true");
      if (line) {
        line.dataset[tag] = "";
        editable.replaceWith(heading);
      }
      if (focus) {
        setCaret(heading);
      }
    }
    function toTodolist(checked) {
      const input = document.createElement("input");
      const span = document.createElement("span");
      const p = document.createElement("p");
      const line2 = self.getLineFromEditable(editable);
      let content = editable.textContent ?? "";
      if (!line2 || line2.dataset.todo) {
        return;
      }
      if (content.startsWith("[ ]") || content.startsWith("[x]")) {
        content = content.slice(4, content.length);
      }
      input.type = "checkbox";
      input.name = "checkbox";
      input.setAttribute("aria-label", "todo list checkbox");
      input.addEventListener("input", () => {
        if (input.checked) {
          line2.setAttribute("data-todo-checked", "");
          input.setAttribute("checked", "");
        } else {
          line2.removeAttribute("data-todo-checked");
          line2.setAttribute("data-todo", "");
          input.removeAttribute("checked");
        }
      });
      if (checked) {
        input.setAttribute("checked", "");
        line2.dataset.todoChecked = "";
      }
      line2.dataset.todo = "";
      span.dataset.todoMarker = "";
      p.textContent = content;
      p.setAttribute("contenteditable", "true");
      editable.replaceWith(p);
      span.appendChild(input);
      line2.prepend(span);
      if (focus) {
        setCaret(p);
      }
    }
    function toList() {
      const span = document.createElement("span");
      const p = document.createElement("p");
      let content = editable.textContent ?? "";
      if (!line || line.dataset.list === "") {
        return;
      }
      if (content.startsWith("-")) {
        content = content?.replace("-", "").trimStart();
      }
      line.dataset.list = "";
      span.dataset.content = "\u2022";
      span.dataset.listMarker = "";
      p.textContent = content;
      p.setAttribute("contenteditable", "true");
      editable.replaceWith(p);
      line.prepend(span);
      if (focus) {
        setCaret(p);
      }
    }
  }

  // src/lib/paragraphControl.ts
  function paragraphControl(self, e) {
    const container = self.container;
    const editable = e.target;
    let range;
    try {
      const isContenteditable = editable?.hasAttribute("contenteditable");
      const isInput = editable?.tagName === "INPUT";
      range = window.getSelection()?.getRangeAt(0);
      if (!range || !isContenteditable || isInput) {
        throw "";
      }
    } catch (_) {
      return;
    }
    const line = self.getLineFromEditable(editable);
    const datasets = Object.keys(line?.dataset ?? {});
    const insertParagraph = e?.inputType === "insertParagraph";
    const insertText = e?.inputType === "insertText";
    let modif;
    if (e.type === "beforeinput" && insertParagraph && line) {
      e.preventDefault();
      addUndoHistory(self, line);
      const cuttext = (editable.textContent ?? "").slice(0, range.startOffset);
      const nexttext = (editable.textContent ?? "").slice(range.startOffset);
      if (range.startOffset === 0 && datasets.length > 0) {
        removeModifier(editable);
        return;
      }
      if (line.dataset.todo === "") modif = "todo";
      if (line.dataset.list === "") modif = "list";
      if (line.dataset.todoChecked === "") modif = "todo";
      const nextline = self.getNextLine(line);
      const newline = self.createLine({
        text: nexttext,
        modif
      });
      if (nextline) container.insertBefore(newline, nextline);
      else container?.appendChild(newline);
      newline.querySelector("[contenteditable]")?.focus();
      editable.textContent = cuttext;
      container.dispatchEvent(
        new InputEvent("input", {
          inputType: "insertText",
          bubbles: true,
          data: ""
        })
      );
      return;
    }
    if (e.type === "input" && insertText) {
      const ZERO_WIDTH_WHITESPACE2 = "\u200B";
      const content = (editable?.textContent ?? "").replace(ZERO_WIDTH_WHITESPACE2, "");
      for (const [mod, val] of Object.entries(self.mods)) {
        const softspace = String.fromCharCode(160);
        const hardspace = String.fromCharCode(32);
        if (content.startsWith(val + hardspace) || content.startsWith(val + softspace)) {
          modif = mod;
          lineTransform(self, editable, modif);
        }
      }
    }
  }

  // src/utils/detectLineJump.ts
  function detectLineJump(self, ev) {
    if (!ev.key.includes("Arrow") || !window.getSelection()?.anchorNode) {
      return;
    }
    const editable = ev.target;
    const line = self.getLineFromEditable(editable);
    const range = window?.getSelection()?.getRangeAt(0);
    const txtLen = range?.startContainer?.nodeValue?.length ?? 0;
    if (!range || !line) return;
    const prevSibling = self.getPrevLine(line);
    const nextSibling = self.getNextLine(line);
    const isCaretAtZero = Math.min(range?.endOffset, range?.startOffset) === 0;
    const isCaretAtEnd = Math.max(range?.endOffset, range?.startOffset) === txtLen;
    if (ev.key === "ArrowLeft" && isCaretAtZero && prevSibling) return { line, dir: "up" };
    if (ev.key === "ArrowRight" && isCaretAtEnd && nextSibling) return { line, dir: "down" };
    let top = false;
    let bottom = false;
    const rr = range?.getBoundingClientRect();
    const lr = line?.getBoundingClientRect();
    const noRanges = !lr || !rr || rr.y === 0;
    if (noRanges) {
      top = true;
      bottom = true;
    } else {
      top = lr.top - rr.top + rr.height > 0;
      bottom = rr.bottom + rr.height - lr.bottom > 0;
    }
    if (ev.key === "ArrowUp" && prevSibling && top) return { line, dir: "up" };
    if (ev.key === "ArrowDown" && nextSibling && bottom) return { line, dir: "down" };
  }

  // src/lib/lineSelection.ts
  function lineSelection(self) {
    let lines = self.lines;
    let caretSelTimeout;
    let lineInterval = [-1, -1];
    let currentLine = -1;
    let firstLine = -1;
    function caretSelectionDebounce(callback) {
      clearTimeout(caretSelTimeout);
      caretSelTimeout = window.setTimeout(() => {
        callback();
      }, 200);
    }
    function createRange(selected) {
      if (!selected) selected = self.getSelectedLines();
      if (selected.length === 0) return;
      document.querySelector("#pocket-editor-mock-sel")?.remove();
      const mockSelection = document.createElement("pre");
      mockSelection.id = "pocket-editor-mock-sel";
      mockSelection.textContent = "mock-selection";
      mockSelection.setAttribute("contenteditable", "true");
      self.container.appendChild(mockSelection);
      let sel = window.getSelection();
      let range = document.createRange();
      let textlen = mockSelection.childNodes[0].nodeValue?.length || 0;
      range.setStart(mockSelection.childNodes[0], 0);
      range.setEnd(mockSelection.childNodes[0], textlen);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
    function getLineIndex(editable) {
      const line = self.getLineFromEditable(editable);
      return line ? lines.indexOf(line) : -1;
    }
    function resetLineSelection() {
      const line = lines[currentLine];
      const editable = line?.querySelector("[contenteditable]");
      if (editable) setCaret(line);
      currentLine = -1;
      firstLine = -1;
      lineInterval = [-1, -1];
      document.querySelector("#pocket-editor-mock-sel")?.remove();
      self.container.removeEventListener("mousemove", mouseMoveEvent);
    }
    function addToLineSelection(index) {
      if (index > firstLine) lineInterval[1] = index;
      if (index < firstLine) lineInterval[0] = index;
      if (index === firstLine) lineInterval = [index, index];
    }
    function changeLineSelection(index) {
      firstLine = index;
      lineInterval = [index, index];
    }
    function applyLineSelection(interval) {
      lines.forEach((line, i) => {
        if (i >= interval[0] && i <= interval[1]) {
          line.setAttribute("data-selected", "");
        } else {
          line.removeAttribute("data-selected");
        }
      });
      caretSelectionDebounce(() => createRange());
    }
    function initLineSelection(index) {
      currentLine = firstLine = index;
      lineInterval = [index, index];
    }
    function keyboardEvent(e) {
      lines = self.lines;
      const selected = self.getSelectedLines();
      const isClipboardKey = e.key.match(/([x|c|v])/g);
      const isCtrlKey = e.key === "Control" || e.key === "Meta";
      const noSelection = selected.length > 0;
      const ctrl = e.ctrlKey || e.metaKey;
      if (isCtrlKey || ctrl && isClipboardKey && noSelection) {
        return;
      }
      if (ctrl && e.key === "a") {
        window.getSelection()?.removeAllRanges();
        currentLine = firstLine = 0;
        lineInterval = [0, lines.length - 1];
        applyLineSelection(lineInterval);
        e.preventDefault();
        return;
      }
      if (noSelection) {
        window.getSelection()?.removeAllRanges();
        if (e.key === "Escape" || e.key === "Tab") {
          resetLineSelection();
          applyLineSelection(lineInterval);
          e.preventDefault();
          return;
        }
        if (e.key.includes("Arrow")) {
          if (e.key.includes("Down")) currentLine = Math.min(currentLine + 1, lines.length - 1);
          if (e.key.includes("Up")) currentLine = Math.max(0, currentLine - 1);
          if (e.shiftKey) addToLineSelection(currentLine);
          if (!e.shiftKey) changeLineSelection(currentLine);
          applyLineSelection(lineInterval);
          e.preventDefault();
          return;
        }
        if (!e.code.match(/Shift|Alt|Control|Caps/)) {
          resetLineSelection();
          addUndoHistory(self, selected[selected.length - -1]);
          self.removeLines(selected);
          if (e.code === "Enter") {
            e.preventDefault();
          }
        }
      }
      if (!e.shiftKey) return;
      const { line } = detectLineJump(self, e) ?? {};
      if (line) {
        const index = lines.indexOf(line);
        initLineSelection(index);
        applyLineSelection(lineInterval);
        window.getSelection()?.removeAllRanges();
      }
    }
    function mouseMoveEvent(e) {
      const target = e.target;
      const selected = self.getSelectedLines();
      if (selected.length > 0) {
        window.getSelection()?.removeAllRanges();
      }
      const isCheckbox = target.getAttribute("aria-label") === "todo list checkbox";
      const isListMarker = target.dataset.listMarker;
      const isEditable = !!target.getAttribute("contenteditable");
      if (isCheckbox || isListMarker || isEditable) {
        currentLine = getLineIndex(target);
        if (currentLine === firstLine && selected.length === 0) return;
        addToLineSelection(currentLine);
        applyLineSelection(lineInterval);
      }
    }
    function mouseDownEvent(event) {
      const target = event.target;
      const rightclick = event.button === 2;
      const leftclick = event.button === 0;
      const noSelection = self.getSelectedLines().length === 0;
      lines = self.lines;
      if (rightclick) {
        event.preventDefault();
      }
      if (!leftclick || noSelection) {
        return;
      }
      resetLineSelection();
      applyLineSelection(lineInterval);
      if (!!target.getAttribute("contenteditable")) {
        initLineSelection(getLineIndex(target));
        self.container.addEventListener("mousemove", mouseMoveEvent);
      }
    }
    function mouseClickEvent(event) {
      const path = event.composedPath();
      const noSelection = self.getSelectedLines().length === 0;
      const clicksOutsideContainer = !path.includes(self.container);
      if (noSelection) {
        return;
      }
      if (clicksOutsideContainer) {
        lines = self.lines;
        resetLineSelection();
        applyLineSelection(lineInterval);
      }
      self.container.removeEventListener("mousemove", mouseMoveEvent);
    }
    window.addEventListener("touchend", mouseClickEvent);
    window.addEventListener("click", mouseClickEvent);
    self.container.addEventListener("keydown", keyboardEvent);
    self.container.addEventListener("mousedown", mouseDownEvent);
  }

  // src/lib/lineDeletion.ts
  var ZERO_WIDTH_WHITESPACE = "\u200B";
  function removeLineNoText(editable, prevline) {
    setCaret(prevline);
    editable.parentElement?.remove();
  }
  function removeLineWithText(editable, prevLine) {
    const node = lastTextNode(prevLine);
    const isTextNode = node.nodeType === 3;
    const charAmount = node.nodeValue?.length || 0;
    const targetText = editable?.textContent || "";
    node[isTextNode ? "nodeValue" : "textContent"] += targetText;
    const selection = window.getSelection();
    const range = document.createRange();
    range.setStart(node, isTextNode ? charAmount : 0);
    range.setEnd(node, isTextNode ? charAmount : 0);
    selection?.removeAllRanges();
    selection?.addRange(range);
    const parent = editable.parentElement;
    parent.remove();
  }
  function lineDeletion(self) {
    const isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
    const userAgent = navigator.userAgent.toLowerCase();
    const sel = window.getSelection();
    function applyLineRemove(ev) {
      const editable = ev.target;
      const line = self.getLineFromEditable(editable);
      const isTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      const isEditable = !!editable.getAttribute("contenteditable");
      const isAtStart = sel?.getRangeAt(0)?.endOffset === 0;
      const isDelEvent = ev.inputType === "deleteContentBackward";
      const isBeforeinput = ev.type === "beforeinput";
      if (isBeforeinput && !isDelEvent || !isAtStart || !isEditable) {
        return;
      }
      ev.preventDefault();
      if (line) {
        addUndoHistory(self, line);
      }
      if (Object.keys(line?.dataset ?? {}).length > 0) {
        const newEditable = removeModifier(editable);
        if (isTouch && newEditable && newEditable.textContent === "") {
          newEditable.textContent = ZERO_WIDTH_WHITESPACE;
          setCaret(newEditable);
        }
        return;
      }
      const prevline = self.getPrevLine(line);
      if (prevline) {
        if (editable.textContent === "") removeLineNoText(editable, prevline);
        if (editable.textContent !== "") removeLineWithText(editable, prevline);
      }
    }
    self.container.addEventListener("beforeinput", applyLineRemove);
    if (userAgent.includes("safari") && !userAgent.match(/chrome|chromium/)) {
      self.container.addEventListener("keydown", (e) => {
        try {
          const range = sel?.getRangeAt(0);
          const isBackspacing = e.key === "Backspace";
          const isAtContainerStart = range?.startOffset === 0;
          if (isBackspacing && isAtContainerStart) {
            applyLineRemove(e);
          }
        } catch (e2) {
        }
      });
    }
    if (isTouchDevice) {
      let triggerDeleteLine = false;
      self.container.addEventListener("beforeinput", (ev) => {
        const editable = ev.target;
        const deleteContent = ev.inputType === "deleteContentBackward";
        const whitespaceOnly = editable.textContent === ZERO_WIDTH_WHITESPACE;
        if (deleteContent && whitespaceOnly) {
          triggerDeleteLine = true;
        }
      });
      self.container.addEventListener("keyup", (ev) => {
        const editable = ev.target;
        if (triggerDeleteLine) {
          triggerDeleteLine = false;
          applyLineRemove(ev);
          return;
        }
        if (editable.textContent === "") {
          editable.textContent = ZERO_WIDTH_WHITESPACE;
          setCaret(editable);
        }
      });
    }
  }

  // src/lib/caretControl.ts
  function caretControl(self) {
    let averageCharWidth = 0;
    function initAverageCharWidth() {
      const p = document.createElement("p");
      const span = document.createElement("span");
      p.id = "pocket-editor-mock-p";
      span.textContent = "abcdefghijklmnopqrstuvwxyz0123456789";
      p?.appendChild(span);
      self.container.querySelector(".line [contenteditable]")?.appendChild(p);
      averageCharWidth = span.offsetWidth / 36 / 2;
      p.remove();
    }
    function rangePosInCharLen(line, str) {
      const sel = window.getSelection();
      let charCount = -1;
      const x = getHorizontalPosition(sel, line);
      const offset = self.caret_x ?? x.offset;
      const editable = line?.querySelector("[contenteditable]");
      const textnode = lastTextNode(editable);
      const range = document.createRange();
      range.setStart(textnode, 0);
      range.setEnd(textnode, 0);
      let rangeX = 0;
      for (let i = 0; i < str.length - 1; i++) {
        try {
          range.setStart(textnode, i);
          range.setEnd(textnode, i);
        } catch (_) {
          break;
        }
        rangeX = range.getBoundingClientRect().x - x.editable;
        if (rangeX + averageCharWidth >= offset) {
          charCount = i;
          break;
        }
      }
      return charCount;
    }
    function getParagraphAsArray(line) {
      const editable = line?.querySelector("[contenteditable]");
      if (!editable) {
        console.warn("Couldn't get string[], no contenteditable found");
        return [];
      }
      let pos = 0;
      let rangeY = 0;
      let rangeYlast = 0;
      let lines = [""];
      let words = (editable.textContent ?? "").split(" ");
      let textnode = lastTextNode(editable);
      const range = document.createRange();
      range.setStart(textnode, 0);
      range.setEnd(textnode, 0);
      const isWebkit = navigator.userAgent.includes("AppleWebKit");
      rangeYlast = rangeY = range.getBoundingClientRect().y;
      for (let word of words) {
        word = word + " ";
        pos += word.length;
        try {
          range.setStart(textnode, pos);
          range.setEnd(textnode, pos);
          rangeY = range.getBoundingClientRect().y;
        } catch (_) {
        }
        if (isWebkit) lines[0] += word;
        if (rangeY > rangeYlast) {
          if (isWebkit) lines[0] = lines[0].trimEnd();
          lines.unshift("");
          rangeYlast = rangeY;
        }
        if (isWebkit === false) lines[0] += word;
      }
      lines.reverse();
      return lines;
    }
    self.container.addEventListener("pointerdown", function() {
      self.caret_x = void 0;
    });
    self.container.addEventListener("keydown", function(ev) {
      if (!ev.key.includes("Arrow")) {
        return;
      }
      const goesRight = ev.key === "ArrowRight";
      const goesLeft = ev.key === "ArrowLeft";
      const { line, dir } = detectLineJump(self, ev) ?? {};
      let sel = window.getSelection();
      let range = document.createRange();
      let offset = 0;
      let node;
      if (goesLeft || goesRight) {
        self.caret_x = void 0;
      } else if (self.caret_x === void 0) {
        self.caret_x = getHorizontalPosition(sel, line).offset;
      }
      if (!line) {
        return;
      }
      if (averageCharWidth === 0) {
        initAverageCharWidth();
      }
      if (dir === "down") {
        const nextline = self.getNextLine(line) ?? line;
        node = lastTextNode(nextline);
        const textlen = node.nodeValue?.length || 0;
        if (!goesRight) {
          const rows = getParagraphAsArray(nextline);
          offset = rangePosInCharLen(nextline, rows[0]) ?? -1;
          if (offset < 0) offset = textlen;
        }
      }
      if (dir === "up") {
        const prevline = self.getPrevLine(line) ?? line;
        node = lastTextNode(prevline);
        const textlen = node.nodeValue?.length || 0;
        offset = textlen;
        if (!goesLeft) {
          const rows = getParagraphAsArray(prevline);
          const lastrow = rows[rows.length - 1].trimEnd();
          let lastrowOffset = rangePosInCharLen(prevline, lastrow) ?? textlen;
          offset = textlen - (lastrow.length - lastrowOffset);
          if (lastrowOffset < 0) offset = textlen;
        }
      }
      try {
        range.setStart(node, offset);
        range.setEnd(node, offset);
        sel?.removeAllRanges();
        sel?.addRange(range);
        sel?.collapseToEnd();
        ev.preventDefault();
      } catch (_) {
        console.warn("Cannot set caret");
      }
    });
  }
  function getHorizontalPosition(selection, line) {
    const editable = line?.querySelector("[contenteditable]");
    const cx = editable?.getBoundingClientRect().x ?? 0;
    const rx = selection?.getRangeAt(0)?.cloneRange()?.getBoundingClientRect().x ?? 0;
    return {
      editable: cx,
      range: rx,
      offset: rx - cx
    };
  }

  // src/lib/keybindings.ts
  async function keybindings(self, ev) {
    const editable = ev.target;
    const ctrl = ev.ctrlKey || ev.metaKey;
    const isValid = ctrl && ev.shiftKey && ev.code.includes("Digit");
    if (isValid && editable) {
      const index = parseInt(ev.code.replace("Digit", "")) - 1;
      const targetMod = Object.keys(self.mods)[index];
      if (index === 5) {
        ev.preventDefault();
        removeModifier(editable);
        return;
      }
      if (targetMod in self.mods && targetMod !== "todo-checked") {
        ev.preventDefault();
        lineTransform(self, editable, targetMod);
      }
    }
  }

  // src/index.ts
  var PocketEditor = class {
    container;
    lines;
    wrapper;
    caret_x;
    mods = {
      h1: "#",
      h2: "##",
      h3: "###",
      list: "-",
      todo: "[ ]",
      "todo-checked": "[x]"
    };
    /**
     * This creates an editor.
     * You might also need to add the basic styling with "style.css"
     *
     * @param {string} selector The selector of the parent in which to put the editor
     * @param {Object} [options] Pocket editor options
     * @param {string} [options.text] Default text to add when initializing pocket editor
     * @param {string} [options.id] Specify an id for this instance of the editor
     * @param {true | number} [options.defer] Defer load with a timeout
     *
     * @example
     * import pocketEditor from 'pocket-editor'
     * import 'pocket-editor/style.css'
     *
     * const editor = new pocketEditor("some-selector", { text: "Hello world" })
     */
    constructor(selector, options) {
      const div = document.createElement("div");
      const { text, defer, id } = options ?? {};
      this.wrapper = document.querySelector(selector);
      this.container = div;
      this.lines = [];
      if (this.wrapper === null) {
        throw `Pocket editor: selector "${selector}" was not found`;
      }
      if (id) {
        div.id = id;
      }
      div.dataset.pocketEditor = "";
      if (typeof defer === "number") {
        setTimeout(() => this.init(text), defer);
      } else if (defer === true) {
        setTimeout(() => this.init(text));
      } else {
        this.init(text);
      }
    }
    init(text) {
      const self = this;
      if (text) {
        this.container.appendChild(toHTML(this, text));
      } else {
        this.container.appendChild(this.createLine({ text: "" }));
      }
      if (this.wrapper) {
        this.wrapper.appendChild(this.container);
      }
      this.container.addEventListener("beforeinput", (ev) => paragraphControl(self, ev));
      this.container.addEventListener("input", (ev) => paragraphControl(self, ev));
      this.container.addEventListener("keydown", (ev) => keybindings(self, ev));
      this.container.addEventListener("paste", (ev) => pasteEvent(self, ev));
      this.container.addEventListener("copy", (ev) => copyEvent(self, ev));
      this.container.addEventListener("cut", (ev) => cutEvent(self, ev));
      lineSelection(self);
      caretControl(self);
      lineDeletion(self);
      initUndo(self);
      const lineObserverCallback = () => {
        this.lines = Object.values(this.container.children);
      };
      const observer = new MutationObserver(lineObserverCallback);
      observer.observe(this.container, { childList: true });
      this.lines = Object.values(this.container.children);
    }
    /**
     * Gets the editor content as Markdown
     * @returns A valid markdown string
     */
    get value() {
      return toMarkdown(this.lines);
    }
    /**
     * This replaces the content of the editor with the specified text.
     * All nodes are removed before adding the new generated HTML.
     * @param text - Either plain text or Markdown
     *
     * @example
     * // Checks the checkbox every pair seconds
     * const editor = new pocketEditor("#some-id", { text: "Please wait" })
     *
     * setInterval(() => {
     * 	 const second = new Date().getSeconds()
     * 	 const checkbox = second % 2 ? "[x]" : "[ ]"
     * 	 const text = `${checkbox} Second is pair`
     * 	 editor.value = text
     * }, 1000)
     */
    set value(text) {
      Object.values(this.container.children).forEach((node) => node.remove());
      this.container.appendChild(toHTML(this, text));
    }
    /**
    	 * Listens to beforeinput, input, cut, and paste events inside the editor.
    	 * Automatically passes the editor content as markdown as an argument.
    	 * 
    	 * @param listener Get the content as a markdown string
    	 * @returns An event cleanup function
    	 * 
    	 * @example
    	 * // One-liner logger
    	 * pocketEditor("#some-id", { text: "Hello" }).oninput = console.log
    	 * 
    	 * @example
    	 * // Saves editor content to localStorage
    	 * const editor = new pocketEditor("#some-id", { text: "Hello" })
    
    	 * editor.oninput = content => {
    	 *   localStorage.saved = content
    	 * })
     	 */
    oninput(listener) {
      const self = this;
      this.container.addEventListener("cut", cb);
      this.container.addEventListener("paste", cb);
      this.container.addEventListener("input", cb);
      this.container.addEventListener("beforeinput", cb);
      return () => {
        this.container.removeEventListener("cut", cb);
        this.container.removeEventListener("paste", cb);
        this.container.removeEventListener("input", cb);
        this.container.removeEventListener("beforeinput", cb);
      };
      function cb(e) {
        if (e.type === "beforeinput") {
          if (!e.inputType.match(/(deleteContentBackward|insertParagraph)/g)) {
            return;
          }
        }
        listener(self.value);
      }
    }
    /**
     * An addEventListener wrapper for esthetic purposes.
     *
     * @param type Listens to everything on "input"
     * @param listener Get the content as a markdown string
     * @returns An event cleanup function
     */
    addEventListener(type, listener) {
      return this.oninput(listener);
    }
    getSelectedLines() {
      return this.lines.filter((line) => line.dataset.selected !== void 0) ?? [];
    }
    getPrevLine(line) {
      return this.lines[this.lines.indexOf(line) - 1];
    }
    getNextLine(line) {
      return this.lines[this.lines.indexOf(line) + 1];
    }
    getLineFromEditable(elem) {
      while (elem?.parentElement) {
        const parent = elem.parentElement;
        const isDiv = parent.tagName === "DIV";
        if (isDiv) {
          return parent;
        } else {
          elem = parent;
        }
      }
      return null;
    }
    removeLines(lines) {
      const emptyLine = this.createLine();
      const prevline = this.getPrevLine(lines[0]);
      lines.forEach((line) => line.remove());
      if (prevline) {
        this.insertAfter(emptyLine, prevline);
      } else {
        this.container.prepend(emptyLine);
      }
      setCaret(emptyLine);
      this.container.dispatchEvent(
        new InputEvent("input", {
          inputType: "deleteContent",
          bubbles: true,
          data: ""
        })
      );
    }
    createLine(props) {
      const notesline = document.createElement("div");
      const editable = document.createElement("p");
      const mod = props?.modif ?? "";
      const mods = this.mods;
      editable.setAttribute("contenteditable", "true");
      notesline.appendChild(editable);
      if (typeof props?.text === "string") {
        editable.textContent = props.text;
      }
      if (mod in mods) {
        lineTransform(this, editable, mod, false);
      }
      return notesline;
    }
    insertAfter(newNode, existingNode) {
      existingNode?.parentNode?.insertBefore(newNode, existingNode.nextSibling);
    }
  };
  var src_default = PocketEditor;
  globalThis.PocketEditor = PocketEditor;
})();
