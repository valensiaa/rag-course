/**
 * Scripted MDN-flavoured responses for the mock backend.
 *
 * Chunk texts paraphrase MDN content closely enough to be realistic. Each
 * citation's highlight is computed from a passage string rather than hand-
 * written offsets, so editing a chunk can't silently break a highlight.
 */
import type { Citation, DocArea } from '../../types/chat';

const MDN = 'https://developer.mozilla.org/en-US/docs';

type Doc = Omit<Citation, 'id' | 'highlight'>;

/** Build a citation whose highlight runs from `from` to the end of `to` (or of `from`). */
function cite(id: number, doc: Doc, from: string, to?: string): Citation {
  const start = doc.chunkText.indexOf(from);
  if (start < 0) throw new Error(`[mock] passage not found in ${doc.chunkId}: "${from}"`);
  let end = start + from.length;
  if (to) {
    const toStart = doc.chunkText.indexOf(to, start);
    if (toStart < 0) throw new Error(`[mock] passage end not found in ${doc.chunkId}: "${to}"`);
    end = toStart + to.length;
  }
  return { ...doc, id, highlight: { start, end } };
}

export interface Scenario {
  key: string;
  match: RegExp;
  /** Area the scenario's docs live in; used to simulate scope filtering. */
  area: DocArea | null;
  query: string;
  answer: string;
  cited: Citation[];
  notCited: Citation[];
  suggestions: string[];
  noSources?: boolean;
  /** First attempt dies mid-stream with a retryable error; retries succeed. */
  failFirstAttempt?: { afterFraction: number; message: string };
}

// ── 1. JavaScript: Array.prototype.map() and sparse arrays ───────────────

const JS_REF = ['JavaScript', 'Reference', 'Standard built-in objects', 'Array'];

const mapDescription: Doc = {
  chunkId: 'js/array/map#description-0',
  url: `${MDN}/Web/JavaScript/Reference/Global_Objects/Array/map#description`,
  title: 'Array.prototype.map()',
  breadcrumb: JS_REF,
  area: 'js',
  status: [],
  lastModified: '2025-07-10T08:12:33.000Z',
  chunkText: `Description

The map() method is an iterative method. It calls a provided callbackFn function once for each element in an array and constructs a new array from the results. Read the iterative methods section for more information about how these methods work in general.

callbackFn is invoked only for array indexes which have assigned values. It is not invoked for empty slots in sparse arrays.

The map() method is generic. It only expects the this value to have a length property and integer-keyed properties.

Since map builds a new array, calling it without using the returned array is an anti-pattern; use forEach or for...of instead.`,
};

const mapSparse: Doc = {
  chunkId: 'js/array/map#using_map_on_sparse_arrays-0',
  url: `${MDN}/Web/JavaScript/Reference/Global_Objects/Array/map#using_map_on_sparse_arrays`,
  title: 'Array.prototype.map()',
  breadcrumb: JS_REF,
  area: 'js',
  status: [],
  lastModified: '2025-07-10T08:12:33.000Z',
  chunkText: `Using map() on sparse arrays

A sparse array remains sparse after map(). The indices of empty slots are still empty in the returned array, and the callback function won't be called on them.

console.log(
  [1, , 3].map((x, index) => {
    console.log(\`Visit \${index}\`);
    return x * 2;
  }),
);
// Visit 0
// Visit 2
// [2, empty, 6]`,
};

const indexedCollectionsSparse: Doc = {
  chunkId: 'js/guide/indexed_collections#sparse_arrays-0',
  url: `${MDN}/Web/JavaScript/Guide/Indexed_collections#sparse_arrays`,
  title: 'Indexed collections',
  breadcrumb: ['JavaScript', 'Guide'],
  area: 'js',
  status: [],
  lastModified: '2025-03-28T16:40:02.000Z',
  chunkText: `Sparse arrays

Arrays can contain "empty slots", which are not the same as slots filled with the value undefined. Empty slots can be created in one of the following ways:

// Array constructor:
const a = Array(5); // [ <5 empty items> ]

// Consecutive commas in array literal:
const b = [1, 2, , , 5]; // [ 1, 2, <2 empty items>, 5 ]

// Directly setting a slot with index greater than array.length:
const c = [1, 2];
c[4] = 5; // [ 1, 2, <2 empty items>, 5 ]

In some operations, empty slots behave as if they are filled with undefined. But in others (most notably array iteration methods), empty slots are skipped.`,
};

const arrayEmptySlots: Doc = {
  chunkId: 'js/array#array_methods_and_empty_slots-0',
  url: `${MDN}/Web/JavaScript/Reference/Global_Objects/Array#array_methods_and_empty_slots`,
  title: 'Array',
  breadcrumb: ['JavaScript', 'Reference', 'Standard built-in objects'],
  area: 'js',
  status: [],
  lastModified: '2025-09-02T11:05:47.000Z',
  chunkText: `Array methods and empty slots

Array methods have different behaviors when encountering empty slots in sparse arrays. In general, older methods (e.g. forEach) treat empty slots differently from indices that contain undefined.

Methods that have special treatment for empty slots include the following: concat(), copyWithin(), every(), filter(), flat(), flatMap(), forEach(), indexOf(), lastIndexOf(), map(), reduce(), reduceRight(), reverse(), slice(), some(), sort(), and splice(). Iteration methods such as forEach don't visit empty slots at all. Other methods, such as concat, copyWithin, etc., preserve empty slots when doing the copying, so in the end the array is still sparse.

Newer methods (e.g. keys) do not treat empty slots specially and treat them as if they contain undefined. Methods that conflate empty slots with undefined elements include the following: entries(), fill(), find(), findIndex(), findLast(), findLastIndex(), includes(), join(), keys(), toLocaleString(), toReversed(), toSorted(), toSpliced(), values(), and with().`,
};

const arrayFrom: Doc = {
  chunkId: 'js/array/from#description-0',
  url: `${MDN}/Web/JavaScript/Reference/Global_Objects/Array/from#description`,
  title: 'Array.from()',
  breadcrumb: JS_REF,
  area: 'js',
  status: [],
  lastModified: '2025-06-19T09:27:14.000Z',
  chunkText: `Description

Array.from() lets you create Arrays from:

- iterable objects (objects such as Map and Set); or, if the object is not iterable,
- array-like objects (objects with a length property and indexed elements).

To convert an ordinary object that's not iterable or array-like to an array (by enumerating its property keys, values, or both), use Object.keys(), Object.values(), or Object.entries(). To convert an async iterable to an array, use Array.fromAsync().

Array.from() never creates a sparse array. If the arrayLike object is missing some index properties, they become undefined in the new array.

Array.from() has an optional parameter mapFn, which allows you to execute a function on each element of the array being created, similar to map(). More clearly, Array.from(obj, mapFn, thisArg) has the same result as Array.from(obj).map(mapFn, thisArg), except that it does not create an intermediate array, and mapFn only receives two arguments (element, index) without the whole array, because the array is still under construction.`,
};

const forEachDescription: Doc = {
  chunkId: 'js/array/foreach#description-0',
  url: `${MDN}/Web/JavaScript/Reference/Global_Objects/Array/forEach#description`,
  title: 'Array.prototype.forEach()',
  breadcrumb: JS_REF,
  area: 'js',
  status: [],
  lastModified: '2025-05-14T13:51:09.000Z',
  chunkText: `Description

The forEach() method is an iterative method. It calls a provided callbackFn function once for each element in an array in ascending-index order. Unlike map(), forEach() always returns undefined and is not chainable.

callbackFn is invoked only for array indexes which have assigned values. It is not invoked for empty slots in sparse arrays.

There is no way to stop or break a forEach() loop other than by throwing an exception.`,
};

const flatMapDescription: Doc = {
  chunkId: 'js/array/flatmap#description-0',
  url: `${MDN}/Web/JavaScript/Reference/Global_Objects/Array/flatMap#description`,
  title: 'Array.prototype.flatMap()',
  breadcrumb: JS_REF,
  area: 'js',
  status: [],
  lastModified: '2024-12-03T18:22:40.000Z',
  chunkText: `Description

The flatMap() method is an iterative method. See Array.prototype.map() for a detailed description of the callback function. The flatMap() method is identical to map(callbackFn, thisArg) followed by flat(1) — for each element, it produces an array of new elements, and concatenates the resulting arrays together to form a new array.

The callback won't be called for empty slots in the source array because map() doesn't, while flat() ignores empty slots in the returned arrays.`,
};

const sparseArrays: Scenario = {
  key: 'js-map-sparse',
  match: /sparse|\bmap\(?\)?|empty slot/i,
  area: 'js',
  query: 'Array.prototype.map sparse arrays empty slots callback',
  answer: `\`map()\` **skips empty slots**. The callback runs only for indexes that actually have an assigned value, so holes in a sparse array are never visited [1]. The returned array is sparse in the same places: each empty slot in the source stays empty at the same index in the result [2].

\`\`\`js
const sparse = [1, , 3];

const doubled = sparse.map((x, i) => {
  console.log(\`visit \${i}\`);
  return x * 2;
});
// visit 0
// visit 2

console.log(doubled);      // [2, <1 empty item>, 6]
console.log(1 in doubled); // false: still a hole, not undefined
\`\`\`

### Empty slot ≠ \`undefined\`

An empty slot isn't the same as a slot holding \`undefined\` [3]. That distinction is exactly where array methods disagree: older iteration methods skip holes, while newer ones treat them as \`undefined\` [4].

| Behavior on empty slots | Methods |
| --- | --- |
| Skipped or preserved | \`forEach()\`, \`map()\`, \`filter()\`, \`reduce()\`, \`some()\`, \`every()\` |
| Treated as \`undefined\` | \`find()\`, \`findIndex()\`, \`includes()\`, \`entries()\`, \`keys()\`, \`values()\` |

### Visiting every index

If you need the callback to run for *every* index, make the array dense first. \`Array.from()\` never produces a sparse array: missing indexes become \`undefined\` [5]. Its second argument works like \`map()\`:

\`\`\`js
Array.from([1, , 3], (x) => x ?? 0); // [1, 0, 3]
\`\`\``,
  cited: [
    cite(1, mapDescription, 'callbackFn is invoked only for array indexes which have assigned values.', 'empty slots in sparse arrays.'),
    cite(2, mapSparse, 'A sparse array remains sparse after map().', "won't be called on them."),
    cite(3, indexedCollectionsSparse, 'Arrays can contain "empty slots"', 'filled with the value undefined.'),
    cite(4, arrayEmptySlots, 'Iteration methods such as forEach', 'treat them as if they contain undefined.'),
    cite(5, arrayFrom, 'Array.from() never creates a sparse array.', 'they become undefined in the new array.'),
  ],
  notCited: [
    cite(101, forEachDescription, 'callbackFn is invoked only for array indexes'),
    cite(102, flatMapDescription, "The callback won't be called for empty slots"),
  ],
  suggestions: [
    'Does Array.prototype.filter() also skip empty slots?',
    'How do I detect whether an array is sparse?',
    'Why does Array(3).map(() => 0) return empty slots?',
  ],
};

// ── 2. CSS: grid-template-areas ──────────────────────────────────────────

const gtaDescription: Doc = {
  chunkId: 'css/grid-template-areas#description-0',
  url: `${MDN}/Web/CSS/grid-template-areas`,
  title: 'grid-template-areas',
  breadcrumb: ['CSS', 'Reference', 'Properties'],
  area: 'css',
  status: [],
  lastModified: '2025-08-21T07:48:55.000Z',
  chunkText: `grid-template-areas

The grid-template-areas CSS property specifies named grid areas, establishing the cells in the grid and assigning them names.

Those areas are not associated with any particular grid item, but can be referenced from the grid-placement properties grid-row-start, grid-row-end, grid-column-start, grid-column-end, and their shorthands grid-row, grid-column, and grid-area.

Syntax

/* Keyword value */
grid-template-areas: none;

/* <string> values */
grid-template-areas: "a b";
grid-template-areas:
  "a b b"
  "a c d";

/* Global values */
grid-template-areas: inherit;
grid-template-areas: initial;
grid-template-areas: revert;
grid-template-areas: unset;`,
};

const gtaValues: Doc = {
  chunkId: 'css/grid-template-areas#values-0',
  url: `${MDN}/Web/CSS/grid-template-areas#values`,
  title: 'grid-template-areas',
  breadcrumb: ['CSS', 'Reference', 'Properties'],
  area: 'css',
  status: [],
  lastModified: '2025-08-21T07:48:55.000Z',
  chunkText: `Values

none
  The grid container doesn't define any named grid areas.

<string>+
  A row is created for every separate string listed, and a column is created for each cell in the string. Multiple cell tokens with the same name within and between rows create a single named grid area that spans the corresponding grid cells. Unless those cells form a rectangle, the declaration is invalid.

  All strings must have the same number of cell tokens, or else the declaration is invalid. A sequence of one or more full stop (.) characters, with no white space between them, represents a null cell token.`,
};

const gridArea: Doc = {
  chunkId: 'css/grid-area#description-0',
  url: `${MDN}/Web/CSS/grid-area`,
  title: 'grid-area',
  breadcrumb: ['CSS', 'Reference', 'Properties'],
  area: 'css',
  status: [],
  lastModified: '2025-04-11T10:02:18.000Z',
  chunkText: `grid-area

The grid-area CSS shorthand property specifies a grid item's size and location within a grid by contributing a line, a span, or nothing (automatic) to its grid placement, thereby specifying the edges of its grid area.

Values

<custom-ident>
  If there is a named area with the name <custom-ident>, the item is placed in that area. Otherwise, if there is a named line with the name '<custom-ident>-start', it contributes the first such line to the grid item's placement.`,
};

const guideEmptyCells: Doc = {
  chunkId: 'css/guides/grid_template_areas#leaving_a_grid_cell_empty-0',
  url: `${MDN}/Web/CSS/CSS_grid_layout/Grid_template_areas#leaving_a_grid_cell_empty`,
  title: 'Grid template areas',
  breadcrumb: ['CSS', 'Guides', 'Grid layout'],
  area: 'css',
  status: [],
  lastModified: '2025-02-07T14:33:21.000Z',
  chunkText: `Leaving a grid cell empty

We have completely filled our grid with areas in this example, leaving no white space. However, you can leave grid cells empty with this method of layout. To leave a cell empty, use the full stop character, '.'. If we want to only display the footer under the main content, we would need to leave the three cells underneath the sidebar empty.

.wrapper {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  grid-auto-rows: minmax(100px, auto);
  grid-template-areas:
    "hd hd hd hd   hd   hd   hd   hd   hd"
    "sd sd sd main main main main main main"
    ".  .  .  ft   ft   ft   ft   ft   ft";
}

In order to make the layout neater, we can use multiple . characters. As long as there is no white space between the full stops, it will be counted as one cell.`,
};

const guideMediaQueries: Doc = {
  chunkId: 'css/guides/grid_template_areas#redefining_the_grid_using_media_queries-0',
  url: `${MDN}/Web/CSS/CSS_grid_layout/Grid_template_areas#redefining_the_grid_using_media_queries`,
  title: 'Grid template areas',
  breadcrumb: ['CSS', 'Guides', 'Grid layout'],
  area: 'css',
  status: [],
  lastModified: '2025-02-07T14:33:21.000Z',
  chunkText: `Redefining the grid using media queries

As our layout is now contained in one part of our CSS, this makes making changes to the overall layout really easy. You can redefine where items sit simply by changing the value of grid-template-areas inside a media query, without touching the grid-area values on the items themselves.

A common pattern is to define a single-column layout for narrow screens, then switch to a multi-column arrangement once there is enough space:

@media (width >= 500px) {
  .wrapper {
    grid-template-columns: repeat(3, 1fr);
    grid-template-areas:
      "header  header  header"
      "sidebar content content"
      "footer  footer  footer";
  }
}`,
};

const gridTemplate: Doc = {
  chunkId: 'css/grid-template#description-0',
  url: `${MDN}/Web/CSS/grid-template`,
  title: 'grid-template',
  breadcrumb: ['CSS', 'Reference', 'Properties'],
  area: 'css',
  status: [],
  lastModified: '2025-01-22T12:15:00.000Z',
  chunkText: `grid-template

The grid-template CSS shorthand property defines the grid columns, grid rows, and grid areas.

This property is a shorthand for the following CSS properties: grid-template-areas, grid-template-columns, grid-template-rows.`,
};

const masonry: Doc = {
  chunkId: 'css/guides/masonry_layout#intro-0',
  url: `${MDN}/Web/CSS/CSS_grid_layout/Masonry_layout`,
  title: 'Masonry layout',
  breadcrumb: ['CSS', 'Guides', 'Grid layout'],
  area: 'css',
  status: ['experimental'],
  lastModified: '2025-10-01T09:00:00.000Z',
  chunkText: `Masonry layout

Experimental: This is an experimental technology. Check the Browser compatibility table carefully before using this in production.

Level 3 of the CSS grid layout specification includes a masonry value for grid-template-columns and grid-template-rows. This guide details what masonry layout is and how to use it.`,
};

const gridAreas: Scenario = {
  key: 'css-grid-areas',
  match: /grid|template.areas/i,
  area: 'css',
  query: 'grid-template-areas named areas layout',
  answer: `\`grid-template-areas\` lets you draw the layout as ASCII art: each string is a row, each token is a cell, and repeating a name across cells creates one named area [1]. You then place each grid item into an area by name with \`grid-area\` [2].

\`\`\`css
.page {
  display: grid;
  grid-template-columns: 220px 1fr;
  grid-template-rows: auto 1fr auto;
  grid-template-areas:
    "header  header"
    "sidebar main"
    ".       footer";
  gap: 1rem;
}

.page > header { grid-area: header; }
.page > nav    { grid-area: sidebar; }
.page > main   { grid-area: main; }
.page > footer { grid-area: footer; }
\`\`\`

A few rules that catch people out:

- **Areas must be rectangles.** A name repeated in an L or T shape makes the whole declaration invalid, so the browser ignores it [3].
- **Every row needs the same number of cells**, or the declaration is invalid too [3].
- **Use \`.\` for an empty cell.** A run of dots with no spaces between them counts as one cell, which helps keep the columns aligned in your source [4].

### Responsive layouts

Because the whole layout lives in one property, you can rearrange it at a breakpoint by redefining only \`grid-template-areas\` (and the track sizes) inside a media query. The items' \`grid-area\` declarations don't change [5]:

\`\`\`css
@media (width < 40rem) {
  .page {
    grid-template-columns: 1fr;
    grid-template-rows: auto;
    grid-template-areas:
      "header"
      "main"
      "sidebar"
      "footer";
  }
}
\`\`\``,
  cited: [
    cite(1, gtaDescription, 'The grid-template-areas CSS property specifies named grid areas', 'assigning them names.'),
    cite(2, gridArea, 'If there is a named area with the name <custom-ident>, the item is placed in that area.'),
    cite(3, gtaValues, 'Multiple cell tokens with the same name', 'or else the declaration is invalid.'),
    cite(4, guideEmptyCells, 'In order to make the layout neater', 'it will be counted as one cell.'),
    cite(5, guideMediaQueries, 'You can redefine where items sit', 'on the items themselves.'),
  ],
  notCited: [
    cite(101, gridTemplate, 'The grid-template CSS shorthand property'),
    cite(102, masonry, 'Level 3 of the CSS grid layout specification'),
  ],
  suggestions: [
    'How do I make a grid area span rows with grid-template-areas?',
    'What is the difference between grid-template and grid-template-areas?',
    'Can I animate a change in grid-template-areas?',
  ],
};

// ── 3. Web APIs: copying to the clipboard (cites a deprecated API) ───────

const writeText: Doc = {
  chunkId: 'webapi/clipboard/writetext#intro-0',
  url: `${MDN}/Web/API/Clipboard/writeText`,
  title: 'Clipboard: writeText() method',
  breadcrumb: ['Web APIs', 'Clipboard'],
  area: 'webapi',
  status: [],
  lastModified: '2025-05-30T15:10:42.000Z',
  chunkText: `Clipboard: writeText() method

Secure context: This feature is available only in secure contexts (HTTPS), in some or all supporting browsers.

The writeText() method of the Clipboard interface writes the specified text to the system clipboard, returning a Promise that is resolved once the system clipboard has been updated.

Syntax

writeText(newClipText)

Return value

A Promise that is resolved once the clipboard's contents have been updated.

Exceptions

NotAllowedError DOMException
  Thrown if writing to the clipboard is not allowed.`,
};

const clipboardSecurity: Doc = {
  chunkId: 'webapi/clipboard_api#security_considerations-0',
  url: `${MDN}/Web/API/Clipboard_API#security_considerations`,
  title: 'Clipboard API',
  breadcrumb: ['Web APIs'],
  area: 'webapi',
  status: [],
  lastModified: '2025-08-04T08:41:19.000Z',
  chunkText: `Security considerations

The Clipboard API allows users to programmatically read and write text and other kinds of data to and from the system clipboard in secure contexts. Writing to the clipboard with writeText() or write() generally requires transient user activation, such as calling the method from inside a click handler.

Browsers differ in how they apply these rules. Chromium-based browsers also consult the clipboard-write permission of the Permissions API, while Firefox and Safari rely on transient activation alone.`,
};

const execCommandIntro: Doc = {
  chunkId: 'webapi/document/execcommand#intro-0',
  url: `${MDN}/Web/API/Document/execCommand`,
  title: 'Document: execCommand() method',
  breadcrumb: ['Web APIs', 'Document'],
  area: 'webapi',
  status: ['deprecated'],
  lastModified: '2024-11-18T10:58:03.000Z',
  chunkText: `Document: execCommand() method

Deprecated: This feature is no longer recommended. Though some browsers might still support it, it may have already been removed from the relevant web standards, may be in the process of being dropped, or may only be kept for compatibility purposes. Avoid using it, and update existing code if possible.

Note: Although the execCommand() method is deprecated, there are still some valid use cases that do not yet have viable alternatives. For example, unlike direct DOM manipulation, modifications performed by execCommand() preserve the undo buffer (edit history).

The execCommand method implements multiple different commands. Some of them provide access to the clipboard, while others are for editing form inputs, contenteditable elements or entire documents (when switched to design mode).

To access the clipboard, the newer Clipboard API is recommended over execCommand().`,
};

const execCommandCopy: Doc = {
  chunkId: 'webapi/document/execcommand#commands-copy-0',
  url: `${MDN}/Web/API/Document/execCommand#copy`,
  title: 'Document: execCommand() method',
  breadcrumb: ['Web APIs', 'Document'],
  area: 'webapi',
  status: ['deprecated'],
  lastModified: '2024-11-18T10:58:03.000Z',
  chunkText: `Commands

contentReadOnly
  Makes the content document either read-only or editable. This requires a boolean true/false as the value argument. (Not supported by Internet Explorer.)

copy
  Copies the current selection to the clipboard. Conditions of having this behavior enabled vary from one browser to another, and have evolved over time. Check the compatibility table to determine if you can use it in your case.

createLink
  Creates an hyperlink from the selection, but only if there is a selection. Requires a URI string as a value argument for the hyperlink's href.`,
};

const copyEvent: Doc = {
  chunkId: 'webapi/element/copy_event#intro-0',
  url: `${MDN}/Web/API/Element/copy_event`,
  title: 'Element: copy event',
  breadcrumb: ['Web APIs', 'Element'],
  area: 'webapi',
  status: [],
  lastModified: '2025-03-12T17:20:31.000Z',
  chunkText: `Element: copy event

The copy event of the Clipboard API fires when the user initiates a copy action through the browser's user interface.

The event's default action is to copy the selection (if any) to the clipboard. A handler for this event can modify the clipboard contents by calling setData(format, data) on the event's ClipboardEvent.clipboardData property, and cancelling the event's default action using event.preventDefault().`,
};

const queryCommandSupported: Doc = {
  chunkId: 'webapi/document/querycommandsupported#intro-0',
  url: `${MDN}/Web/API/Document/queryCommandSupported`,
  title: 'Document: queryCommandSupported() method',
  breadcrumb: ['Web APIs', 'Document'],
  area: 'webapi',
  status: ['deprecated', 'non-standard'],
  lastModified: '2024-08-02T06:44:58.000Z',
  chunkText: `Document: queryCommandSupported() method

The Document.queryCommandSupported() method reports whether or not the specified editor command is supported by the browser.

Return value

Returns a boolean value which is true if the command is supported and false if the command isn't.`,
};

const clipboard: Scenario = {
  key: 'webapi-clipboard',
  match: /clipboard|execcommand|\bcopy\b/i,
  area: 'webapi',
  query: 'copy text to clipboard JavaScript execCommand Clipboard API writeText',
  answer: `Use the async **Clipboard API**: \`navigator.clipboard.writeText()\` writes a string to the system clipboard and returns a promise that resolves once the clipboard has been updated [1].

\`\`\`js
async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    // NotAllowedError: no user gesture, permission denied, or insecure context
    console.error('Copy failed', err);
    return false;
  }
}

button.addEventListener('click', () => copy(codeEl.textContent));
\`\`\`

Two requirements trip people up. It only works in a **secure context** (HTTPS or \`localhost\`), and browsers expect a **user gesture**, so call it from a click or key handler rather than on page load [2].

### What about \`document.execCommand('copy')\`?

You'll still see it in older answers and libraries, but \`execCommand()\` is **deprecated**. It may already have been removed from the relevant standards, so avoid it in new code [3]. Its \`copy\` command copies the current *selection* rather than an arbitrary string, and whether it works varies between browsers [4]. For clipboard access, MDN recommends the Clipboard API over \`execCommand()\` [5].`,
  cited: [
    cite(1, writeText, 'The writeText() method of the Clipboard interface', 'has been updated.'),
    cite(2, clipboardSecurity, 'The Clipboard API allows users', 'from inside a click handler.'),
    cite(3, execCommandIntro, 'Deprecated: This feature is no longer recommended.', 'update existing code if possible.'),
    cite(4, execCommandCopy, 'Copies the current selection to the clipboard.', 'have evolved over time.'),
    cite(5, execCommandIntro, 'To access the clipboard, the newer Clipboard API is recommended over execCommand().'),
  ],
  notCited: [
    cite(101, copyEvent, 'The copy event of the Clipboard API'),
    cite(102, queryCommandSupported, 'The Document.queryCommandSupported() method'),
  ],
  suggestions: [
    'How do I copy an image or rich HTML to the clipboard?',
    'How do I read text from the clipboard?',
    'Is there a replacement for execCommand in contenteditable editors?',
  ],
};

// ── 4. No sources: a framework question MDN doesn't cover ─────────────────

const reactState: Scenario = {
  key: 'no-sources-react',
  match: /\breact\b|redux|zustand|state management/i,
  area: null,
  query: 'React state management library recommendation',
  noSources: true,
  answer: `MDN documents the web platform itself (HTML, CSS, JavaScript, Web APIs and HTTP), not third-party frameworks, so I couldn't ground this in the docs.

Speaking generally: start with React's built-in state (\`useState\`, \`useReducer\` and context) and only add a library when you hit a concrete problem. Typical triggers are many distant components subscribing to the same frequently changing data, or server data that needs caching and invalidation. For server data, a dedicated data-fetching cache often removes most of the need for a global store.

The React documentation is the authoritative source here.`,
  cited: [],
  notCited: [],
  suggestions: [
    'How does the Web Storage API persist state between page loads?',
    'What is structuredClone() and when should I use it?',
  ],
};

// ── 5. HTTP: Cache-Control (first attempt fails, retry succeeds) ─────────

const ccNoCache: Doc = {
  chunkId: 'http/headers/cache-control#no-cache-0',
  url: `${MDN}/Web/HTTP/Reference/Headers/Cache-Control#no-cache`,
  title: 'Cache-Control header',
  breadcrumb: ['HTTP', 'Reference', 'Headers'],
  area: 'http',
  status: [],
  lastModified: '2025-07-23T12:36:08.000Z',
  chunkText: `no-cache

The no-cache response directive indicates that the response can be stored in caches, but the response must be validated with the origin server before each reuse, even when the cache is disconnected from the origin server.

Cache-Control: no-cache

If you want caches to always check for content updates while reusing stored content, no-cache is the directive to use. It does this by requiring caches to revalidate each request with the origin server.

Note that no-cache does not mean "don't cache". no-cache allows caches to store a response but requires them to revalidate it before reuse. If the sense of "don't cache" that you want is actually "don't store", then no-store is the directive to use.`,
};

const ccNoStore: Doc = {
  chunkId: 'http/headers/cache-control#no-store-0',
  url: `${MDN}/Web/HTTP/Reference/Headers/Cache-Control#no-store`,
  title: 'Cache-Control header',
  breadcrumb: ['HTTP', 'Reference', 'Headers'],
  area: 'http',
  status: [],
  lastModified: '2025-07-23T12:36:08.000Z',
  chunkText: `no-store

The no-store response directive indicates that any caches of any kind (private or shared) should not store this response.

Cache-Control: no-store`,
};

const cachingValidation: Doc = {
  chunkId: 'http/guides/caching#validation-0',
  url: `${MDN}/Web/HTTP/Guides/Caching#validation`,
  title: 'HTTP caching',
  breadcrumb: ['HTTP', 'Guides'],
  area: 'http',
  status: [],
  lastModified: '2025-06-02T19:03:44.000Z',
  chunkText: `Validation

Stale responses are not immediately discarded. HTTP has a mechanism to transform a stale response into a fresh one by asking the origin server. This is called validation, or sometimes, revalidation.

Validation is done by using a conditional request that includes an If-Modified-Since or If-None-Match request header. If the content has not changed, the server responds with 304 Not Modified and no body, and the cache can reuse its stored response.`,
};

const etag: Doc = {
  chunkId: 'http/headers/etag#intro-0',
  url: `${MDN}/Web/HTTP/Reference/Headers/ETag`,
  title: 'ETag header',
  breadcrumb: ['HTTP', 'Reference', 'Headers'],
  area: 'http',
  status: [],
  lastModified: '2025-04-29T08:17:26.000Z',
  chunkText: `ETag header

The HTTP ETag (entity tag) response header is an identifier for a specific version of a resource. It lets caches be more efficient and save bandwidth, as a web server does not need to resend a full response if the content was not changed.`,
};

const cacheControl: Scenario = {
  key: 'http-cache-control',
  match: /cache-control|no-cache|no-store|caching/i,
  area: 'http',
  query: 'Cache-Control no-cache vs no-store directive',
  failFirstAttempt: {
    afterFraction: 0.35,
    message: 'The answer stream was interrupted (upstream model timeout).',
  },
  answer: `They sound alike but control different things:

- **\`no-cache\`**: the response *may* be stored, but a cache must revalidate it with the origin server before every reuse [1].
- **\`no-store\`**: no cache of any kind, private or shared, may store the response at all [2].

So \`no-cache\` doesn't mean "don't cache". If what you want is "don't keep a copy", use \`no-store\` [3].

### What revalidation costs

With \`no-cache\` the browser still sends a request every time, but it's a *conditional* request carrying \`If-None-Match\` or \`If-Modified-Since\`. If nothing changed, the server answers \`304 Not Modified\` with no body, so you skip the download but not the round trip [4].

\`\`\`http
HTTP/1.1 200 OK
Cache-Control: no-cache
ETag: "33a64df5"
\`\`\`

| Directive | Stored? | Reused without asking? | Typical use |
| --- | --- | --- | --- |
| \`no-cache\` | Yes | No, revalidated each time | HTML documents that must stay current |
| \`no-store\` | No | n/a | Responses with sensitive or personal data |`,
  cited: [
    cite(1, ccNoCache, 'The no-cache response directive', 'disconnected from the origin server.'),
    cite(2, ccNoStore, 'The no-store response directive', 'should not store this response.'),
    cite(3, ccNoCache, 'Note that no-cache does not mean "don\'t cache".', 'no-store is the directive to use.'),
    cite(4, cachingValidation, 'Validation is done by using a conditional request', 'reuse its stored response.'),
  ],
  notCited: [cite(101, etag, 'The HTTP ETag (entity tag) response header')],
  suggestions: [
    'What does Cache-Control: max-age=0, must-revalidate do?',
    'How do private and public differ in Cache-Control?',
    'When should I use immutable?',
  ],
};

// ── Fallback: nothing in the (mock) index matches ─────────────────────────

export const fallbackScenario: Scenario = {
  key: 'no-sources-fallback',
  match: /$^/,
  area: null,
  query: '',
  noSources: true,
  answer: `I couldn't find MDN pages that match this question closely enough to cite, and I'd rather not make claims I can't back up.

Try naming the specific API, property or element (for example \`IntersectionObserver\` or \`position: sticky\`), or widen the search scope to **All**.

_Mock backend: it only knows a handful of scripted questions. Try one of the examples on the start screen._`,
  cited: [],
  notCited: [],
  suggestions: [
    'How does Array.prototype.map() handle sparse arrays?',
    'How do I lay out a page with grid-template-areas?',
  ],
};

export const scenarios: Scenario[] = [sparseArrays, gridAreas, clipboard, cacheControl, reactState];

