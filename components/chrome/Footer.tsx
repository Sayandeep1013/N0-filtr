'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { useSiblingDim } from '@/lib/motion/useSiblingDim';
import { DUR, EASE } from '@/lib/motion/tokens';
import { ApertureMark } from '@/components/brand/ApertureMark';
import { Wordmark } from '@/components/brand/Wordmark';
import { Button } from '@/components/ui/Button';
import { ServiceIcon } from '@/components/ui/ServiceIcon';
import { CONTACT, FOOTER_TAGLINE, SERVICES, SOCIALS } from '@/lib/content/site';
import { cx } from '@/lib/cx';
import s from './Footer.module.css';

/**
 * <Footer /> — docs/spec/20-components-and-motion.md §20.
 *
 * A three-column grid, 3fr 2fr 1fr, under a hairline. Services and the brand
 * block on the left, the enquiry columns and socials on the right, and a spacer
 * between them that exists only to hold the composition apart.
 *
 * The service list runs the site-wide sibling-dim [ix2 a-17/a-18]: hovering one
 * takes the others to exactly 0.3 over 400ms inOutQuad. Same primitive as the
 * works grid, different timing — §21.1.
 */
export function Footer() {
  const servicesRef = useRef<HTMLDivElement>(null);
  useSiblingDim(servicesRef, {
    selector: '.service-link',
    opacity: 0.3,
    duration: DUR.base,
    ease: EASE.quad,
  });

  const year = new Date().getFullYear();

  return (
    <footer className={cx('padding-global', 'footer')}>
      <div className={s.grid}>
        {/* ── column 1, row 1 — services ─────────────────────────────────── */}
        <div ref={servicesRef} className={s.services}>
          <p data-t="label" className={s.label}>
            Services
          </p>
          <ul className={s.serviceList} role="list">
            {SERVICES.map(({ slug, name }) => (
              <li key={slug}>
                <Link href={`/services/${slug}`} className={cx(s.serviceLink, 'service-link')}>
                  <ServiceIcon slug={slug} className={s.serviceIcon} />
                  <span data-t="p">{name}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* ── column 3 — enquiries, address, socials, meta ───────────────── */}
        <div className={s.contact}>
          <div className={s.contactCol}>
            <p data-t="label" className={s.label}>
              Business enquiries
            </p>
            <a data-t="p" href={`mailto:${CONTACT.email}`}>
              {CONTACT.email}
            </a>
          </div>

          <div className={s.contactCol}>
            <p data-t="label" className={s.label}>
              Opportunities
            </p>
            <a data-t="p" href={`mailto:${CONTACT.opportunities}`}>
              {CONTACT.opportunities}
            </a>
          </div>

          <div className={s.contactCol}>
            <p data-t="label" className={s.label}>
              {`${CONTACT.city} · ${CONTACT.gmt}`}
            </p>
            <p data-t="p">{CONTACT.address}</p>
          </div>

          <div className={s.contactCol}>
            <p data-t="label" className={s.label}>
              Socials
            </p>
            <div className={s.socials}>
              {SOCIALS.map(({ label, href }) => (
                <Button key={label} variant="bar" href={href} external>
                  {label}
                </Button>
              ))}
            </div>
          </div>

          <div className={s.meta}>
            <span data-t="label">{year}</span>
            <span className={s.markWell}>
              <ApertureMark />
            </span>
            <Link href="/privacy" data-t="label" className={s.privacy}>
              Privacy policy
            </Link>
          </div>
        </div>

        {/* ── columns 1–2, row 2 — tagline and wordmark ──────────────────── */}
        <div className={s.brand}>
          <p data-t="label" className={s.label}>
            {FOOTER_TAGLINE}
          </p>
          <Wordmark className={s.wordmark} />
        </div>
      </div>
    </footer>
  );
}
