## Colored Boxes

<!-- nested-md:start show="preview" bgColor="#F1FAEF" textColor="#0F172A" borderColor="#BBD4B7" emoji="✅" -->

### Lorem Ipsum

Lorem Ipsum is simply dummy text of the printing and typesetting industry.

<!-- nested-md:end -->

<!-- nested-md:start show="preview" bgColor="#FFFCE7" textColor="#0F172A" borderColor="#F1DD8B" emoji="💡" -->

### Lorem Ipsum

Lorem Ipsum is simply dummy text of the printing and typesetting industry.

<!-- nested-md:end -->

```nested-md show="preview" bgColor="#FDE8E8" textColor="#0F172A" borderColor="#F87171" emoji="❌"
### Lorem Ipsum
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
```

```nested-md show="preview" bgColor="#EEF6FF" textColor="#0F172A" borderColor="#93C5FD" emoji="🔵"
### Lorem Ipsum
Lorem Ipsum is simply dummy text of the printing and typesetting industry.
```

## Show Modes

```nested-md show="preview" emoji="👀"
### `show="preview"`
- Renders only the nested markdown preview
- Supports **GFM** (tables, task lists, strikethrough)
```

```nested-md show="code" emoji="💻"
### `show="code"`
- This is a bullet in *markdown*
- This is `inline code`

| col | value |
| --- | --- |
| a | b |
```

```nested-md show="both" emoji="🔀" bgColor="#F8FFEE" textColor="#0F172A" borderColor="#A5D6A7"
### `show="both"`
- Preview on top
- Markdown source below
```

## Legacy Comment Blocks

<!-- nested-md:start show="preview" emoji="🗂️" -->

Legacy block without an explicit `md` fence

<!-- nested-md:end -->

<!-- nested-md:start show="preview" emoji="🧾" -->

```md
Legacy block with an explicit `md` fence
```

<!-- nested-md:end -->

## Nested Blocks

````nested-md show="preview" emoji="🧩" bgColor="#EEF2FF" textColor="#0F172A" borderColor="#A5B4FC"
### Outer block

- Outer list item 1
- Outer list item 2

```nested-md show="preview" emoji="🔁" bgColor="#ECFEFF" textColor="#0F172A" borderColor="#67E8F9"
#### Inner block
- Inner list
- Inner `inline code` and **bold**
```

Back to the outer block.
````

## Inline Usage

Inline badge style: <!-- nested-md:start boxed="false" emoji="⚡" show="preview" style="margin: 0 8px; display: inline-flex; align-items: center; gap: 6px; vertical-align: middle;" -->**Inline** `nested-md`<!-- nested-md:end --> keeps the sentence flowing.

- List item with inline block: <!-- nested-md:start boxed="false" emoji="✅" show="preview" style="margin: 0 8px; display: inline-flex; align-items: center; gap: 6px; vertical-align: middle;" -->done<!-- nested-md:end --> and more text.

## Markdown Features

````nested-md show="preview" emoji="🧪"
### Markdown features inside a block
- ~~strikethrough~~
- [ ] task list item
- [x] completed task

Inline code: `expandNestedMarkdown(markdown)`

Marked text: <mark>highlight</mark>

| col | value |
| --- | --- |
| a | b |

> A blockquote inside a nested block.

```ts
export function hello(name: string) {
  return `Hello ${name}`;
}
```
````

## Image

![600x400 Image](https://placehold.co/600x400)

## Table

| Col          | Value                                                                                                                                                                                                                      |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Inline badge | <!-- nested-md:start boxed="false" emoji="🏷️" show="preview" style="margin: 0; display: inline-flex; align-items: center; gap: 6px; vertical-align: middle;" -->**tag**: `alpha`<!-- nested-md:end -->                     |
| Boxed cell   | <!-- nested-md:start boxed="true" emoji="📦" show="preview" bgColor="#EEF6FF" textColor="#0F172A" borderColor="#93C5FD" style="margin: 0; padding: 10px 12px;" -->A boxed block inside a table cell.<!-- nested-md:end --> |

## Mermaid Diagram

```mermaid
graph TD;
    A-->B;
    A-->C;
    B-->D;
    C-->D;
```
