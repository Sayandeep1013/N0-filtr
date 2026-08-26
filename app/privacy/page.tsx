import type { Metadata } from 'next';
import { SITE, CONTACT } from '@/lib/content/site';
import s from './privacy.module.css';

/**
 * `/privacy`. `30-page-specs.md`: *"Single prose column, `--t-p`, 7/12. No
 * motion beyond the loader."* Built because the footer links to it, and a
 * privacy link that 404s is the specific kind of broken that people notice.
 *
 * **The content is true of this site as built**, which is the only reason it is
 * worth writing rather than pasting. There is no analytics script, no cookie,
 * no form that posts anywhere — the contact panel opens a `mailto:` — and the
 * page says exactly that rather than reciting a template that describes a site
 * we did not make.
 *
 * If any of that changes — a form provider, an analytics tag, a session cookie —
 * this page is wrong and has to change with it. See I-055.
 */
export const metadata: Metadata = {
  title: `Privacy — ${SITE.name}`,
  description: 'What this site collects, which is almost nothing.',
};

const SECTIONS = [
  {
    heading: 'The short version',
    body: [
      'This site sets no cookies, runs no analytics, and has no accounts. Nothing you do here is recorded by us, because there is nothing here doing the recording.',
    ],
  },
  {
    heading: 'What the site loads',
    body: [
      'Fonts, images and code, all served from the same place as the page itself. There are no third-party scripts, no embedded players, no trackers and no tag manager. Nothing on this site asks another company to watch you read it.',
    ],
  },
  {
    heading: 'Hosting',
    body: [
      'The site is hosted on Vercel, which keeps server logs of requests — an IP address, a timestamp, a URL, a user agent — as any web server does. Those logs are theirs, they are retained on their schedule, and we do not export, join or analyse them.',
    ],
  },
  {
    heading: 'Getting in touch',
    body: [
      `The contact panel composes an email in your own mail client. It posts nothing to us and stores nothing in your browser — until you press send, the words stay on your machine. Once you do send, we have your email and whatever you wrote, and we keep it for as long as the conversation is useful.`,
    ],
  },
  {
    heading: 'Your data',
    body: [
      'If you have emailed us and want that deleted, ask and it will be. There is no dashboard to do it in because there is no dashboard.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <main className={s.page}>
      <div className="padding-global">
        <div className="container-large">
          <div className={s.column}>
            <h1 data-t="h1-sm" className={s.title}>
              Privacy
            </h1>
            <p data-t="p" className={s.intro}>
              What this site collects, which is almost nothing.
            </p>

            {SECTIONS.map((section) => (
              <section key={section.heading} className={s.section}>
                <h2 data-t="h5" className={s.heading}>
                  {section.heading}
                </h2>
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 24)} data-t="p" className={s.body}>
                    {paragraph}
                  </p>
                ))}
              </section>
            ))}

            <p data-t="p" className={s.body}>
              Questions about any of this go to{' '}
              <a href={`mailto:${CONTACT.email}`} className={s.link}>
                {CONTACT.email}
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
