import { REPO_URL, formatBytes, html, parseReleaseLines, renderInlineCode } from './utils.js';

export function MenuIcon() {
  return html`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  `;
}

export function CloseIcon() {
  return html`
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <path d="M6 6l12 12M18 6l-12 12" />
    </svg>
  `;
}

export function CoffeeIcon() {
  return html`
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 9h12v5a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5V9z" />
      <path d="M16 11h1.5a2.5 2.5 0 0 1 0 5H16" />
      <path d="M8 3v3M12 3v3" />
    </svg>
  `;
}

export function SunIcon() {
  return html`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  `;
}

export function MoonIcon() {
  return html`
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  `;
}

export function DuskBackdrop({ theme }) {
  const isLight = theme === 'light';
  return html`
    <img
      src=${isLight ? './assets/hero-light.webp' : './assets/hero.webp'}
      alt=${isLight
        ? 'Anime-style bright morning mountain valley village with a glowing light streak crossing the pale teal sky'
        : 'Anime-style twilight mountain valley landscape with a glowing streak of light crossing the deep teal sky above a quiet village'}
      className="hero-bg-img"
      fetchPriority="high"
    />
    <div className="hero-overlay" aria-hidden="true" />
  `;
}

export function Navbar({
  t,
  lang,
  theme,
  scrolled,
  menuOpen,
  setMenuOpen,
  toggleTheme,
  toggleLang,
  supportUrl,
  supportName,
}) {
  return html`
    <nav className=${'nav' + (scrolled ? ' scrolled' : '')} aria-label="Main navigation">
      <div className="nav-inner">
        <a href="#" className="wordmark">
          <img src="./assets/icon-128.png" alt="Lightspeed logo" width="28" height="28" />
          <span>Lightspeed</span>
        </a>

        <div className="nav-links">
          <a href="#features" className="nav-link">${t.navFeatures}</a>
          <a href="#settings" className="nav-link">${t.navSettings}</a>
          <a href="#releases" className="nav-link">${t.navReleases}</a>
          <a href="#privacy" className="nav-link">${t.navPrivacy}</a>
        </div>

        <div className="nav-actions">
          <button
            type="button"
            className="theme-btn"
            onClick=${toggleTheme}
            title=${theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label=${theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            ${theme === 'dark' ? html`<${SunIcon} />` : html`<${MoonIcon} />`}
          </button>
          <button
            type="button"
            className="lang-btn"
            onClick=${toggleLang}
            aria-label=${lang === 'en' ? 'Ganti ke Bahasa Indonesia' : 'Switch to English'}
          >
            ${lang.toUpperCase()}
          </button>
          <a href=${REPO_URL} target="_blank" rel="noopener noreferrer" className="btn-ghost">
            ${t.navGithub}
          </a>
          <a
            href=${supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-icon-warm"
            title=${'Buy me a coffee on ' + supportName}
            aria-label=${'Support Lightspeed on ' + supportName}
          >
            <${CoffeeIcon} />
          </a>
        </div>

        <button
          type="button"
          className="nav-mobile-btn"
          aria-label="Open menu"
          aria-expanded=${menuOpen}
          onClick=${() => setMenuOpen(true)}
        >
          <${MenuIcon} />
        </button>
      </div>
    </nav>

    ${menuOpen &&
    html`
      <div className="mobile-sheet" role="dialog" aria-modal="true" aria-label="Navigation menu">
        <div>
          <div style=${{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <a href="#" className="wordmark" onClick=${() => setMenuOpen(false)}>
              <img src="./assets/icon-128.png" alt="Lightspeed logo" width="28" height="28" />
              <span>Lightspeed</span>
            </a>
            <button
              type="button"
              className="nav-mobile-btn"
              style=${{ display: 'inline-flex' }}
              aria-label="Close menu"
              onClick=${() => setMenuOpen(false)}
            >
              <${CloseIcon} />
            </button>
          </div>
          <div className="mobile-sheet-links">
            <a href="#features" onClick=${() => setMenuOpen(false)}>${t.navFeatures}</a>
            <a href="#settings" onClick=${() => setMenuOpen(false)}>${t.navSettings}</a>
            <a href="#releases" onClick=${() => setMenuOpen(false)}>${t.navReleases}</a>
            <a href="#privacy" onClick=${() => setMenuOpen(false)}>${t.navPrivacy}</a>
            <a href=${REPO_URL} target="_blank" rel="noopener noreferrer">${t.navGithub}</a>
            <a href=${supportUrl} target="_blank" rel="noopener noreferrer">${supportName}</a>
          </div>
        </div>
        <div style=${{ display: 'flex', gap: 12 }}>
          <button type="button" className="theme-btn" onClick=${toggleTheme} aria-label="Toggle theme">
            ${theme === 'dark' ? html`<${SunIcon} />` : html`<${MoonIcon} />`}
          </button>
          <button type="button" className="lang-btn" onClick=${toggleLang}>
            ${lang === 'en' ? 'Bahasa Indonesia' : 'English'}
          </button>
        </div>
      </div>
    `}
  `;
}

export function ReleasesSection({ t, lang, releases }) {
  return html`
    <section id="releases" className="section">
      <div className="container">
        <div className="section-header-row reveal">
          <div className="section-header">
            <h2 className="section-title">${t.releasesTitle}</h2>
            <p className="section-lead">${t.releasesLead}</p>
          </div>
          <a
            href=${REPO_URL + '/releases'}
            target="_blank"
            rel="noopener noreferrer"
            className="text-link"
          >
            ${t.releasesViewAll}
          </a>
        </div>

        <div className="release-list reveal">
          ${releases === null
            ? html`<p style=${{ color: 'var(--text-subtle)' }}>${t.releasesLoading}</p>`
            : releases.length > 0
              ? releases.map((rel, idx) => {
                  const lines = parseReleaseLines(rel.body);
                  const assets = Array.isArray(rel.assets) ? rel.assets : [];
                  return html`
                    <article key=${rel.id} className="release-card">
                      <div className="release-head">
                        <div className="release-tag-group">
                          <a
                            href=${rel.html_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="release-tag"
                          >
                            ${rel.tag_name || rel.name}
                          </a>
                          ${idx === 0 &&
                          html`<span className="release-latest-pill">${t.releasesLatest}</span>`}
                        </div>
                        <span className="release-date">
                          ${rel.published_at
                            ? new Date(rel.published_at).toLocaleDateString(
                                lang === 'id' ? 'id-ID' : 'en-US',
                                { year: 'numeric', month: 'short', day: 'numeric' },
                              )
                            : ''}
                        </span>
                      </div>
                      ${lines.length > 0 &&
                      html`
                        <ul className="release-notes">
                          ${lines.map(
                            (line, i) => html`<li key=${i}>${renderInlineCode(line)}</li>`,
                          )}
                        </ul>
                      `}
                      ${assets.length > 0 &&
                      html`
                        <div className="release-assets">
                          ${assets.map(
                            (a) => html`
                              <a
                                key=${a.id || a.name}
                                href=${a.browser_download_url}
                                className="asset-chip"
                              >
                                <span>${a.name}</span>
                                ${a.size &&
                                html`<span className="asset-size">${formatBytes(a.size)}</span>`}
                              </a>
                            `,
                          )}
                        </div>
                      `}
                    </article>
                  `;
                })
              : html`
                  <article className="release-card">
                    <div className="release-head">
                      <div className="release-tag-group">
                        <a
                          href=${REPO_URL}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="release-tag"
                        >
                          ${t.releasesFallbackTitle}
                        </a>
                        <span className="release-latest-pill">${t.releasesLatest}</span>
                      </div>
                      <span className="release-date">${t.releasesFallbackDate}</span>
                    </div>
                    <ul className="release-notes">
                      ${t.releasesFallbackNotes.map(
                        (line, i) => html`<li key=${i}>${renderInlineCode(line)}</li>`,
                      )}
                    </ul>
                  </article>
                `}
        </div>
      </div>
    </section>
  `;
}
