import React, { useEffect, useMemo, useState } from 'react';
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
import {
  DEFAULT_SPEED,
  detectIndonesiaRegion,
  formatShortSpeed,
  parseSpeed,
} from '@/utils/speed';
import {
  DEFAULT_QUICK_SPEEDS,
  DEFAULT_SETTINGS,
  type PopupVisibility,
  type ScopeMode,
  type Settings,
  settingsStorage,
  type ShortcutKeys,
} from '@/utils/storage';

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

export default function App() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [activeNav, setActiveNav] = useState<string>('popup');

  // Quick speeds local edit state
  const [editing, setEditing] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [addDraft, setAddDraft] = useState('');
  const [quickErr, setQuickErr] = useState('');

  // Shortcut capture state
  const [listening, setListening] = useState<keyof ShortcutKeys | null>(null);
  const [keyMsg, setKeyMsg] = useState('');

  // Interactive preview state
  const [previewEnabled, setPreviewEnabled] = useState(true);
  const [previewScope, setPreviewScope] = useState<ScopeMode>('tab');
  const [previewSpeed, setPreviewSpeed] = useState<number>(1);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const isIndonesia = useMemo(() => detectIndonesiaRegion(), []);

  useEffect(() => {
    void settingsStorage.getValue().then(setSettings);
    const unwatch = settingsStorage.watch((next) => {
      if (next) setSettings(next);
    });
    return () => unwatch();
  }, []);

  const updateSettings = (updater: (prev: Settings) => Settings) => {
    setSettings((prev) => {
      const next = updater(prev);
      void settingsStorage.setValue(next);
      return next;
    });
  };

  const accent = settings.accent;
  const tint = `color-mix(in srgb, ${accent} 10%, #ffffff)`;
  const previewBg = `color-mix(in srgb, ${accent} 7%, #ffffff)`;
  const supportUrl = isIndonesia ? SUPPORT_URLS.indonesia : SUPPORT_URLS.global;
  const supportLabel = isIndonesia
    ? 'Buy me a coffee on Trakteer'
    : 'Buy me a coffee on Ko-fi';
  const version = browser?.runtime?.getManifest?.().version ?? '1.0.0';

  const quickFull = settings.quickSpeeds.length >= 10;

  const addQuick = () => {
    const n = parseSpeed(addDraft);
    if (n === null) {
      setQuickErr('Enter a speed from 0.1× to 16×.');
      return;
    }
    if (settings.quickSpeeds.includes(n)) {
      setQuickErr(`${formatShortSpeed(n)} is already in the list.`);
      return;
    }
    if (quickFull) {
      setQuickErr('You can have up to 10 quick speeds.');
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
      setQuickErr('Enter a speed from 0.1× to 16×.');
      return;
    }
    if (n !== editing && settings.quickSpeeds.includes(n)) {
      setQuickErr(`${formatShortSpeed(n)} is already in the list.`);
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
    { id: 'up', action: `Increase speed by ${settings.smallStep}%` },
    { id: 'down', action: `Decrease speed by ${settings.smallStep}%` },
    { id: 'reset', action: 'Reset to 1×' },
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
      setKeyMsg(`${key} is already used by another shortcut.`);
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

  return (
    <div
      style={
        {
          '--accent': accent,
          minHeight: '100vh',
          background: '#F4F8F7',
          color: '#0B2B28',
          fontSize: 14,
        } as React.CSSProperties
      }
    >
      <header style={{ background: '#FFFFFF', borderBottom: '1px solid #DCE7E5' }}>
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
              <span style={{ fontWeight: 600, letterSpacing: 0, color: '#4A6663' }}>
                Settings
              </span>
            </h1>
            <span style={{ fontSize: 12, fontWeight: 700, color: accent }}>
              Video Speed Controller Pro{' '}
              <span style={{ fontWeight: 600, color: '#5F7672', fontVariantNumeric: 'tabular-nums' }}>
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
              color: '#4A6663',
            }}
          >
            <CheckIcon size={16} color={accent} strokeWidth={2.4} />
            Changes save automatically
          </span>
          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 40,
              padding: '0 14px',
              borderRadius: 10,
              border: '1.5px solid #DCE7E5',
              background: '#FFFFFF',
              color: '#0B2B28',
              textDecoration: 'none',
              fontSize: 13,
              fontWeight: 700,
            }}
          >
            <GlobeIcon size={16} color={accent} />
            Website
          </a>
          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 40,
              padding: '0 14px',
              borderRadius: 999,
              background: '#FFF4E5',
              color: '#7A3E00',
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
          {NAV_ITEMS.map((item) => {
            const isActive = activeNav === item.id;
            return (
              <a
                key={item.id}
                href={`#${item.id}`}
                onClick={() => setActiveNav(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minHeight: 44,
                  padding: '0 14px',
                  borderRadius: 10,
                  background: isActive ? tint : 'transparent',
                  color: isActive ? accent : '#2D4744',
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
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE7E5',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Popup layout</h2>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: '#4A6663',
                }}
              >
                Choose what shows in the popup. The header with the on/off switch and Reset all
                always stays.
              </p>
              {VISIBILITY_ROWS.map((r) => {
                const on = settings.vis[r.key];
                return (
                  <div
                    key={r.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 16,
                      padding: '14px 0',
                      borderTop: '1px solid #EDF3F2',
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
                      <span style={{ fontSize: 13, lineHeight: 1.45, color: '#4A6663' }}>
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
                        background: on ? accent : '#B7C6C3',
                      }}
                    >
                      <span
                        style={{
                          width: 26,
                          height: 26,
                          borderRadius: '50%',
                          background: '#FFFFFF',
                          boxShadow: '0 1px 3px rgba(11,43,40,0.25)',
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
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE7E5',
                borderRadius: 16,
                padding: 24,
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
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Quick speeds</h2>
                  <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#4A6663' }}>
                    The one-tap buttons in the popup, shown from slowest to fastest. Up to 10, from
                    0.1× to 16×.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={resetQuick}
                  style={{
                    height: 40,
                    padding: '0 14px',
                    borderRadius: 10,
                    border: '1.5px solid #C5D3D1',
                    background: '#FFFFFF',
                    color: '#2D4744',
                    fontSize: 13,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Reset to default
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
                        borderTop: '1px solid #EDF3F2',
                      }}
                    >
                      <span
                        style={{
                          flex: '0 0 24px',
                          fontSize: 12.5,
                          fontWeight: 700,
                          color: '#4A6663',
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
                                background: tint,
                                color: accent,
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
                              border: '1.5px solid #C5D3D1',
                              background: '#FFFFFF',
                              color: '#2D4744',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            <PencilIcon />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => removeQuick(v)}
                            disabled={lastOne}
                            aria-label={`Delete ${label}`}
                            style={{
                              width: 40,
                              height: 40,
                              padding: 0,
                              borderRadius: 10,
                              border: '1.5px solid #F3C7C3',
                              background: '#FFFFFF',
                              color: '#B42318',
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
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                width: 140,
                                height: 40,
                                padding: '0 12px',
                                borderRadius: 10,
                                border: `2px solid ${accent}`,
                                background: '#FFFFFF',
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
                                onKeyDown={(e) => {
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
                                  color: '#0B2B28',
                                }}
                              />
                              <span style={{ fontWeight: 800, color: '#4A6663' }}>×</span>
                            </span>
                          </span>
                          <button
                            type="button"
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
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={cancelEdit}
                            style={{
                              height: 40,
                              padding: '0 14px',
                              borderRadius: 10,
                              border: '1.5px solid #C5D3D1',
                              background: '#FFFFFF',
                              color: '#2D4744',
                              fontSize: 13,
                              fontWeight: 700,
                              cursor: 'pointer',
                            }}
                          >
                            Cancel
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
                  borderTop: '1px solid #EDF3F2',
                }}
              >
                <label
                  htmlFor="ls-add-quick"
                  style={{ fontSize: 13, fontWeight: 700, color: '#2D4744' }}
                >
                  Add a speed
                </label>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    width: 140,
                    height: 44,
                    padding: '0 12px',
                    borderRadius: 10,
                    border: `1.5px solid ${quickErr && editing === null ? '#B42318' : '#C5D3D1'}`,
                    background: '#FFFFFF',
                  }}
                >
                  <input
                    id="ls-add-quick"
                    type="text"
                    inputMode="decimal"
                    placeholder="e.g. 1.5"
                    value={addDraft}
                    onChange={(e) => {
                      setAddDraft(e.target.value);
                      setQuickErr('');
                    }}
                    onKeyDown={(e) => {
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
                      color: '#0B2B28',
                    }}
                  />
                  <span style={{ fontWeight: 800, color: '#4A6663' }}>×</span>
                </span>
                <button
                  type="button"
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
                    background: quickFull ? '#E3ECEA' : accent,
                    color: quickFull ? '#5F7672' : '#FFFFFF',
                    cursor: quickFull ? 'not-allowed' : 'pointer',
                  }}
                >
                  <PlusIcon />
                  Add
                </button>
              </div>
              <p
                style={{
                  margin: '8px 0 0',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: quickErr ? '#B42318' : '#4A6663',
                }}
              >
                {quickErr || `${settings.quickSpeeds.length} of 10 · the popup shows up to 5 per row`}
              </p>
            </section>

            {/* Fine-tune steps */}
            <section
              id="steps"
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE7E5',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Fine-tune steps</h2>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#4A6663' }}>
                  How much the −/+ buttons change the speed. 1% of 1× is 0.01×.
                </p>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
                <div
                  role="group"
                  aria-label="Small step"
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#2D4744' }}>
                    Small step
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {SMALL_STEPS.map((val) => {
                      const active = settings.smallStep === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          aria-pressed={active}
                          onClick={() => updateSettings((prev) => ({ ...prev, smallStep: val }))}
                          style={{
                            minWidth: 64,
                            height: 44,
                            padding: '0 14px',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: active ? accent : '#FFFFFF',
                            color: active ? '#FFFFFF' : '#2D4744',
                            border: `1.5px solid ${active ? accent : '#C5D3D1'}`,
                          }}
                        >
                          {val}%
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div
                  role="group"
                  aria-label="Big step"
                  style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                >
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: '#2D4744' }}>
                    Big step
                  </span>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {BIG_STEPS.map((val) => {
                      const active = settings.bigStep === val;
                      return (
                        <button
                          key={val}
                          type="button"
                          aria-pressed={active}
                          onClick={() => updateSettings((prev) => ({ ...prev, bigStep: val }))}
                          style={{
                            minWidth: 64,
                            height: 44,
                            padding: '0 14px',
                            borderRadius: 10,
                            fontSize: 14,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: active ? accent : '#FFFFFF',
                            color: active ? '#FFFFFF' : '#2D4744',
                            border: `1.5px solid ${active ? accent : '#C5D3D1'}`,
                          }}
                        >
                          {val}%
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>

            {/* Keyboard shortcuts */}
            <section
              id="shortcuts"
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE7E5',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Keyboard shortcuts</h2>
              <p
                style={{
                  margin: '0 0 12px',
                  fontSize: 13.5,
                  lineHeight: 1.5,
                  color: '#4A6663',
                }}
              >
                Work on any page with a video, as long as you are not typing in a text field. Click
                Change, then press a letter or number.
              </p>
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
                      borderTop: '1px solid #EDF3F2',
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
                        border: `1.5px solid ${isListening ? accent : '#C5D3D1'}`,
                        borderBottomWidth: 3,
                        background: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: 800,
                        color: isListening ? accent : '#0B2B28',
                      }}
                    >
                      {isListening ? 'Press a key…' : settings.keys[k.id]}
                    </kbd>
                    <button
                      type="button"
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
                        border: '1.5px solid #C5D3D1',
                        background: '#FFFFFF',
                        color: '#2D4744',
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isListening ? 'Cancel' : 'Change'}
                    </button>
                  </div>
                );
              })}
              {keyMsg && (
                <p style={{ margin: '8px 0 0', fontSize: 12.5, fontWeight: 600, color: '#B42318' }}>
                  {keyMsg}
                </p>
              )}
            </section>

            {/* Appearance */}
            <section
              id="appearance"
              style={{
                background: '#FFFFFF',
                border: '1px solid #DCE7E5',
                borderRadius: 16,
                padding: 24,
                display: 'flex',
                flexDirection: 'column',
                gap: 14,
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800 }}>Appearance</h2>
                <p style={{ margin: 0, fontSize: 13.5, lineHeight: 1.5, color: '#4A6663' }}>
                  Accent color for buttons and highlights.
                </p>
              </div>
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
                      aria-pressed={active}
                      onClick={() => updateSettings((prev) => ({ ...prev, accent: w.hex }))}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        height: 48,
                        padding: '0 16px 0 10px',
                        borderRadius: 12,
                        background: '#FFFFFF',
                        fontSize: 14,
                        fontWeight: 700,
                        color: '#0B2B28',
                        cursor: 'pointer',
                        border: `2px solid ${active ? w.hex : '#DCE7E5'}`,
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
                  style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    height: 48,
                    padding: '0 16px 0 10px',
                    borderRadius: 12,
                    background: '#FFFFFF',
                    fontSize: 14,
                    fontWeight: 700,
                    color: '#0B2B28',
                    cursor: 'pointer',
                    border: customActive ? `2px solid ${accent}` : '2px dashed #C5D3D1',
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
              {customLowContrast && (
                <p
                  style={{
                    margin: 0,
                    padding: '10px 12px',
                    borderRadius: 10,
                    background: '#FFF4E5',
                    color: '#7A3E00',
                    fontSize: 12.5,
                    fontWeight: 600,
                    lineHeight: 1.45,
                  }}
                >
                  This color is light, so white text on buttons may be hard to read. Try a darker
                  shade.
                </p>
              )}
            </section>
          </main>

          <aside
            aria-label="Live preview"
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
              <h2 style={{ margin: 0, fontSize: 15, fontWeight: 800 }}>Live preview</h2>
              <span style={{ fontSize: 12.5, color: '#4A6663' }}>
                Updates as you change settings
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
                padding: 24,
                borderRadius: 16,
                background: previewBg,
                border: '1px solid #DCE7E5',
                overflowX: 'auto',
              }}
            >
              <div style={{ borderRadius: 14, boxShadow: '0 14px 36px rgba(11,43,40,0.16)' }}>
                <PopupView
                  enabled={previewEnabled}
                  scope={previewScope}
                  speed={previewSpeed}
                  vis={settings.vis}
                  quickSpeeds={settings.quickSpeeds}
                  smallStep={settings.smallStep}
                  bigStep={settings.bigStep}
                  accent={accent}
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
                  onOpenSettings={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                />
              </div>
            </div>
          </aside>
        </div>
      </div>

      <footer
        style={{
          maxWidth: 1280,
          margin: '0 auto',
          padding: '8px 24px 32px',
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          gap: 12,
          fontSize: 12.5,
          fontWeight: 600,
          color: '#5F7672',
        }}
      >
        <span>© 2026 Lightspeed - Video Speed Controller Pro</span>
        <a
          href={PRIVACY_URL}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: '#2D4744', fontWeight: 700, textUnderlineOffset: 2 }}
        >
          Privacy Policy
        </a>
      </footer>
    </div>
  );
}
