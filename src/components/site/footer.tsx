import { safeHref, type Content } from '@/lib/content/schema';
import { FitName } from './fit-name';
import { SiteLink } from './site-link';
import { CurrentYear } from './small-client';

/** The page lifts away to reveal this: the one place the accent colour floods the whole screen. */
export function Footer({ content }: { content: Content }) {
  const { footer, nav, profile } = content;
  return (
    <footer className="site-footer no-print overflow-hidden bg-accent text-on-accent">
      <div className="wrap grid-12 gap-y-8 pb-[clamp(20px,3vw,40px)] pt-[clamp(48px,7vw,104px)]">
        <div className="col-span-12 md:col-span-5">
          {footer.note ? <p className="t-subtitle max-w-[18em]">{footer.note}</p> : null}
          {profile.email ? (
            <a href={`mailto:${profile.email}`} className="t-small mt-4 inline-block font-medium underline underline-offset-4">
              {profile.email}
            </a>
          ) : null}
        </div>
        <ul className="t-small col-span-6 grid content-start gap-2 md:col-span-2 md:col-start-8">
          {nav
            .filter((item) => item.visible && item.href.startsWith('/'))
            .map((item) => (
              <li key={item.id}>
                <SiteLink href={item.href} className="font-medium opacity-80 transition-opacity duration-200 hover:opacity-100">
                  {item.label}
                </SiteLink>
              </li>
            ))}
        </ul>
        <ul className="t-small col-span-6 grid content-start gap-2 md:col-span-2 md:col-start-11">
          {profile.socials.map((social) => {
            const href = safeHref(social.url);
            return href ? (
              <li key={social.id}>
                <a href={href} target="_blank" rel="noreferrer" className="font-medium opacity-80 transition-opacity duration-200 hover:opacity-100">
                  {social.label}
                </a>
              </li>
            ) : null;
          })}
        </ul>
      </div>
      <div className="wrap overflow-hidden">
        <FitName text={profile.name} />
      </div>
      <div className="wrap t-micro flex flex-wrap justify-between gap-3 py-4 opacity-80">
        {footer.copyright ? (
          <p>
            © <CurrentYear /> {footer.copyright}
          </p>
        ) : null}
        {profile.location ? <p>{profile.location}</p> : null}
      </div>
    </footer>
  );
}
