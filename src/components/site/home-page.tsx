import { ContactScene } from '@/components/motion/contact-scene';
import { FlipQuotes } from '@/components/motion/flip-quotes';
import { HeroScene } from '@/components/motion/hero-scene';
import { ImpactScene } from '@/components/motion/impact-scene';
import { IntroScene } from '@/components/motion/intro-scene';
import { PageMotion } from '@/components/motion/page-motion';
import { SkillsTrack } from '@/components/motion/skills-track';
import { TechMarquee } from '@/components/motion/tech-marquee';
import { TimelineScene } from '@/components/motion/timeline-scene';
import { WorkDeck } from '@/components/motion/work-deck';
import { safeHref, type Content, type Experience, type Section } from '@/lib/content/schema';
import { formatPostDate, publishedPosts, publishedProjects, visibleSections } from '@/lib/content/select';
import { PostList } from './post-list';
import { SiteLink } from './site-link';

function Writing({ content, section }: { content: Content; section: Section }) {
  const posts = publishedPosts(content).slice(0, 6);
  if (posts.length === 0) return null;
  return (
    <section id="writing" className="relative z-10 bg-page pb-[clamp(88px,12vw,168px)]">
      <div className="wrap">
        <div className="mb-[clamp(36px,5vw,72px)] flex flex-wrap items-end justify-between gap-6">
          <div>
            {section.title ? (
              <h2 data-lines className="t-hero">
                {section.title}
              </h2>
            ) : null}
            {section.subtitle ? (
              <p data-fade className="t-lead muted mt-3 max-w-[30em]">
                {section.subtitle}
              </p>
            ) : null}
          </div>
          <SiteLink href="/writing" data-magnetic className="btn btn-quiet flex-none">
            All writing
          </SiteLink>
        </div>
        <div data-fade>
          <PostList
            posts={posts.map((post) => {
              const external = safeHref(post.externalUrl);
              return {
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                dateLabel: formatPostDate(post.date),
                readTime: post.readTime,
                href: external ?? `/writing/${post.slug}`,
                external: Boolean(external),
                cover: post.cover,
              };
            })}
          />
        </div>
      </div>
    </section>
  );
}

/** Jobs followed by education, in one line of history. */
function careerTimeline(content: Content): Experience[] {
  return [
    ...content.experience,
    ...content.about.education.map((item) => {
      const [start = '', end = ''] = item.year.split(/\s*[–-]\s*/);
      return {
        id: item.id,
        company: item.school,
        role: item.degree,
        start,
        end,
        location: '',
        summary: item.summary,
        url: '',
      };
    }),
  ];
}

/** Used to close other pages too, so every journey ends in the same place. */
export function ContactBand({ content }: { content: Content }) {
  return <ContactScene content={content} />;
}

export function HomePage({ content }: { content: Content }) {
  return (
    <>
      <PageMotion />
      <HeroScene content={content} />
      {visibleSections(content).map((section) => {
        switch (section.id) {
          case 'intro':
            return <IntroScene key={section.id} content={content} section={section} />;
          case 'work':
            return <WorkDeck key={section.id} projects={publishedProjects(content)} section={section} />;
          case 'impact':
            return <ImpactScene key={section.id} section={section} metrics={content.impact} />;
          case 'skills':
            return (
              <div key={section.id}>
                <SkillsTrack section={section} skills={content.skills} />
                <TechMarquee items={[...new Set(content.skills.flatMap((group) => group.items))]} />
              </div>
            );
          case 'experience':
            return <TimelineScene key={section.id} section={section} experience={careerTimeline(content)} />;
          case 'testimonials':
            return <FlipQuotes key={section.id} section={section} testimonials={content.testimonials} />;
          case 'writing':
            return <Writing key={section.id} content={content} section={section} />;
          case 'contact':
            return <ContactBand key={section.id} content={content} />;
          default:
            // The gallery has no section of its own: its images orbit the opening title.
            return null;
        }
      })}
    </>
  );
}
