const ROWS = [3, 5, 2];

/** Matches the layout of the panel, so nothing jumps when it arrives. */
export function AdminSkeleton() {
  return (
    <div className="a-shell a-skeleton" data-pushed="false" aria-busy="true" aria-label="Loading">
      <div className="a-side">
        <div className="a-side-inner">
          <span className="a-bone" style={{ width: '60%', height: 18, margin: '18px 12px 20px' }} />
          {Array.from({ length: 12 }, (_, index) => (
            <span key={index} className="a-side-bone">
              <span className="a-bone" style={{ width: 22, height: 22, borderRadius: 6 }} />
              <span className="a-bone" style={{ width: `${40 + ((index * 17) % 40)}%`, height: 11 }} />
            </span>
          ))}
        </div>
      </div>
      <div className="a-main">
        <div className="a-topbar">
          <span className="a-bone" style={{ width: 120, height: 15 }} />
        </div>
        <div className="a-content">
          {ROWS.map((count, group) => (
            <div key={group} className="a-group">
              <div className="a-group-head">
                <span className="a-bone" style={{ width: 90, height: 10 }} />
              </div>
              <div className="a-rows">
                {Array.from({ length: count }, (_, row) => (
                  <div key={row} className="a-row">
                    <span className="a-bone" style={{ width: 100, height: 11 }} />
                    <span className="a-bone" style={{ width: 140, height: 11, justifySelf: 'end' }} />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="a-preview-slot" />
    </div>
  );
}

export function LoadProblem() {
  return (
    <div className="a-login-page">
      <div className="a-login-card" role="alert">
        <h1 className="a-login-title">Couldn’t load your content</h1>
        <p className="a-login-text">
          The site couldn’t reach its storage. Your content is safe. Reload this page in a moment, and if this keeps
          happening, check that the Blob store is still connected in Vercel.
        </p>
      </div>
    </div>
  );
}
