'use client';

import { useMemo, useState } from 'react';
import type { Post, PostCategory } from '@/lib/content/posts';
import { cx } from '@/lib/cx';
import { BlogCard } from './BlogCard';
import s from './BlogIndex.module.css';

/**
 * `/blog`'s hero, filters and grid. `30-page-specs.md` §`/blog`.
 *
 * ── The filters are radio pills, and that is a real distinction ──────────
 *
 * §: *"category radio pills — active gets `.is-active` (filled pill);
 * client-side filter."* **Radio**, not checkbox: one category at a time, and
 * "All" is a state rather than the absence of one. So they are real
 * `role="radio"` controls in a `role="radiogroup"`, which is what makes the
 * arrow keys work the way anyone who has met a pill group expects.
 *
 * The filled-pill active state is the one place on this site a small element
 * goes fully inverted, and it is theirs.
 *
 * ── No ScrollTrigger refresh here, unlike the works filter ───────────────
 *
 * `<WorksIndex>` refreshes on every filter change because its grid carries a
 * scrubbed parallax measured against page height. Blog cards have no scrubbed
 * motion at all — they are links in a grid — so there is nothing whose
 * measurements the filter could invalidate. Adding a refresh "to be safe" would
 * be a refresh that runs while React is committing, which is the shape of a bug
 * this build has already paid for twice (I-051).
 */
export function BlogIndex({
  posts,
  categories,
  heading,
  lead,
}: {
  posts: Post[];
  categories: PostCategory[];
  heading: string;
  lead: string;
}) {
  const [active, setActive] = useState<PostCategory | null>(null);

  const filtered = useMemo(
    () => (active ? posts.filter((post) => post.category === active) : posts),
    [posts, active],
  );

  const options: (PostCategory | null)[] = [null, ...categories];

  return (
    <>
      <header className={s.hero}>
        <div className="padding-global">
          <div className="container-large">
            <h1 data-t="h1" className={s.title}>
              {heading}
            </h1>
            <p data-t="p-big" className={s.lead}>
              {lead}
            </p>
          </div>
        </div>
      </header>

      <div className="padding-global">
        <div className="container-large">
          <div className={s.filters} role="radiogroup" aria-label="Filter by category">
            {options.map((option) => {
              const isActive = option === active;
              return (
                <button
                  key={option ?? 'all'}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className={cx(s.pill, isActive && s.pillActive)}
                  onClick={() => setActive(option)}
                  data-t="label"
                >
                  {option ?? 'All'}
                </button>
              );
            })}
          </div>

          <div className={s.grid}>
            {filtered.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>

          {/* Unreachable from the current content — the categories are derived
              from the posts — and here because a facet that can empty should say
              so rather than leave a gap. */}
          {filtered.length === 0 ? (
            <p data-t="p" className={s.empty}>
              Nothing in {active} yet.
            </p>
          ) : null}
        </div>
      </div>
    </>
  );
}
