import { codeToHtml } from 'shiki';
import s from './CaseBlocks.module.css';

/**
 * The `code` block. `30-page-specs.md`: *"tonik uses a regex pass at runtime
 * (`styleCode`). We use **Shiki at build time** — same visual result, correct
 * tokenisation, zero runtime cost."*
 *
 * This is an async **server** component, which is what makes that true: the
 * grammar and the theme are resolved while the page is being built and what
 * reaches the browser is coloured HTML. Shiki is a large dependency and none of
 * it ships. Phase 9's blog posts reuse this same component.
 *
 * ── The theme, and why it is written twice ────────────────────────────────
 *
 * The spec tunes four scopes to our palette: strings `--accent`, keywords
 * `--white`, comments `--grey-700`, numbers `--white-50`. Three of those are
 * fixed and one is **per work**, which a build-time theme cannot know.
 *
 * So the theme is authored against sentinel hexes and the sentinels are
 * substituted for CSS custom properties in the emitted HTML. Shiki writes
 * whatever colour it is given straight into a `style` attribute; handing it
 * `var(--accent)` directly would work right up until some version of it decides
 * to normalise a colour, and a themer that silently drops half the page's
 * syntax highlighting is not a thing anyone would notice quickly. The sentinels
 * are chosen to be absent from any real theme output.
 *
 * **Case-insensitively**, and that is not a nicety — it is the bug this had on
 * the first run. Shiki emits `color:#FF00F1` in upper case whatever case the
 * theme was written in, so a `replaceAll` on the lower-case literal matched
 * nothing and the page shipped a magenta-and-yellow code block.
 *
 * ── One deviation, and it is deliberate ──────────────────────────────────
 *
 * §? gives strings as `--accent`. On this page `--accent` is the work's *dark*
 * accent — Tessera's is `#125C91` — which is a fine tint for a panel and close
 * to unreadable as text on a `#212121` ground. Strings therefore take
 * `--accent-ink`, the light member of the same pair, which is the colour the
 * spec's intent points at. Logged as I-046.
 */

/** Absent from any real TextMate theme; substituted below. */
const SENTINEL = {
  string: '#ff00f1',
  keyword: '#00ff01',
  comment: '#00f1ff',
  number: '#f100ff',
  punctuation: '#f1f100',
} as const;

const SUBSTITUTION: Record<string, string> = {
  [SENTINEL.string]: 'var(--accent-ink)',
  [SENTINEL.keyword]: 'var(--white)',
  [SENTINEL.comment]: 'var(--grey-700)',
  [SENTINEL.number]: 'var(--white-50)',
  [SENTINEL.punctuation]: 'var(--grey-700)',
  /* The theme's own defaults, so that even untokenised text and the wrapper's
     background come off the token sheet rather than out of a theme file. */
  '#efefef': 'var(--white)',
  '#212121': 'transparent',
};

/** One pass, case-insensitive. See the note above on why the case matters. */
const SENTINEL_PATTERN = new RegExp(Object.keys(SUBSTITUTION).join('|'), 'gi');

const THEME = {
  name: 'nofilter',
  type: 'dark' as const,
  colors: {
    'editor.background': '#212121',
    'editor.foreground': '#efefef',
  },
  settings: [
    { settings: { foreground: '#efefef', background: '#212121' } },
    { scope: ['comment', 'punctuation.definition.comment'], settings: { foreground: SENTINEL.comment } },
    {
      scope: ['string', 'string.quoted', 'constant.other.symbol', 'support.type.property-name'],
      settings: { foreground: SENTINEL.string },
    },
    {
      scope: ['keyword', 'storage', 'storage.type', 'keyword.control', 'entity.name.tag', 'constant.language'],
      settings: { foreground: SENTINEL.keyword },
    },
    { scope: ['constant.numeric', 'constant.language.boolean'], settings: { foreground: SENTINEL.number } },
    { scope: ['punctuation', 'meta.brace', 'meta.delimiter'], settings: { foreground: SENTINEL.punctuation } },
  ],
};

export async function CodeBlock({
  source,
  lang,
  caption,
}: {
  source: string;
  lang: string;
  caption?: string;
}) {
  let html: string;
  try {
    html = await codeToHtml(source, { lang, theme: THEME });
  } catch {
    /* An unknown grammar must not fail the build of a page whose subject is a
       screenshot. Plain, escaped, still readable — and `lang` is authored in a
       typed content file, so this is a typo path, not a user-input path. */
    html = `<pre class="shiki"><code>${source
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')}</code></pre>`;
  }

  html = html.replace(SENTINEL_PATTERN, (hex) => SUBSTITUTION[hex.toLowerCase()] ?? hex);

  return (
    <figure className={s.codeFigure}>
      <div className={s.code} dangerouslySetInnerHTML={{ __html: html }} />
      {caption ? (
        <figcaption data-t="label" className={s.caption}>
          {caption}
        </figcaption>
      ) : null}
    </figure>
  );
}
