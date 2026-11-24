/* global React, ReactDOM */
import { COPY } from './copy.js';
import { DuskBackdrop, Navbar, ReleasesSection } from './components.js';
import {
  CHROME_STORE_URL,
  FIREFOX_STORE_URL,
  PRIVACY_URL,
  RELEASES_API,
  REPO_URL,
  detectIndonesia,
  detectInitialLang,
  detectInitialTheme,
  html,
  isFirefoxBrowser,
} from './utils.js';

const { useEffect, useState } = React;

function App() {
  const [lang, setLang] = useState(detectInitialLang);
  const [theme, setTheme] = useState(detectInitialTheme);
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [releases, setReleases] = useState(null);
  const isID = detectIndonesia();
  const isFirefox = isFirefoxBrowser();
  const t = COPY[lang];

  const toggleLang = () => {
    const next = lang === 'en' ? 'id' : 'en';
    setLang(next);
    localStorage.setItem('lightspeed_site_lang', next);
    document.documentElement.lang = next;
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('lightspeed_site_theme', next);
    document.documentElement.dataset.theme = next;
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 36);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;
    if (
      typeof IntersectionObserver === 'undefined' ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      nodes.forEach((el) => el.classList.add('is-visible'));
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -48px 0px' },
    );
    nodes.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    fetch(RELEASES_API)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (active) setReleases(Array.isArray(data) ? data.slice(0, 5) : []);
      })
      .catch(() => {
        if (active) setReleases([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const primaryStoreUrl = isFirefox ? FIREFOX_STORE_URL : CHROME_STORE_URL;
  const primaryStoreLabel = isFirefox ? t.addFirefox : t.addChrome;
  const secondaryStoreUrl = isFirefox ? CHROME_STORE_URL : FIREFOX_STORE_URL;
  const secondaryStoreLabel = isFirefox ? t.alsoChrome : t.alsoFirefox;

  const supportUrl = isID ? 'https://trakteer.id/ibnumardini/tip' : 'https://ko-fi.com/ibnumardini';
  const supportName = isID ? 'Trakteer' : 'Ko-fi';
  const latestVersion = releases?.[0]?.tag_name || t.releasesFallbackTitle;

  return html`
    <div>
      <${Navbar}
        t=${t}
        lang=${lang}
        theme=${theme}
        scrolled=${scrolled}
        menuOpen=${menuOpen}
        setMenuOpen=${setMenuOpen}
        toggleTheme=${toggleTheme}
        toggleLang=${toggleLang}
        supportUrl=${supportUrl}
        supportName=${supportName}
      />

      <header className="hero">
        <${DuskBackdrop} theme=${theme} />
        <div className="hero-content">
          <a href="#releases" className="hero-version">
            <span className="hero-version-tag">${latestVersion}</span>
            <span className="hero-version-sep" aria-hidden="true">·</span>
            <span>${t.heroLatestLabel}</span>
            <span className="hero-version-arrow" aria-hidden="true">→</span>
          </a>
          <h1 className="hero-title">${t.heroTitle}</h1>
          <p className="hero-subtitle">${t.heroSub}</p>

          <div className="hero-cta-row">
            <div className="hero-actions">
              <a
                href=${primaryStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary"
              >
                ${primaryStoreLabel}
              </a>
              <a
                href=${secondaryStoreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hero-secondary-link"
              >
                ${secondaryStoreLabel}
              </a>
            </div>
          </div>
        </div>

        <p className="hero-tagline">${t.heroTagline}</p>
      </header>

      <main>
        <section id="features" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">${t.showcaseTitle}</h2>
              <p className="section-lead">${t.showcaseLead}</p>
            </div>

            <div className="showcase-grid">
              <div className="showcase-frame reveal">
                <img
                  src=${theme === 'light' ? './assets/preview-light.webp' : './assets/preview.png'}
                  alt=${'Lightspeed browser extension popup in ' + theme + ' mode showing quick speeds, playback speed controls, and Now playing card'}
                  width="400"
                  height="560"
                />
              </div>

              <ul className="spec-list reveal reveal-delay-1">
                ${t.specs.map(
                  (item) => html`
                    <li key=${item.title} className="spec-item">
                      <h3>${item.title}</h3>
                      <p>${item.desc}</p>
                    </li>
                  `,
                )}
              </ul>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">${t.featuresTitle}</h2>
              <p className="section-lead">${t.featuresLead}</p>
            </div>

            <div className="cards-grid">
              ${t.cards.map(
                (card, idx) => html`
                  <article
                    key=${idx}
                    className=${'card reveal' + (idx === 1 ? ' reveal-delay-1' : idx === 2 ? ' reveal-delay-2' : '')}
                  >
                    <h3>${card.title}</h3>
                    <p>${card.desc}</p>
                  </article>
                `,
              )}
            </div>
          </div>
        </section>

        <section id="settings" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">${t.settingsTitle}</h2>
              <p className="section-lead">${t.settingsLead}</p>
            </div>

            <div className="settings-hero-card reveal">
              <div className="settings-shot">
                <img
                  src=${theme === 'light' ? './assets/settings-layout-light.webp' : './assets/settings-layout.webp'}
                  alt="Lightspeed Settings page showing Popup layout switches alongside the real-time Live preview"
                  loading="lazy"
                />
              </div>
              <div className="settings-hero-copy">
                <h3>${t.settingsOverviewTitle}</h3>
                <p>${t.settingsOverviewDesc}</p>
              </div>
            </div>

            <div className="settings-pair">
              <article className="settings-detail-card reveal">
                <div className="settings-shot">
                  <img
                    src=${theme === 'light' ? './assets/settings-speeds-light.webp' : './assets/settings-speeds.webp'}
                    alt="Quick speeds list editor and Fine-tune small and big step options with Custom input"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3>${t.settingsSpeedsTitle}</h3>
                  <p>${t.settingsSpeedsDesc}</p>
                </div>
              </article>

              <article className="settings-detail-card reveal reveal-delay-1">
                <div className="settings-shot">
                  <img
                    src=${theme === 'light' ? './assets/settings-customize-light.webp' : './assets/settings-customize.webp'}
                    alt="Keyboard shortcuts configuration and Appearance controls for language, theme, and accent color"
                    loading="lazy"
                  />
                </div>
                <div>
                  <h3>${t.settingsCustomTitle}</h3>
                  <p>${t.settingsCustomDesc}</p>
                </div>
              </article>
            </div>
          </div>
        </section>

        <${ReleasesSection} t=${t} lang=${lang} releases=${releases} />

        <section id="privacy" className="section">
          <div className="container">
            <div className="section-header reveal">
              <h2 className="section-title">${t.privacyTitle}</h2>
            </div>

            <div className="privacy-box reveal">
              <div className="privacy-copy">
                <p>${t.privacyP1}</p>
                <ul className="privacy-points">
                  ${t.privacyPoints.map(
                    (point, i) => html`<li key=${i}>${point}</li>`,
                  )}
                </ul>
                <a
                  href=${PRIVACY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-link"
                >
                  ${t.privacyLink}
                </a>
              </div>

              <div className="privacy-perms-wrap">
                <p className="privacy-perms-label">${t.privacyPermsTitle}</p>
                <ul className="privacy-perms">
                  ${t.perms.map(
                    ([perm, desc]) => html`
                      <li key=${perm}>
                        <code>${perm}</code>
                        <span>${desc}</span>
                      </li>
                    `,
                  )}
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div className="cta-band reveal">
              <h2>${t.ctaBandTitle}</h2>
              <p>${t.ctaBandSub}</p>
              <div className="hero-actions">
                <a
                  href=${primaryStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                >
                  ${primaryStoreLabel}
                </a>
                <a
                  href=${secondaryStoreUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hero-secondary-link"
                >
                  ${secondaryStoreLabel}
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <div className="container footer-inner">
          <span>
            © ${new Date().getFullYear()} Lightspeed - Video Speed Controller Pro · ${t.footerMade} <a href="https://ibnu.mardini.dev" target="_blank" rel="noopener noreferrer" className="footer-author">Muhammad Fatkurozi</a>
          </span>
          <div className="footer-links">
            <a href=${REPO_URL} target="_blank" rel="noopener noreferrer">GitHub</a>
            <a href=${PRIVACY_URL} target="_blank" rel="noopener noreferrer">${t.footerPrivacy}</a>
            <a href=${supportUrl} target="_blank" rel="noopener noreferrer">${supportName}</a>
          </div>
        </div>
      </footer>
    </div>
  `;
}

ReactDOM.createRoot(document.getElementById('root')).render(html`<${App} />`);
