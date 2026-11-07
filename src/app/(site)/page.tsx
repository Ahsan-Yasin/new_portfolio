import { HomePage } from '@/components/site/home-page';
import { safeHref } from '@/lib/content/schema';
import { resolveSiteUrl } from '@/lib/content/select';
import { getPublishedContent } from '@/lib/content/store';

export default async function Page() {
  const content = await getPublishedContent();
  const { profile } = content;

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: profile.name,
    jobTitle: profile.role,
    url: resolveSiteUrl(content),
    sameAs: profile.socials.map((social) => safeHref(social.url)).filter(Boolean),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, '\\u003c') }}
      />
      <HomePage content={content} />
    </>
  );
}
