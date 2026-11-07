'use client';

/** The last line of defence, for failures in the site's shared layout, such as storage being briefly unreachable. */
export default function RootError({ reset }: { reset: () => void }) {
  return (
    <div className="site grid place-items-center" data-font="archivo" data-surface="paper" data-corners="round" data-motion="off">
      <div className="wrap py-32">
        <h1 className="t-closing">This page didn’t load.</h1>
        <p className="t-lead muted mt-4">It’s usually a brief problem. Trying again often fixes it.</p>
        <button type="button" onClick={reset} className="btn btn-quiet mt-8 cursor-pointer">
          Try again
        </button>
      </div>
    </div>
  );
}
