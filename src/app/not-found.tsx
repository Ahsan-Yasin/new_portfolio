import { SiteLink } from '@/components/site/site-link';
import { SiteShell } from '@/components/site/site-shell';
import { getPublishedContent } from '@/lib/content/store';

export default async function NotFound() {
  const content = await getPublishedContent();
  return (
    <SiteShell content={content}>
      <div className="wrap grid min-h-[70vh] content-center justify-items-start py-32">
        <p className="t-small muted">404</p>
        <h1 className="t-display mt-2">This page isn’t here.</h1>
        <p className="t-lead muted mt-4 max-w-[30em]">It may have moved, or the link might be out of date.</p>
        <SiteLink href="/" className="btn btn-primary mt-8">
          Back to the home page
        </SiteLink>
      </div>
    </SiteShell>
  );
}
