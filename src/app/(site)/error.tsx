'use client';

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <div className="wrap grid min-h-[70vh] content-center justify-items-start py-32">
      <h1 className="t-title">This page didn’t load.</h1>
      <p className="t-lead muted mt-3">It’s usually a brief problem. Trying again often fixes it.</p>
      <button type="button" onClick={reset} className="btn btn-primary mt-6">
        Try again
      </button>
    </div>
  );
}
