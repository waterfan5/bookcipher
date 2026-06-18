# BookCipher - Book Cipher Tool

A single-page tool that **decodes** a hidden message out of a larger "book" text
by index (Action), **encodes** a target message into index tuples against a book
text (Create), and **brute-forces an offset** across the text (Find).

> Only `index.html` and its siblings (`bookcipher-logic.js`, `bookcipher.css`,
> `test.html`) are the live tool. The sibling folders `BookCipher-old/`, `Old/`,
> `Numberreplace/`, `WordSearch/`, `.vs/` are legacy/unrelated — ignore them.

## Architecture split (matches SubTest / ExpandText)

- **`bookcipher-logic.js`** — the pure, DOM-free engine; the *only* place the
  cipher logic lives. Dual-exports for browser **and** Node so `test.html` runs
  headless. Public API: `runAction(inputText, extractionTypes, bookCipherKeys, opts, findDelta)`
  (decode), `createKeys(inputText, bookCipherText, extractionTypes, opts)` (encode),
  plus helpers `getWord/getLetter/getLine/getParagraph/getCipherText/findSeperator`.
- **`index.html`** — thin DOM glue only. `readOpts()` packs the three checkboxes
  into the `opts` object every logic function takes; the `On*` handlers read the
  forms, call the logic, write `OutputText`.
- **`test.html`** — calls the logic directly (no hidden-DOM shim needed). Run it
  after any logic change. Expected values were derived from the original inline
  code — they encode the *current* behavior, quirks included.
- Styling follows the shared **NLTM theme** — see the `nltm-style` skill, not here.

## The extraction-type numbering scheme (core mental model, non-obvious)

`ExtractionType` is a numeric code where **each digit is a unit, read
largest-to-smallest**: `4`=paragraph, `3`=line, `2`=word, `1`=letter. So:

- `1` = letter#, `2` = word#, `21` = word#+letter#, `321` = line#+word#+letter#,
  `4321` = paragraph#+line#+word#+letter#, etc.

A key *tuple* must have one component per digit, joined by the line's separator.
`findSeperator()` sniffs the separator from the first token in priority order
`:` `,` `.` `-`, else "" (no separator → each digit is a single character, so
indices can't exceed 9). **Auto-detect (value `0`)** infers the type from the
piece-count of the first token: 1→`1`, 2→`31`, 3→`321`, 4→`4321`.

## The four "offset" modes are special-cased — NOT part of the digit scheme

Modes **3, 5, 6, 7** are sequential/offset modes and bypass the digit decoding:

- `3` (Letter Offset#), `6` (Word# Offset), `7` (Beale Offset): each key value is
  *added to a running `offsetcount`*, and the cipher is read at that accumulating
  position — not at an absolute index.
- `5` (Seq. Sentence Letter#): walks one line per key, reading `line N : key` and
  incrementing the line each step.
- `4` (Beale word#-first-letter) reads a word then its first letter. Note the
  deliberate double-negative `parseInt(sTuple) - -g_nFindDelta` in `getCipherText`
  case 4 — it *adds* the find delta there. Leave it; it's original behavior.

## `g_nFindDelta` and Find

Module-level offset in the logic file, subtracted from the **first** index piece
(`GetPiece` n==1, and the case 1/2 reads). `Action` passes `findDelta = 0`;
`Find` sweeps `findDelta` from **-50 to 49**, concatenating each full decode on
its own line so you can eyeball which offset yields readable text. `createKeys`
always resets it to 0.

## Output markers (preserved verbatim — do not "clean up")

- Decode: an out-of-range / unresolved index emits `" Err: <token>"` inline in
  the output instead of failing.
- Encode (`createKeys`): a character that can't be located emits `"### "`, but
  only after one full restart attempt (`hasreset`) fails.

## Counter quirks (in `getWord` / `getLetter`)

- `getWord` strips everything except letters/digits/space/hyphen first, so
  punctuation never counts as part of a word. `splitHyphenated` then optionally
  splits on `-`.
- `getLetter` optionally keeps spaces (`countSpaces`) and special chars
  (`countSpecial`); both off by default. These map to the three checkboxes via
  `opts`.

## Caveats

- Faithful lift-and-shift of the original inline logic. The built-in samples
  intentionally produce mixed-case output (e.g. Sample 1 → `SecrEt`/`MessagE`)
  because that's what the indices resolve to — **don't "fix" the casing**.
- Entirely client-side; no persistence; no build step.
- The GA config, `trackEvent`, and `#myLinks` nav are all injected by
  `HamburgerMenu_Init()` in `../Shared/hamburgermenu.js` — keep `#myLinks` empty
  and the GA `<script>` tag bare (see the `nltm-style` skill).
