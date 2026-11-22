import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckIcon,
  CoffeeIcon,
  GlobeIcon,
  LightspeedLogo,
  PencilIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/Icons';
import { PopupView } from '@/components/PopupView';
import {
  isLowContrast,
  PRESET_ACCENTS,
  PRESET_HEX_SET,
  PRIVACY_URL,
  SUPPORT_URLS,
  WEBSITE_URL,
} from '@/utils/color';
import { getStrings, resolveLang } from '@/utils/i18n';
import {
  DEFAULT_SPEED,
  detectIndonesiaRegion,
  formatShortSpeed,
  parseSpeed,
} from '@/utils/speed';
import {
  DEFAULT_QUICK_SPEEDS,
  DEFAULT_SETTINGS,
  type LanguageMode,
  type PopupVisibility,
  type ScopeMode,
  type Settings,
  settingsStorage,
  type ShortcutKeys,
  type ThemeMode,
} from '@/utils/storage';
import { useResolvedTheme } from '@/utils/theme';

const NAV_ITEMS = [
  { id: 'popup', label: 'Popup layout' },
  { id: 'quick', label: 'Quick speeds' },
  { id: 'steps', label: 'Fine-tune steps' },
  { id: 'shortcuts', label: 'Keyboard shortcuts' },
  { id: 'appearance', label: 'Appearance' },
] as const;

const VISIBILITY_ROWS: { key: keyof PopupVisibility; title: string; desc: string }[] = [
  {
    key: 'scope',
    title: 'Scope selector',
    desc: 'Apply a speed to this tab, the whole site, or all tabs.',
  },
  {
    key: 'quick',
    title: 'Quick speeds',
    desc: 'One-tap speed buttons. Edit the list in Quick speeds below.',
  },
  {
    key: 'fine',
    title: 'Fine-tune buttons',
    desc: 'The −/+ step buttons around the speed field. They change the speed right away.',
  },
  {
    key: 'manual',
    title: 'Manual speed input',
    desc: 'Type any speed from 0.1× to 16×. It only takes effect after Apply or Enter.',
  },
  {
    key: 'now',
    title: 'Now playing',
    desc: 'The current video, time left at your speed, and how much time it saves.',
  },
];

const SMALL_STEPS = [1, 2, 5] as const;
const BIG_STEPS = [5, 10, 25] as const;
const THEME_OPTIONS: { id: ThemeMode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
];

export default function App({ initialSettings = DEFAULT_SETTINGS }: { initialSettings?: Settings }) {
  const [settings, setSettings] = useState<Settings>(initialSettings);
  const [activeNav, setActiveNav] = useState<string>('popup');

  // Quick speeds local edit state
  const [editing, setEditing] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [addDraft, setAddDraft] = useState('');
  const [quickErr, setQuickErr] = useState('');
  const justFocusedRef = useRef(false);

  // Shortcut capture state
  const [listening, setListening] = useState<keyof ShortcutKeys | null>(null);
  const [keyMsg, setKeyMsg] = useState('');

  // Custom fine-tune step input state
  const [editingStep, setEditingStep] = useState<'small' | 'big' | null>(null);
  const [stepDraft, setStepDraft] = useState('');
  const [stepErr, setStepErr] = useState('');

  // Interactive preview state
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [previewScope, setPreviewScope] = useState<ScopeMode>('tab');
  const [previewSpeed, setPreviewSpeed] = useState<number>(1);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const isIndonesia = useMemo(() => detectIndonesiaRegion(), []);
  const themeMode: ThemeMode = settings.theme ?? 'system';
  const resolvedTheme = useResolvedTheme(themeMode);
  const langMode: LanguageMode = settings.lang ?? 'auto';
  const resolvedLang = resolveLang(langMode);
  const t = getStrings(resolvedLang);

  const navItems = [
    { id: 'popup', label: t.navPopup },
    { id: 'quick', label: t.navQuick },
    { id: 'steps', label: t.navSteps },
    { id: 'shortcuts', label: t.navShortcuts },
    { id: 'appearance', label: t.navAppearance },
  ] as const;

  const visRows: { key: keyof PopupVisibility; title: string; desc: string }[] = [
    { key: 'scope', title: t.visScopeTitle, desc: t.visScopeDesc },
    { key: 'quick', title: t.visQuickTitle, desc: t.visQuickDesc },
    { key: 'fine', title: t.visFineTitle, desc: t.visFineDesc },
    { key: 'manual', title: t.visManualTitle, desc: t.visManualDesc },
    { key: 'now', title: t.visNowTitle, desc: t.visNowDesc },
  ];

  const langOptions: { id: LanguageMode; label: string }[] = [
    { id: 'auto', label: t.langAuto },
    { id: 'en', label: 'English' },
    { id: 'id', label: 'Bahasa Indonesia' },
  ];

  const themeOptions: { id: ThemeMode; label: string }[] = [
    { id: 'system', label: t.themeSystem },
    { id: 'light', label: t.themeLight },
    { id: 'dark', label: t.themeDark },
  ];

  useEffect(() => {
    document.documentElement.style.setProperty('--accent', settings.accent);
    try {
      localStorage.setItem('ls_accent', settings.accent);
    } catch {
      // Ignore storage errors
    }
  }, [settings.accent]);

  useEffect(() => {
    void settingsStorage.getValue().then(setSettings);
    const unwatch = settingsStorage.watch((next) => {
      if (next) setSettings(next);
    });
    return () => unwatch();
  }, []);

  useEffect(() => {
    const updateActiveFromScroll = () => {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24;
      if (atBottom) {
        setActiveNav(NAV_ITEMS[NAV_ITEMS.length - 1].id);
        return;
      }
      let current: string = NAV_ITEMS[0].id;
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          current = item.id;
        }
      }
      setActiveNav(current);
    };

    updateActiveFromScroll();
    window.addEventListener('scroll', updateActiveFromScroll, { passive: true });
    return () => window.removeEventListener('scroll', updateActiveFromScroll);
  }, []);

  const updateSettings = (updater: (prev: Settings) => Settings) => {
    setSettings((prev) => {
      const next = updater(prev);
      void settingsStorage.setValue(next);
      return next;
    });
  };

  const accent = settings.accent;
  const supportUrl = isIndonesia ? SUPPORT_URLS.indonesia : SUPPORT_URLS.global;
  const supportLabel = t.supportButton(isIndonesia);
  const version = browser?.runtime?.getManifest?.().version ?? '1.0.0';

  const quickFull = settings.quickSpeeds.length >= 10;

  const addQuick = () => {
    const n = parseSpeed(addDraft);
    if (n === null) {
      setQuickErr(t.quickErrRange);
      return;
    }
    if (settings.quickSpeeds.includes(n)) {
      setQuickErr(t.quickErrDuplicate(formatShortSpeed(n)));
      return;
    }
    if (quickFull) {
      setQuickErr(t.quickErrMax);
      return;
    }
    updateSettings((prev) => ({
      ...prev,
      quickSpeeds: [...prev.quickSpeeds, n].sort((a, b) => a - b),
    }));
    setAddDraft('');
    setQuickErr('');
  };

  const saveEdit = () => {
    if (editing === null) return;
    const n = parseSpeed(editDraft);
    if (n === null) {
      setQuickErr(t.quickErrRange);
      return;
    }
    if (n !== editing && settings.quickSpeeds.includes(n)) {
      setQuickErr(t.quickErrDuplicate(formatShortSpeed(n)));
      return;
    }
    updateSettings((prev) => ({
      ...prev,
      quickSpeeds: prev.quickSpeeds
        .map((x) => (x === editing ? n : x))
        .sort((a, b) => a - b),
    }));
    setEditing(null);
    setEditDraft('');
    setQuickErr('');
  };

  const cancelEdit = () => {
    setEditing(null);
    setEditDraft('');
    setQuickErr('');
  };

  const removeQuick = (val: number) => {
    if (settings.quickSpeeds.length <= 1) return;
    updateSettings((prev) => ({
      ...prev,
      quickSpeeds: prev.quickSpeeds.filter((x) => x !== val),
    }));
    if (editing === val) setEditing(null);
    setQuickErr('');
  };

  const resetQuick = () => {
    updateSettings((prev) => ({
      ...prev,
      quickSpeeds: [...DEFAULT_QUICK_SPEEDS],
    }));
    setEditing(null);
    setQuickErr('');
  };

  const keyDefs: { id: keyof ShortcutKeys; action: string }[] = [
    { id: 'up', action: t.shortcutUp(settings.smallStep) },
    { id: 'down', action: t.shortcutDown(settings.smallStep) },
    { id: 'reset', action: t.shortcutReset },
  ];

  const handleCaptureKey = (
    id: keyof ShortcutKeys,
    e: React.KeyboardEvent<HTMLButtonElement>,
  ) => {
    if (listening !== id) return;
    if (e.key === 'Escape') {
      setListening(null);
      return;
    }
    if (e.key.length !== 1 || !/[a-z0-9]/i.test(e.key)) return;
    e.preventDefault();
    const key = e.key.toUpperCase();
    const taken = (Object.keys(settings.keys) as (keyof ShortcutKeys)[]).find(
      (k) => k !== id && settings.keys[k] === key,
    );
    if (taken) {
      setKeyMsg(t.keyTaken(key));
      return;
    }
    updateSettings((prev) => ({
      ...prev,
      keys: { ...prev.keys, [id]: key },
    }));
    setListening(null);
    setKeyMsg('');
  };

  const customActive = !PRESET_HEX_SET.has(accent.toUpperCase());
  const customLowContrast = customActive && isLowContrast(accent);

  const smallIsCustom = !(SMALL_STEPS as readonly number[]).includes(settings.smallStep);
  const bigIsCustom = !(BIG_STEPS as readonly number[]).includes(settings.bigStep);

  const openCustomStep = (kind: 'small' | 'big') => {
    const current = kind === 'small' ? settings.smallStep : settings.bigStep;
    setEditingStep(kind);
    setStepDraft(String(current));
    setStepErr('');
  };

  const commitCustomStep = (kind: 'small' | 'big') => {
    const max = kind === 'small' ? 25 : 50;
    const cleaned = stepDraft.trim().replace(/%/g, '');
    const n = Number(cleaned);
    if (!Number.isInteger(n) || n < 1 || n > max) {
      setStepErr(t.stepErrRange(max));
      return;
    }
    updateSettings((prev) =>
      kind === 'small' ? { ...prev, smallStep: n } : { ...prev, bigStep: n },
    );
    setEditingStep(null);
    setStepDraft('');
    setStepErr('');
  };

  return (
    <div
      data-theme={resolvedTheme}
      style={
        {
          '--accent': accent,
          minHeight: '100vh',
          background: 'var(--bg-page)',
          color: 'var(--text-primary)',
          fontSize: 14,
        } as React.CSSProperties
      }
    >
      <header
        style={{
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-header-end) 100%)',
          borderBottom: '1px solid var(--border)',
          boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '16px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <LightspeedLogo size={40} accent={accent} />
          <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: '0.04em',
                lineHeight: 1.2,
              }}
            >
              LIGHTSPEED{' '}
              <span style={{ fontWeight: 600, letterSpacing: 0, color: 'var(--text-muted)' }}>
                Settings
              </span>
            </h1>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent-fg)' }}>
              Video Speed Controller Pro{' '}
              <span
                style={{
                  fontWeight: 600,
                  color: 'var(--text-subtle)',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                · v{version}
              </span>
            </span>
          </div>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              fontSize: 12.5,
              fontWeight: 600,
              color: 'var(--text-muted)',
            }}
          >
            <CheckIcon size={16} color="var(--accent-fg)" strokeWidth={2.4} />
            {t.changesAutoSave}
          </span>
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ls-btn ls-btn-surface"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 40,
              padding: '0 14px',
              borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <GlobeIcon size={16} color="var(--accent-fg)" />
            {t.website}
          </a>
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ls-btn ls-btn-warm"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 40,
              padding: '0 14px',
              borderRadius: 10,
              border: '1.5px solid var(--warm-border)',
              background: 'var(--warm-bg)',
              color: 'var(--warm-text)',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <CoffeeIcon size={18} />
            {supportLabel}
          </a>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: 24,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          gap: 24,
        }}
      >
        <nav
          aria-label="Settings sections"
          style={{
            flex: '1 1 200px',
            display: 'flex',
            flexDirection: 'column',
            gap: 4,
            position: 'sticky',
            top: 24,
          }}
        >
          {navItems.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                className={isActive ? undefined : 'ls-nav-link'}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 44,
                  padding: '0 14px',
                  borderRadius: 10,
                  background: isActive ? 'var(--accent-tint)' : 'transparent',
                  color: isActive ? 'var(--accent-fg)' : 'var(--text-secondary)',
                  fontWeight: isActive ? 700 : 600,
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div
          style={{
            flex: '999 1 560px',
            minWidth: 0,
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'flex-start',
            gap: 24,
          }}
        >
          <main
            style={{
              flex: '999 1 480px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 20,
            }}
          >
            {/* Popup layout */}
            <section
              id="popup"
              className="ls-card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
                scrollMarginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.navPopup}</h2>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'var(--text-muted)',
                }}
              >
                {t.popupLayoutDesc}
              </p>
              {visRows.map((r) => {
                const on = settings.vis[r.key];
                return (
                  <div
                    key={r.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 0',
                      borderTop: '1px solid var(--border-divider)',
                    }}
                  >
                    <div
                      style={{
                        flex: '1 1 0',
                        minWidth: 0,
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 2,
                      }}
                    >
                      <span style={{ fontSize: 14.5, fontWeight: 700 }}>{r.title}</span>
                      <span style={{ fontSize: 13, lineHeight: 1.45, color: 'var(--text-muted)' }}>
                        {r.desc}
                      </span>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={on}
                      aria-label={`Show ${r.title}`}
                      onClick={() =>
                        updateSettings((prev) => ({
                          ...prev,
                          vis: { ...prev.vis, [r.key]: !on },
                        }))
                      }
                      style={{
                        flex: '0 0 52px',
                        width: 52,
                        height: 32,
                        padding: 3,
                        borderRadius: 999,
                        border: 0,
                        display: 'flex',
                        cursor: 'pointer',
                        background: on ? accent : 'var(--switch-off)',
                        transition: 'background 0.15s ease',
                      }}
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.28)',
                          transition: 'transform 0.15s ease',
                          transform: on ? 'translateX(20px)' : 'translateX(0)',
                        }}
                      />
                    </button>
                  </div>
                );
              })}
            </section>

            {/* Quick speeds */}
            <section
              id="quick"
              className="ls-card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
                scrollMarginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 8,
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: '1 1 260px' }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.navQuick}</h2>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                    {t.quickSpeedsDesc}
                  </p>
                </div>
                <button
                  type="button"
                  className="ls-btn ls-btn-surface"
                  onClick={resetQuick}
                  style={{
                    height: 40,
                    padding: '0 14px',
                    borderRadius: 10,
                    border: '1.5px solid var(--border-strong)',
                    background: 'var(--bg-surface)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {t.resetToDefault}
                </button>
              </div>

              <ul
                style={{
                  listStyle: 'none',
                  margin: '12px 0 0',
                  padding: 0,
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {settings.quickSpeeds.map((v, idx) => {
                  const isEditing = editing === v;
                  const lastOne = settings.quickSpeeds.length <= 1;
                  const label = formatShortSpeed(v);
                  return (
                    <li
                      key={v}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        minHeight: 60,
                        borderTop: '1px solid var(--border-divider)',
                      }}
                    >
                      <span
                        style={{
                          flex: '0 0 24px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: 'var(--text-muted)',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      >
                        {idx + 1}
                      </span>
                      {!isEditing ? (
                        <>
                          <span style={{ flex: '1 1 0', minWidth: 0 }}>
                            <span
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                height: 36,
                                padding: '0 14px',
                                borderRadius: 10,
                                background: 'var(--accent-tint)',
                                color: 'var(--accent-fg)',
                                fontSize: 15,
                                fontWeight: 800,
                                fontVariantNumeric: 'tabular-nums',
                              }}
                            >
                              {label}
                            </span>
                          </span>
                          <button
                            type="button"
                            className="ls-btn ls-btn-surface"
                            onClick={() => {
                              setEditing(v);
                              setEditDraft(String(v));
                              setQuickErr('');
                            }}
                            aria-label={`Edit ${label}`}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              height: 40,
                              padding: '0 12px',
                              borderRadius: 10,
                              border: '1.5px solid var(--border-strong)',
                              background: 'var(--bg-surface)',
                              color: 'var(--text-secondary)',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <PencilIcon />
                            {t.edit}
                          </button>
                          <button
                            type="button"
                            className="ls-btn ls-btn-surface"
                            onClick={() => removeQuick(v)}
                            disabled={lastOne}
                            aria-label={`Delete ${label}`}
                            style={{
                              width: 40,
                              height: 40,
                              padding: 0,
                              borderRadius: 10,
                              border: '1.5px solid var(--danger-border)',
                              background: 'var(--bg-surface)',
                              color: 'var(--error)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              opacity: lastOne ? 0.4 : 1,
                              cursor: lastOne ? 'not-allowed' : 'pointer',
                            }}
                          >
                            <TrashIcon />
                          </button>
                        </>
                      ) : (
                        <>
                          <span style={{ flex: '1 1 0', minWidth: 0, display: 'flex' }}>
                            <span
                              className="ls-input-well"
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: 140,
                                height: 40,
                                padding: '0 12px',
                                borderRadius: 10,
                                border: '2px solid var(--accent-fg)',
                                background: 'var(--bg-surface)',
                              }}
                            >
                              <input
                                type="text"
                                inputMode="decimal"
                                aria-label={`Edit speed ${idx + 1}`}
                                value={editDraft}
                                onChange={(e) => {
                                  setEditDraft(e.target.value);
                                  setQuickErr('');
                                }}
                                onFocus={(e) => {
                                  justFocusedRef.current = true;
                                  e.currentTarget.select();
                                }}
                                onMouseUp={(e) => {
                                  if (justFocusedRef.current) {
                                    e.preventDefault();
                                    justFocusedRef.current = false;
                                  }
                                }}
                                onBlur={() => {
                                  justFocusedRef.current = false;
                                }}
                                onKeyDown={(e) => {
                                  justFocusedRef.current = false;
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    saveEdit();
                                  } else if (e.key === 'Escape') {
                                    cancelEdit();
                                  }
                                }}
                                autoFocus
                                style={{
                                  flex: '1 1 0',
                                  minWidth: 0,
                                  border: 0,
                                  outline: 'none',
                                  background: 'transparent',
                                  padding: 0,
                                  fontSize: 15,
                                  fontWeight: 800,
                                  color: 'var(--text-primary)',
                                }}
                              />
                              <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>×</span>
                            </span>
                          </span>
                          <button
                            type="button"
                            className="ls-btn ls-btn-primary"
                            onClick={saveEdit}
                            style={{
                              height: 40,
                              padding: '0 16px',
                              borderRadius: 10,
                              border: 0,
                              background: accent,
                              color: '#FFFFFF',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {t.save}
                          </button>
                          <button
                            type="button"
                            className="ls-btn ls-btn-surface"
                            onClick={cancelEdit}
                            style={{
                              height: 40,
                              padding: '0 14px',
                              borderRadius: 10,
                              border: '1.5px solid var(--border-strong)',
                              background: 'var(--bg-surface)',
                              color: 'var(--text-secondary)',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            {t.cancel}
                          </button>
                        </>
                      )}
                    </li>
                  );
                })}
              </ul>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  gap: 10,
                  paddingTop: 16,
                  borderTop: '1px solid var(--border-divider)',
                }}
              >
                <label
                  htmlFor="ls-add-quick"
                  style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-secondary)' }}
                >
                  {t.addASpeed}
                </label>
                <span
                  className="ls-input-well"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 140,
                    height: 44,
                    padding: '0 12px',
                    borderRadius: 10,
                    border: `1.5px solid ${quickErr && editing === null ? 'var(--error)' : 'var(--border-strong)'}`,
                    background: 'var(--bg-surface)',
                  }}
                >
                  <input
                    id="ls-add-quick"
                    type="text"
                    inputMode="decimal"
                    placeholder={t.addPlaceholder}
                    value={addDraft}
                    onChange={(e) => {
                      setAddDraft(e.target.value);
                      setQuickErr('');
                    }}
                    onFocus={(e) => {
                      justFocusedRef.current = true;
                      e.currentTarget.select();
                    }}
                    onMouseUp={(e) => {
                      if (justFocusedRef.current) {
                        e.preventDefault();
                        justFocusedRef.current = false;
                      }
                    }}
                    onBlur={() => {
                      justFocusedRef.current = false;
                    }}
                    onKeyDown={(e) => {
                      justFocusedRef.current = false;
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addQuick();
                      }
                    }}
                    style={{
                      flex: '1 1 0',
                      minWidth: 0,
                      border: 0,
                      outline: 'none',
                      background: 'transparent',
                      padding: 0,
                      fontSize: 15,
                      fontWeight: 800,
                      color: 'var(--text-primary)',
                    }}
                  />
                  <span style={{ fontWeight: 800, color: 'var(--text-muted)' }}>×</span>
                </span>
                <button
                  type="button"
                  className={`ls-btn ${quickFull ? '' : 'ls-btn-primary'}`}
                  onClick={addQuick}
                  disabled={quickFull}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    height: 44,
                    padding: '0 16px',
                    borderRadius: 10,
                    border: 0,
                    fontSize: 14,
                    fontWeight: 700,
                    background: quickFull ? 'var(--btn-disabled-bg)' : accent,
                    color: quickFull ? 'var(--btn-disabled-text)' : '#FFFFFF',
                    cursor: quickFull ? 'not-allowed' : 'pointer',
                  }}
                >
                  <PlusIcon />
                  {t.add}
                </button>
              </div>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: quickErr ? 'var(--error)' : 'var(--text-muted)',
                }}
              >
                {quickErr || t.quickCountMsg(settings.quickSpeeds.length)}
              </p>
            </section>

            {/* Fine-tune steps */}
            <section
              id="steps"
              className="ls-card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
                scrollMarginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.navSteps}</h2>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                  {t.fineTuneDesc}
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div
                  role="group"
                  aria-label={t.smallStep}
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    {t.smallStep}
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {SMALL_STEPS.map((val) => {
                      const active = settings.smallStep === val && editingStep !== 'small';
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`ls-btn ${active ? 'ls-btn-primary' : 'ls-btn-surface'}`}
                          aria-pressed={active}
                          onClick={() => {
                            setEditingStep(null);
                            setStepErr('');
                            updateSettings((prev) => ({ ...prev, smallStep: val }));
                          }}
                          style={{
                            minWidth: 64,
                            height: 44,
                            padding: '0 14px',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: active ? accent : 'var(--bg-surface)',
                            color: active ? '#FFFFFF' : 'var(--text-secondary)',
                            border: `1.5px solid ${active ? accent : 'var(--border-strong)'}`,
                          }}
                        >
                          {val}%
                        </button>
                      );
                    })}
                    {editingStep === 'small' ? (
                      <span
                        className="ls-input-well"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          width: 96,
                          height: 44,
                          padding: '0 10px',
                          borderRadius: 10,
                          border: `2px solid ${stepErr ? 'var(--error)' : 'var(--accent-fg)'}`,
                          background: 'var(--bg-surface)',
                        }}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="Custom small step percentage"
                          value={stepDraft}
                          autoFocus
                          onChange={(e) => {
                            setStepDraft(e.target.value);
                            setStepErr('');
                          }}
                          onFocus={(e) => {
                            justFocusedRef.current = true;
                            e.currentTarget.select();
                          }}
                          onMouseUp={(e) => {
                            if (justFocusedRef.current) {
                              e.preventDefault();
                              justFocusedRef.current = false;
                            }
                          }}
                          onBlur={() => {
                            justFocusedRef.current = false;
                            commitCustomStep('small');
                          }}
                          onKeyDown={(e) => {
                            justFocusedRef.current = false;
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitCustomStep('small');
                            } else if (e.key === 'Escape') {
                              setEditingStep(null);
                              setStepErr('');
                            }
                          }}
                          style={{
                            flex: '1 1 0',
                            minWidth: 0,
                            border: 0,
                            outline: 'none',
                            background: 'transparent',
                            padding: 0,
                            fontSize: 14,
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        />
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginLeft: 2 }}>
                          %
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={`ls-btn ${smallIsCustom ? 'ls-btn-primary' : 'ls-btn-surface'}`}
                        aria-pressed={smallIsCustom}
                        onClick={() => openCustomStep('small')}
                        style={{
                          minWidth: 76,
                          height: 44,
                          padding: '0 14px',
                          borderRadius: 10,
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: smallIsCustom ? accent : 'var(--bg-surface)',
                          color: smallIsCustom ? '#FFFFFF' : 'var(--text-secondary)',
                          border: smallIsCustom
                            ? `1.5px solid ${accent}`
                            : '1.5px dashed var(--border-strong)',
                        }}
                      >
                        {smallIsCustom ? `${settings.smallStep}%` : 'Custom'}
                      </button>
                    )}
                  </div>
                </div>

                <div
                  role="group"
                  aria-label="Big step"
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                    Big step
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {BIG_STEPS.map((val) => {
                      const active = settings.bigStep === val && editingStep !== 'big';
                      return (
                        <button
                          key={val}
                          type="button"
                          className={`ls-btn ${active ? 'ls-btn-primary' : 'ls-btn-surface'}`}
                          aria-pressed={active}
                          onClick={() => {
                            setEditingStep(null);
                            setStepErr('');
                            updateSettings((prev) => ({ ...prev, bigStep: val }));
                          }}
                          style={{
                            minWidth: 64,
                            height: 44,
                            padding: '0 14px',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: active ? accent : 'var(--bg-surface)',
                            color: active ? '#FFFFFF' : 'var(--text-secondary)',
                            border: `1.5px solid ${active ? accent : 'var(--border-strong)'}`,
                          }}
                        >
                          {val}%
                        </button>
                      );
                    })}
                    {editingStep === 'big' ? (
                      <span
                        className="ls-input-well"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          width: 96,
                          height: 44,
                          padding: '0 10px',
                          borderRadius: 10,
                          border: `2px solid ${stepErr ? 'var(--error)' : 'var(--accent-fg)'}`,
                          background: 'var(--bg-surface)',
                        }}
                      >
                        <input
                          type="text"
                          inputMode="numeric"
                          aria-label="Custom big step percentage"
                          value={stepDraft}
                          autoFocus
                          onChange={(e) => {
                            setStepDraft(e.target.value);
                            setStepErr('');
                          }}
                          onFocus={(e) => {
                            justFocusedRef.current = true;
                            e.currentTarget.select();
                          }}
                          onMouseUp={(e) => {
                            if (justFocusedRef.current) {
                              e.preventDefault();
                              justFocusedRef.current = false;
                            }
                          }}
                          onBlur={() => {
                            justFocusedRef.current = false;
                            commitCustomStep('big');
                          }}
                          onKeyDown={(e) => {
                            justFocusedRef.current = false;
                            if (e.key === 'Enter') {
                              e.preventDefault();
                              commitCustomStep('big');
                            } else if (e.key === 'Escape') {
                              setEditingStep(null);
                              setStepErr('');
                            }
                          }}
                          style={{
                            flex: '1 1 0',
                            minWidth: 0,
                            border: 0,
                            outline: 'none',
                            background: 'transparent',
                            padding: 0,
                            fontSize: 14,
                            fontWeight: 800,
                            color: 'var(--text-primary)',
                            textAlign: 'right',
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        />
                        <span style={{ fontWeight: 700, color: 'var(--text-muted)', marginLeft: 2 }}>
                          %
                        </span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={`ls-btn ${bigIsCustom ? 'ls-btn-primary' : 'ls-btn-surface'}`}
                        aria-pressed={bigIsCustom}
                        onClick={() => openCustomStep('big')}
                        style={{
                          minWidth: 76,
                          height: 44,
                          padding: '0 14px',
                          borderRadius: 10,
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: bigIsCustom ? accent : 'var(--bg-surface)',
                          color: bigIsCustom ? '#FFFFFF' : 'var(--text-secondary)',
                          border: bigIsCustom
                            ? `1.5px solid ${accent}`
                            : '1.5px dashed var(--border-strong)',
                        }}
                      >
                        {bigIsCustom ? `${settings.bigStep}%` : 'Custom'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
              {stepErr && (
                <p style={{ margin: 0, fontSize: 12.5, fontWeight: 600, color: 'var(--error)' }}>
                  {stepErr}
                </p>
              )}
            </section>

            {/* Keyboard shortcuts */}
            <section
              id="shortcuts"
              className="ls-card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
                scrollMarginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 16,
                }}
              >
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.navShortcuts}</h2>
                <button
                  type="button"
                  role="switch"
                  aria-checked={settings.shortcutsEnabled ?? true}
                  aria-label={t.navShortcuts}
                  onClick={() => {
                    const nextOn = !(settings.shortcutsEnabled ?? true);
                    if (!nextOn) {
                      setListening(null);
                      setKeyMsg('');
                    }
                    updateSettings((prev) => ({ ...prev, shortcutsEnabled: nextOn }));
                  }}
                  style={{
                    flex: '0 0 52px',
                    width: 52,
                    height: 32,
                    padding: 3,
                    borderRadius: 999,
                    border: 0,
                    display: 'flex',
                    cursor: 'pointer',
                    background: (settings.shortcutsEnabled ?? true) ? accent : 'var(--switch-off)',
                    transition: 'background 0.15s ease',
                  }}
                >
                  <span
                    style={{
                      width: 26,
                      height: 26,
                      borderRadius: '50%',
                      background: '#FFFFFF',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.28)',
                      transition: 'transform 0.15s ease',
                      transform: (settings.shortcutsEnabled ?? true)
                        ? 'translateX(20px)'
                        : 'translateX(0)',
                    }}
                  />
                </button>
              </div>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: 'var(--text-muted)',
                }}
              >
                {t.shortcutsDesc}
              </p>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 4,
                  opacity: (settings.shortcutsEnabled ?? true) ? 1 : 0.45,
                  pointerEvents: (settings.shortcutsEnabled ?? true) ? 'auto' : 'none',
                  transition: 'opacity 0.15s ease',
                }}
              >
                {keyDefs.map((k) => {
                  const isListening = listening === k.id;
                  return (
                    <div
                      key={k.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '12px 0',
                        borderTop: '1px solid var(--border-divider)',
                      }}
                    >
                      <span style={{ flex: '1 1 0', minWidth: 0, fontSize: 14, fontWeight: 600 }}>
                        {k.action}
                      </span>
                      <kbd
                        style={{
                          minWidth: 36,
                          height: 36,
                          padding: '0 10px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: 8,
                          border: `1.5px solid ${isListening ? 'var(--accent-fg)' : 'var(--border-strong)'}`,
                          borderBottomWidth: 3,
                          background: 'var(--bg-surface)',
                          fontSize: 14,
                          fontWeight: 800,
                          color: isListening ? 'var(--accent-fg)' : 'var(--text-primary)',
                        }}
                      >
                        {isListening ? t.pressKey : settings.keys[k.id]}
                      </kbd>
                      <button
                        type="button"
                        disabled={!(settings.shortcutsEnabled ?? true)}
                        className="ls-btn ls-btn-surface"
                        onClick={() => {
                          setListening(isListening ? null : k.id);
                          setKeyMsg('');
                        }}
                        onKeyDown={(e) => handleCaptureKey(k.id, e)}
                        style={{
                          minWidth: 88,
                          height: 40,
                          padding: '0 14px',
                          borderRadius: 10,
                          border: '1.5px solid var(--border-strong)',
                          background: 'var(--bg-surface)',
                          color: 'var(--text-secondary)',
                          fontSize: 13,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        {isListening ? t.cancel : t.change}
                      </button>
                    </div>
                  );
                })}
              </div>
              {keyMsg && (
                <p style={{ margin: '8px 0 0', fontSize: 12.5, fontWeight: 600, color: 'var(--error)' }}>
                  {keyMsg}
                </p>
              )}
            </section>

            {/* Appearance */}
            <section
              id="appearance"
              className="ls-card"
              style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 16,
                padding: 24,
                scrollMarginTop: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 18,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>{t.navAppearance}</h2>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: 'var(--text-muted)' }}>
                  {t.appearanceDesc}
                </p>
              </div>

              <div
                role="group"
                aria-label={t.language}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {t.language}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {langOptions.map((opt) => {
                    const active = langMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`ls-btn ${active ? 'ls-btn-primary' : 'ls-btn-surface'}`}
                        aria-pressed={active}
                        onClick={() => updateSettings((prev) => ({ ...prev, lang: opt.id }))}
                        style={{
                          minWidth: 84,
                          height: 42,
                          padding: '0 16px',
                          borderRadius: 10,
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: active ? accent : 'var(--bg-surface)',
                          color: active ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1.5px solid ${active ? accent : 'var(--border-strong)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div
                role="group"
                aria-label={t.theme}
                style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
              >
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  {t.theme}
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {themeOptions.map((opt) => {
                    const active = themeMode === opt.id;
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        className={`ls-btn ${active ? 'ls-btn-primary' : 'ls-btn-surface'}`}
                        aria-pressed={active}
                        onClick={() => updateSettings((prev) => ({ ...prev, theme: opt.id }))}
                        style={{
                          minWidth: 84,
                          height: 42,
                          padding: '0 16px',
                          borderRadius: 10,
                          fontSize: 13.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                          background: active ? accent : 'var(--bg-surface)',
                          color: active ? '#FFFFFF' : 'var(--text-secondary)',
                          border: `1.5px solid ${active ? accent : 'var(--border-strong)'}`,
                        }}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-secondary)' }}>
                  Accent color
                </span>
                <div
                  role="group"
                  aria-label="Accent color"
                  style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}
                >
                  {PRESET_ACCENTS.map((w) => {
                    const active = w.hex.toUpperCase() === accent.toUpperCase();
                    return (
                      <button
                        key={w.hex}
                        type="button"
                        className="ls-btn ls-btn-surface"
                        aria-pressed={active}
                        onClick={() => updateSettings((prev) => ({ ...prev, accent: w.hex }))}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          height: 48,
                          padding: '0 16px 0 10px',
                          borderRadius: 12,
                          background: 'var(--bg-surface)',
                          fontSize: 14,
                          fontWeight: 700,
                          color: 'var(--text-primary)',
                          cursor: 'pointer',
                          border: `2px solid ${active ? w.hex : 'var(--border)'}`,
                        }}
                      >
                        <span
                          style={{
                            width: 28,
                            height: 28,
                            borderRadius: '50%',
                            background: w.hex,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          {active && <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />}
                        </span>
                        {w.name}
                      </button>
                    );
                  })}

                  <label
                    className="ls-btn ls-btn-surface"
                    style={{
                      position: 'relative',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 10,
                      height: 48,
                      padding: '0 16px 0 10px',
                      borderRadius: 12,
                      background: 'var(--bg-surface)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text-primary)',
                      cursor: 'pointer',
                      border: customActive ? `2px solid ${accent}` : '2px dashed var(--border-strong)',
                    }}
                  >
                    <span
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background:
                          settings.customColor ||
                          'conic-gradient(#E11D48, #F59E0B, #16A34A, #0891B2, #4F46E5, #C026D3, #E11D48)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {customActive && <CheckIcon size={14} color="#FFFFFF" strokeWidth={3} />}
                    </span>
                    {settings.customColor
                      ? `Custom ${settings.customColor.toUpperCase()}`
                      : 'Custom'}
                    <input
                      type="color"
                      aria-label="Pick a custom accent color"
                      value={settings.customColor || '#0F766E'}
                      onChange={(e) => {
                        const hex = e.target.value;
                        updateSettings((prev) => ({
                          ...prev,
                          accent: hex,
                          customColor: hex,
                        }));
                      }}
                      style={{
                        position: 'absolute',
                        inset: 0,
                        width: '100%',
                        height: '100%',
                        margin: 0,
                        padding: 0,
                        border: 0,
                        opacity: 0,
                        cursor: 'pointer',
                      }}
                    />
                  </label>
                </div>
              </div>
              {customLowContrast && (
                <p
                  style={{
                    margin: 0,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: 'var(--warm-bg)',
                    color: 'var(--warm-text)',
                    fontSize: 12.5,
                    fontWeight: 600,
                    lineHeight: 1.45,
                  }}
                >
                  {t.lowContrastWarn}
                </p>
              )}
            </section>
          </main>

          <aside
            aria-label={t.livePreview}
            style={{
              flex: '1 1 450px',
              minWidth: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 10,
              position: 'sticky',
              top: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                justifyContent: 'space-between',
                gap: 8,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>{t.livePreview}</h2>
              <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
                {t.livePreviewSub}
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 24,
                borderRadius: 16,
                background: 'var(--preview-bg)',
                border: '1px solid var(--border)',
                overflowX: 'auto',
              }}
            >
              <div style={{ borderRadius: 14, boxShadow: 'var(--shadow-pop)' }}>
                <PopupView
                  enabled={previewEnabled}
                  scope={previewScope}
                  speed={previewSpeed}
                  vis={settings.vis}
                  quickSpeeds={settings.quickSpeeds}
                  smallStep={settings.smallStep}
                  bigStep={settings.bigStep}
                  shortcutsEnabled={settings.shortcutsEnabled ?? true}
                  keys={settings.keys}
                  accent={accent}
                  theme={resolvedTheme}
                  lang={resolvedLang}
                  isIndonesia={isIndonesia}
                  hostname="www.youtube.com"
                  video={{
                    playing: previewPlaying,
                    currentTime: 2887,
                    duration: 4350,
                    playbackRate: previewSpeed,
                  }}
                  isPreview
                  onTogglePower={() => setPreviewEnabled((v) => !v)}
                  onResetAll={() => {
                    setPreviewSpeed(DEFAULT_SPEED);
                    setPreviewScope('tab');
                    setPreviewEnabled(true);
                  }}
                  onChangeScope={setPreviewScope}
                  onChangeSpeed={setPreviewSpeed}
                  onTogglePlay={() => setPreviewPlaying((v) => !v)}
                  onToggleTheme={() =>
                    updateSettings((prev) => ({
                      ...prev,
                      theme: resolvedTheme === 'dark' ? 'light' : 'dark',
                    }))
                  }
                  onToggleLang={() =>
                    updateSettings((prev) => ({
                      ...prev,
                      lang: resolvedLang === 'id' ? 'en' : 'id',
                    }))
                  }
                  onOpenSettings={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer
        style={{
          marginTop: 24,
          background: 'var(--bg-surface)',
          borderTop: '1px solid var(--border)',
        }}
      >
        <div
          style={{
            maxWidth: 1280,
            margin: '0 auto',
            padding: '18px 24px',
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 12,
            fontSize: 12.5,
            fontWeight: 600,
            color: 'var(--text-subtle)',
          }}
        >
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <LightspeedLogo size={22} accent={accent} />
            <span>© 2026 Lightspeed - Vid Speed Ctrl Pro</span>
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 6,
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border)',
                color: 'var(--text-muted)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              v{version}
            </span>
          </div>

          <div style={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center', gap: 18 }}>
            <a
              href={WEBSITE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ls-credit-link"
            >
              Website
            </a>
            <a
              href="https://github.com/ibnumardini/lightspeed"
              target="_blank"
              rel="noopener noreferrer"
              className="ls-credit-link"
            >
              GitHub
            </a>
            <a
              href={PRIVACY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="ls-credit-link"
            >
              Privacy Policy
            </a>
            <a
              href={supportUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="ls-credit-link"
            >
              {isIndonesia ? 'Trakteer' : 'Ko-fi'}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
