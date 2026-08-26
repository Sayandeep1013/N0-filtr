/**
 * The modal slot's default. Renders nothing.
 *
 * Required, and easy to leave out: without it, a **hard** load of
 * `/works/tessera` — a pasted URL, a refresh with the lightbox open, a search
 * result — has no component for the `@modal` slot and Next 404s the whole page
 * rather than falling through to the real route. The interception only applies
 * to soft navigations; this is what makes the other kind work.
 */
export default function ModalDefault() {
  return null;
}
