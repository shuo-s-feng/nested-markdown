# Nested Markdown Manual

This manual demonstrates how to use `nested-markdown` to embed rich, interactive, or styled markdown blocks within your markdown content.

You can create nested blocks using two methods:

1.  **Fenced Code Blocks** (Recommended)
2.  **HTML Comments** (Legacy/Alternative)

## 1. Fenced Code Blocks

The preferred way to create nested blocks is using a standard markdown code fence with the language identifier `nested-md`.

### Syntax

````markdown
```nested-md [attributes...]
# Your Nested Content

- Supports standard markdown
- And even recursive nesting!
```
````

### Attributes

Attributes are space-separated `key="value"` pairs added after `nested-md`.

| Attribute     | Values                          | Default     | Description                                    |
| :------------ | :------------------------------ | :---------- | :--------------------------------------------- |
| `show`        | `"preview"`, `"code"`, `"both"` | `"preview"` | Controls what is displayed.                    |
| `emoji`       | Any string (e.g. `"💡"`)        | `undefined` | Displays an icon/emoji in the top-left gutter. |
| `bgColor`     | Hex color (e.g. `"#F8FFEE"`)    | `undefined` | Background color of the block.                 |
| `textColor`   | Hex color (e.g. `"#0F172A"`)    | `undefined` | Text color of the content.                     |
| `borderColor` | Hex color (e.g. `"#A5D6A7"`)    | `undefined` | Border color of the block.                     |
| `boxed`       | `"true"`, `"false"`             | `"true"`    | Whether to render the box styling (border/bg). |
| `id`          | String                          | `undefined` | Sets the `data-id` attribute on the wrapper.   |
| `style`       | CSS string                      | `undefined` | Custom inline styles for the wrapper.          |

### Automatic Dark Mode

When you provide custom colors using `bgColor`, `textColor`, or `borderColor`, `nested-markdown` automatically generates a compatible dark-mode variant.

For example, if you set a light background `bgColor="#F8FFEE"`, it will be automatically darkened when the application runs in dark mode (or `theme="dark"`), ensuring your content remains readable and comfortable without requiring you to manually specify dark mode colors.

### Examples

#### Info Box (Preview Only)

````markdown
```nested-md show="preview" emoji="ℹ️" bgColor="#EFF6FF" borderColor="#BFDBFE"
### Information
This is a styled info box rendering **markdown** content.
```
````

#### Code & Preview (Split View)

````markdown
```nested-md show="both" emoji="💻"
### Live Example
This block shows both the rendered preview (top) and the source code (bottom).
```
````

#### Warning Box (Red)

````markdown
```nested-md show="preview" emoji="⚠️" bgColor="#FEF2F2" borderColor="#FECACA" textColor="#991B1B"
**Warning:** Please proceed with caution.
```
````

## 2. HTML Comments (Legacy)

You can also use HTML comments to define the start and end of a nested block. This is useful if your markdown processor interferes with custom code fences or if you need to wrap content that shouldn't be inside a code block in the raw source.

### Syntax

```markdown
<!-- nested-md:start [attributes...] -->

# Your Content Here

You can write normal markdown here.

<!-- nested-md:end -->
```

### Inline Usage

HTML comments are particularly useful for **inline** styling because they don't force a block-level break like code fences do (depending on usage).

```markdown
This is normal text, but <!-- nested-md:start boxed="false" style="color: red; font-weight: bold;" -->this part is nested<!-- nested-md:end --> and the text continues.
```

_(Note: For inline usage, ensure `boxed="false"` and appropriate CSS styles are used to keep the flow.)_

## 3. Recursive Nesting

`nested-md` supports recursion. You can put a nested block _inside_ another nested block.

`````markdown
````nested-md show="preview" emoji="📁"
### Outer Block

- Item 1
- Item 2

    ```nested-md show="preview" emoji="📄" bgColor="#F3F4F6"
    **Inner Block**
    This is inside the list item!
    ```

````
`````
