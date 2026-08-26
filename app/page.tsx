import { Hero } from '@/components/hero/Hero';
import { WorksSection } from '@/components/works/WorksSection';
import { ShowreelProvider } from '@/components/motion/Showreel';

/**
 * The homepage.
 *
 * The hero arrived in phase 2 rather than phase 3 — its composition against the
 * 3D assembly could not be judged without it. See D-015.
 *
 * Phase 3 added the stack wall (inside the hero section, where §1 puts it), the
 * scrubbed word reveal, and the showreel. `<WorksSection>` is here for its
 * heading only — §2's heading is in phase 3's Reading Map because it is the
 * site's first `<RevealText>`, and a scrubbed reveal cannot be verified without
 * a page tall enough to scroll it past.
 *
 * Phase 4 fills the grid inside it; phase 5 adds services, CTA, culture and the
 * blog row below.
 */
export default function Home() {
  /* The provider wraps the page rather than the hero, because Flip moves the
     button's background out of the headline and into a full-screen panel that
     has to be a sibling of everything, not a child of the hero. */
  return (
    <ShowreelProvider>
      <Hero />
      <WorksSection />
    </ShowreelProvider>
  );
}
