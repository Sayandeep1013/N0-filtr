import type { PostBody } from './_types';

/** `Reading a closed WebGL system`. Out of building this site. `40-content-model.md` §5. */
export const readingAClosedWebglSystem: PostBody = {
  slug: 'reading-a-closed-webgl-system',
  standfirst:
    'How to work out what a site is doing when the source is minified, the shaders are inlined, and nobody is going to tell you.',
  blocks: [
    {
      type: 'p',
      text: 'Reproducing an interaction you admire is a normal thing to do and a badly documented one. The advice is usually "read the source", which is not advice when the source is a single minified bundle and the interesting parts are strings inside it.',
      },
    {
      type: 'p',
      text: 'What follows is the method, from doing it to a site with a WebGL hero, a scroll library, a scrubbed reveal and about forty interaction definitions. None of it is clever. All of it is faster than guessing.',
    },
    {
      type: 'h2',
      text: '1. The runtime knows more than the file',
    },
    {
      type: 'p',
      text: 'A minified bundle is hostile. A *running page* is not, because every library on it has already built the objects you want to look at and most of them are reachable.',
    },
    {
      type: 'code',
      lang: 'js',
      caption: 'Pasted into the console of the page you are reading. Not a decompiler — an inventory.',
      source: `// every scroll trigger, with the values it was created from
ScrollTrigger.getAll().map(t => ({
  trigger: t.trigger?.className,
  start: t.start, end: t.end,
  vars: t.vars.start + ' / ' + t.vars.end,
}));

// every tween on the global timeline, with its real duration
gsap.globalTimeline.getChildren(true, true, true)
  .map(t => [t.duration(), t.vars.ease, t.targets()?.[0]?.className]);`,
    },
    {
      type: 'p',
      text: 'This is where the surprises live. One value on the site I was reading is written `"30rem top"` and computes to a threshold of **30 pixels** — because the library parses the number and drops the unit. The written value is correct *and* means something other than it appears to. No amount of reading the CSS would have found that; one line in the console did.',
    },
    {
      type: 'h2',
      text: '2. Computed style beats stylesheet',
    },
    {
      type: 'p',
      text: 'Do not transcribe a stylesheet. Ask the browser what the element actually is, on the actual page, at the actual viewport — then convert to your own units at the end.',
    },
    {
      type: 'code',
      lang: 'js',
      source: `const el = document.querySelector('.the-thing');
const cs = getComputedStyle(el);
const root = parseFloat(getComputedStyle(document.documentElement).fontSize);
console.log({
  width: el.getBoundingClientRect().width,
  gap: parseFloat(cs.columnGap) / root + 'rem',
  cols: cs.gridTemplateColumns,
});`,
    },
    {
      type: 'p',
      text: 'Grids are where this pays. A three-track `fr` grid reads as an arbitrary layout in the stylesheet and resolves to clean twelfths on a 1.25rem gap when you measure it — at which point you have found the grid system rather than one instance of it.',
    },
    {
      type: 'h2',
      text: '3. Shaders are strings, and strings are searchable',
    },
    {
      type: 'p',
      text: 'GLSL survives minification, because it is not JavaScript. Search the bundle text for `gl_FragColor`, `varying vec2`, `uniform float` and you will usually get the whole shader, comments removed but structure intact. The uniform *names* are the most valuable part: they tell you which quantities the author thought were worth controlling.',
    },
    {
      type: 'quote',
      text: 'A uniform called uGrainAmount tells you there is grain, that it is tunable, and that somebody spent an afternoon deciding how much.',
    },
    {
      type: 'h3',
      text: 'A caution about that',
    },
    {
      type: 'p',
      text: 'We shipped a `uGrainAmount` of our own that controlled almost nothing — it gated one mix while the same noise sample was read three more times unconditionally. A uniform existing is not evidence that it does what its name says. Test yours by driving it to both extremes and watching, which takes a minute and is the only way to be sure.',
    },
    {
      type: 'h2',
      text: '4. Write down what you could not find out',
    },
    {
      type: 'p',
      text: 'The method has a floor. Easing curves converted through a build step are lossy; the original authored value is gone. Anything behind an interaction you cannot trigger stays invisible. Anything computed from a viewport you did not test is a guess.',
    },
    {
      type: 'p',
      text: 'So keep a confidence rating per finding, and keep it in the spec rather than in your head. The measurements you are sure of and the ones you inferred will look identical in six weeks, and the difference is exactly what you will need when one of them turns out to be wrong.',
    },
  ],
};
