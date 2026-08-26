import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { SERVICES_FULL } from '@/lib/content/services';
import { WORKS } from '@/lib/content/works';
import { SITE, STUDIO } from '@/lib/content/site';
import { ServicePage } from '@/components/services/ServicePage';

/**
 * `/services/[slug]` ×5. `01-PHASES.md` T7.4, T7.5, T7.8.
 *
 * The service→works join is by `service.name` against `work.services`, which is
 * the same string in both files. A slug-based join would be tidier and would
 * have needed a second field on every work; the names are already the display
 * values and `40-content-model.md` §2 and §3 agree on them.
 */
export const dynamicParams = false;

export function generateStaticParams() {
  return SERVICES_FULL.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = SERVICES_FULL.find((s) => s.slug === slug);
  if (!service) return {};
  return {
    title: `${service.name} — ${SITE.name}`,
    description: service.lead,
  };
}

export default async function ServiceRoute({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = SERVICES_FULL.find((s) => s.slug === slug);
  if (!service) notFound();

  const ordered = [...WORKS].sort((a, b) => a.order - b.order);
  const works = ordered.filter((work) => work.services.includes(service.name));

  return (
    <ServicePage
      service={service}
      works={works}
      /* `branding` has none of its own. Six is a row and a half of the grid —
         enough to read as a selection rather than as a truncation. */
      fallbackWorks={ordered.slice(0, 6)}
      teamSize={STUDIO.teamSize}
    />
  );
}
