import type { Work } from '@/content/works/_types';
import { IconCircle } from '@/components/ui/IconCircle';
import { NextWork } from './NextWork';
import s from './CaseFooter.module.css';

/**
 * The case-study footer. `30-page-specs.md` §`/works/[slug]` section 3, ~1270px.
 *
 * ```
 * .cs__outcome   LIVE URL · REPO · PACKAGE — big link rows with IconCircle ↗
 * <NextWork />   full-bleed next-project card, accent crossfading to the next
 * ```
 *
 * ── The rows are what the page is for ────────────────────────────────────
 *
 * Every case study on this site ends in something a reader can open and run.
 * That is the difference between our twelve and a studio's twelve: theirs end
 * in a client logo, ours end in a deploy and a repo. So the rows are `--t-h4`
 * and full width — the size the outcome deserves — rather than a line of small
 * links under the last paragraph.
 *
 * Only the links that exist are drawn. A row reading "PACKAGE — none" would be
 * an apology, and eight of the twelve have no package.
 */
export function CaseFooter({ work, next }: { work: Work; next: Work }) {
  const rows = [
    { key: 'live', label: 'Live', href: work.links.live, detail: hostOf(work.links.live) },
    { key: 'repo', label: 'Source', href: work.links.repo, detail: repoOf(work.links.repo) },
    { key: 'package', label: 'Package', href: work.links.package, detail: hostOf(work.links.package) },
  ].filter((row): row is { key: string; label: string; href: string; detail: string } =>
    Boolean(row.href),
  );

  return (
    <footer className={s.footer}>
      <div className="padding-global">
        <div className="container-large">
          <h2 data-t="label" className={s.heading}>
            Outcome
          </h2>
          <ul className={s.rows}>
            {rows.map((row) => (
              <li key={row.key} className={s.row}>
                {/* Off-site, so it opens in a new tab and the loader stays out
                    of it — `data-no-loader` is the opt-out the Loader's
                    document-level click handler looks for. Covering the page
                    with our loader on the way to someone else's is a lie about
                    what is happening. */}
                <a
                  className={s.link}
                  href={row.href}
                  target="_blank"
                  rel="noreferrer noopener"
                  data-no-loader
                >
                  <span data-t="label" className={s.rowLabel}>
                    {row.label}
                  </span>
                  <span data-t="h4" className={s.rowDetail}>
                    {row.detail}
                  </span>
                  {/* `social` (2.5rem), not `cta` (6rem). The CTA size is for
                      the CTA block, where the circle is the whole affordance;
                      in a table row it is a 98px white disc against a dark
                      ground on every row of the stack, which is exactly the
                      flashbang Sayandeep flagged on the work cards. */}
                  <IconCircle size="social" className={s.icon} />
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <NextWork next={next} from={work.accent.dark} />
    </footer>
  );
}

function hostOf(url?: string): string {
  if (!url) return '';
  try {
    return new URL(url).host;
  } catch {
    return url;
  }
}

/** `https://github.com/Sayandeep1013/Tessera` → `Sayandeep1013/Tessera`. */
function repoOf(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\//, '') || hostOf(url);
  } catch {
    return url;
  }
}
