import React, { useEffect, useRef, useState } from 'react';
import {
  CoffeeIcon,
  GlobeIcon,
  LightspeedLogo,
  MoonIcon,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SlidersIcon,
  SunIcon,
} from '@/components/Icons';
import { PRIVACY_URL, SUPPORT_URLS, WEBSITE_URL } from '@/utils/color';
import { getStrings, type ResolvedLang } from '@/utils/i18n';
import type { VideoInfo } from '@/utils/messaging';
import {
  calcTimeStats,
  clampSpeed,
  formatDuration,
  formatShortSpeed,
  formatSpeed,
  nearSpeed,
  parseSpeed,
} from '@/utils/speed';
import type { PopupVisibility, ScopeMode, ShortcutKeys } from '@/utils/storage';
import type { ResolvedTheme } from '@/utils/theme';

export interface PopupViewProps {
  enabled: boolean;
  scope: ScopeMode;
  speed: number;
  vis: PopupVisibility;
  quickSpeeds: number[];
  smallStep: number;
  bigStep: number;
  keys?: ShortcutKeys;
  accent: string;
  theme?: ResolvedTheme;
  lang?: ResolvedLang;
  isIndonesia: boolean;
  hostname: string;
  video: VideoInfo | null;
  restricted?: boolean;
  isPreview?: boolean;
  onTogglePower: () => void;
  onResetAll: () => void;
  onChangeScope: (scope: ScopeMode) => void;
  onChangeSpeed: (speed: number) => void;
  onTogglePlay: () => void;
  onToggleTheme: () => void;
  onToggleLang: () => void;
  onOpenSettings: () => void;
}

export function PopupView({
  enabled,
  scope,
  speed,
  vis,
  quickSpeeds,
  smallStep,
  bigStep,
  keys = { up: 'A', down: 'D', reset: 'S' },
  accent,
  theme = 'light',
  lang = 'en',
  isIndonesia,
  hostname,
  video,
  restricted = false,
  isPreview = false,
  onTogglePower,
  onResetAll,
  onChangeScope,
  onChangeSpeed,
  onTogglePlay,
  onToggleTheme,
  onToggleLang,
  onOpenSettings,
}: PopupViewProps) {
  const [draft, setDraft] = useState(() => formatSpeed(speed));
  const justFocusedRef = useRef(false);

  useEffect(() => {
    setDraft(formatSpeed(speed));
  }, [speed]);

  const t = getStrings(lang);
  const scopes: { id: ScopeMode; label: string }[] = [
    { id: 'tab', label: t.scopeTab },
    { id: 'site', label: t.scopeSite },
    { id: 'all', label: t.scopeAll },
  ];

  const parsed = parseSpeed(draft);
  const valid = parsed !== null;
  const dirty = valid && !nearSpeed(parsed, speed);

  const commitSpeed = (next: number) => {
    const clamped = clampSpeed(next);
    setDraft(formatSpeed(clamped));
    onChangeSpeed(clamped);
  };

  const applyDraft = () => {
    if (parsed !== null) {
      commitSpeed(parsed);
    }
  };

  let hint = t.hintNormal(Math.round(speed * 100));
  let hintColor = 'var(--text-muted)';
  if (!valid) {
    hint = t.hintInvalid;
    hintColor = 'var(--error)';
  } else if (dirty) {
    hint = t.hintDirty(formatShortSpeed(parsed));
    hintColor = 'var(--accent-fg)';
  }

  const quickList = quickSpeeds.length > 0 ? quickSpeeds : [1, 2, 3, 4, 5];
  const quickCols = Math.min(5, quickList.length);
  const showSpeedRow = vis.fine || vis.manual;

  const supportUrl = isIndonesia ? SUPPORT_URLS.indonesia : SUPPORT_URLS.global;
  const supportAria = t.supportAria(isIndonesia);
  const version = browser?.runtime?.getManifest?.().version ?? '1.0.0';

  const stats = video ? calcTimeStats(video.currentTime, video.duration, speed) : null;
  const leftLabel = stats ? (stats.isLive ? t.live : t.timeLeft(stats.leftDuration)) : '';
  const deltaLabel = stats
    ? stats.deltaKind === 'faster'
      ? t.savesTime(stats.deltaDuration)
      : stats.deltaKind === 'slower'
        ? t.longerTime(stats.deltaDuration)
        : t.normalSpeed
    : '';
  const deltaColor =
    stats?.deltaKind === 'faster'
      ? 'var(--accent-fg)'
      : stats?.deltaKind === 'slower'
        ? 'var(--warn)'
        : 'var(--text-muted)';

  return (
    <div
      data-theme={theme}
      style={
        {
          '--accent': accent,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-surface)',
          color: 'var(--text-primary)',
          fontSize: 14,
          border: isPreview ? '1px solid var(--border)' : 'none',
          borderRadius: isPreview ? 14 : 0,
          overflow: 'hidden',
        } as React.CSSProperties
      }
    >
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '14px 16px',
          background: 'linear-gradient(180deg, var(--bg-surface) 0%, var(--bg-header-end) 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}
      >
        <LightspeedLogo size={34} accent={accent} />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
            flexGrow: 1,
            minWidth: 0,
          }}
        >
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'baseline',
              gap: 5,
              fontSize: 15,
              fontWeight: 800,
              letterSpacing: '0.05em',
              lineHeight: 1.15,
              whiteSpace: 'nowrap',
            }}
          >
            LIGHTSPEED
            <span
              style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 0,
                color: 'var(--text-subtle)',
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              v{version}
            </span>
          </span>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              lineHeight: '14px',
              whiteSpace: 'nowrap',
              color: 'var(--accent-fg)',
            }}
          >
            Video Speed Controller Pro
          </span>
        </div>

        <button
          type="button"
          className="ls-btn ls-btn-surface ls-reset-btn"
          onClick={onResetAll}
          title={t.resetAllTitle}
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            height: 36,
            padding: '0 10px',
            borderRadius: 10,
            border: '1.5px solid var(--border)',
            background: 'var(--bg-surface)',
            color: 'var(--text-secondary)',
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ResetIcon />
          {t.resetAll}
        </button>

        <button
          type="button"
          role="switch"
          aria-checked={enabled}
          aria-label={t.powerAria}
          title={enabled ? t.turnOffTitle : t.turnOnTitle}
          onClick={onTogglePower}
          style={{
            position: 'relative',
            flex: '0 0 66px',
            width: 66,
            height: 36,
            padding: 4,
            borderRadius: 10,
            border: 0,
            display: 'flex',
            alignItems: 'center',
            background: enabled ? accent : 'var(--switch-off)',
            boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.16)',
            transition: 'background 0.18s ease',
            cursor: 'pointer',
          }}
        >
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              left: 10,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: '#FFFFFF',
              opacity: enabled ? 1 : 0,
              transition: 'opacity 0.15s ease',
              pointerEvents: 'none',
            }}
          >
            ON
          </span>
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              right: 9,
              fontSize: 11,
              fontWeight: 800,
              letterSpacing: '0.04em',
              color: 'var(--text-primary)',
              opacity: enabled ? 0 : 0.8,
              transition: 'opacity 0.15s ease',
              pointerEvents: 'none',
            }}
          >
            OFF
          </span>
          <span
            style={{
              position: 'relative',
              zIndex: 1,
              width: 24,
              height: 28,
              borderRadius: 6,
              background: '#FFFFFF',
              boxShadow: '0 1px 3px rgba(0,0,0,0.28)',
              transition: 'transform 0.18s cubic-bezier(0.22, 1, 0.36, 1)',
              transform: enabled ? 'translateX(34px)' : 'translateX(0)',
            }}
          />
        </button>
      </header>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            padding: '14px 16px 16px',
            ...(enabled
              ? {}
              : { opacity: 0.4, pointerEvents: 'none', filter: 'grayscale(1)' }),
          }}
        >
          {vis.scope && (
            <fieldset style={{ margin: 0, padding: 0, border: 0, minWidth: 0 }}>
              <legend
                style={{
                  padding: 0,
                  marginBottom: 6,
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {t.applyTo}
              </legend>
              <div
                className="ls-scope-track"
                style={{
                  display: 'flex',
                  gap: 3,
                  padding: 3,
                  borderRadius: 11,
                  background: 'var(--accent-tint)',
                }}
              >
                {scopes.map((sc) => {
                  const checked = scope === sc.id;
                  return (
                    <label
                      key={sc.id}
                      className="ls-scope-option"
                      style={{
                        position: 'relative',
                        flex: '1 1 0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 6,
                        minHeight: 34,
                        borderRadius: 8,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: checked ? 'var(--bg-surface)' : 'transparent',
                        color: checked ? 'var(--accent-fg)' : 'var(--text-secondary)',
                        boxShadow: checked ? '0 1px 3px rgba(0,0,0,0.16)' : 'none',
                        transition: 'background 0.15s ease, color 0.15s ease',
                      }}
                    >
                      <input
                        type="radio"
                        className="ls-sr-only"
                        name={isPreview ? 'ls-scope-preview' : 'ls-scope'}
                        value={sc.id}
                        checked={checked}
                        onChange={() => onChangeScope(sc.id)}
                      />
                      <span
                        aria-hidden="true"
                        style={{
                          width: 14,
                          height: 14,
                          flex: '0 0 14px',
                          borderRadius: '50%',
                          border: `1.5px solid ${checked ? 'var(--accent-fg)' : 'var(--power-off-border)'}`,
                          background: 'var(--bg-surface)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'border-color 0.15s ease',
                        }}
                      >
                        <span
                          style={{
                            width: 7,
                            height: 7,
                            borderRadius: '50%',
                            background: 'var(--accent-fg)',
                            transform: checked ? 'scale(1)' : 'scale(0)',
                            transition: 'transform 0.12s ease',
                          }}
                        />
                      </span>
                      {sc.label}
                    </label>
                  );
                })}
              </div>
            </fieldset>
          )}

          {vis.quick && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {t.quickSpeed}
              </span>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: `repeat(${quickCols}, minmax(0, 1fr))`,
                  gap: 6,
                }}
              >
                {quickList.map((v) => {
                  const active = nearSpeed(speed, v);
                  const isReset = nearSpeed(v, 1);
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`ls-btn ${active ? 'ls-btn-primary' : 'ls-btn-tint'}${isReset ? ' ls-has-key' : ''}`}
                      onClick={() => commitSpeed(v)}
                      aria-pressed={active}
                      title={isReset ? t.shortcutTip(keys.reset) : undefined}
                      style={{
                        height: 40,
                        padding: 0,
                        borderRadius: 10,
                        border: `1.5px solid ${active ? accent : 'transparent'}`,
                        background: active ? accent : 'var(--accent-tint)',
                        color: active ? '#FFFFFF' : 'var(--accent-fg)',
                        fontSize: 14.5,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {isReset && (
                        <kbd className="ls-key-hint" aria-hidden="true">
                          {keys.reset}
                        </kbd>
                      )}
                      {formatShortSpeed(v)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showSpeedRow && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span
                style={{
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: 'var(--text-muted)',
                }}
              >
                {t.playbackSpeed}
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                {vis.fine && (
                  <>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint"
                      onClick={() => commitSpeed(speed - bigStep / 100)}
                      aria-label={t.decreaseBy(bigStep)}
                      style={{
                        flex: '0 0 44px',
                        height: 44,
                        padding: 0,
                        borderRadius: 11,
                        border: 0,
                        background: 'var(--accent-tint)',
                        color: 'var(--accent-fg)',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      −{bigStep}%
                    </button>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint ls-has-key"
                      onClick={() => commitSpeed(speed - smallStep / 100)}
                      aria-label={t.decreaseBy(smallStep, keys.down)}
                      title={t.shortcutTip(keys.down)}
                      style={{
                        flex: '0 0 44px',
                        height: 44,
                        padding: 0,
                        borderRadius: 11,
                        border: 0,
                        background: 'var(--accent-tint)',
                        color: 'var(--accent-fg)',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <kbd className="ls-key-hint" aria-hidden="true">
                        {keys.down}
                      </kbd>
                      −{smallStep}%
                    </button>
                  </>
                )}

                <div
                  className="ls-input-well"
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    height: 44,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '0 12px',
                    borderRadius: 11,
                    border: `2px solid ${!valid ? 'var(--error)' : dirty ? 'var(--accent-fg)' : 'var(--border)'}`,
                    background: 'var(--bg-surface)',
                  }}
                >
                  {vis.manual ? (
                    <>
                      <input
                        type="text"
                        inputMode="decimal"
                        aria-label="Playback speed"
                        value={draft}
                        onChange={(e) => setDraft(e.target.value)}
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
                            applyDraft();
                          } else if (e.key === 'Escape') {
                            setDraft(formatSpeed(speed));
                          }
                        }}
                        style={{
                          width: '100%',
                          minWidth: 0,
                          border: 0,
                          outline: 'none',
                          background: 'transparent',
                          padding: 0,
                          fontSize: 22,
                          fontWeight: 800,
                          color: 'var(--text-primary)',
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      />
                      <span style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-muted)' }}>
                        ×
                      </span>
                    </>
                  ) : (
                    <span
                      style={{
                        fontSize: 22,
                        fontWeight: 800,
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatSpeed(speed)}×
                    </span>
                  )}
                </div>

                {vis.fine && (
                  <>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint ls-has-key"
                      onClick={() => commitSpeed(speed + smallStep / 100)}
                      aria-label={t.increaseBy(smallStep, keys.up)}
                      title={t.shortcutTip(keys.up)}
                      style={{
                        flex: '0 0 44px',
                        height: 44,
                        padding: 0,
                        borderRadius: 11,
                        border: 0,
                        background: 'var(--accent-tint)',
                        color: 'var(--accent-fg)',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      <kbd className="ls-key-hint" aria-hidden="true">
                        {keys.up}
                      </kbd>
                      +{smallStep}%
                    </button>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint"
                      onClick={() => commitSpeed(speed + bigStep / 100)}
                      aria-label={t.increaseBy(bigStep)}
                      style={{
                        flex: '0 0 44px',
                        height: 44,
                        padding: 0,
                        borderRadius: 11,
                        border: 0,
                        background: 'var(--accent-tint)',
                        color: 'var(--accent-fg)',
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{bigStep}%
                    </button>
                  </>
                )}
              </div>

              {vis.manual && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 2 }}>
                  <p
                    style={{
                      margin: 0,
                      flex: '1 1 0',
                      minWidth: 0,
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: 1.4,
                      color: hintColor,
                    }}
                  >
                    {hint}
                  </p>
                  <button
                    type="button"
                    className={`ls-btn ${dirty ? 'ls-btn-primary' : ''}`}
                    onClick={applyDraft}
                    disabled={!dirty}
                    style={{
                      flex: '0 0 auto',
                      height: 36,
                      padding: '0 18px',
                      borderRadius: 10,
                      border: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      background: dirty ? accent : 'var(--btn-disabled-bg)',
                      color: dirty ? '#FFFFFF' : 'var(--btn-disabled-text)',
                      cursor: dirty ? 'pointer' : 'not-allowed',
                    }}
                  >
                    {t.apply}
                  </button>
                </div>
              )}
            </div>
          )}

          {vis.now && (
            <div
              className="ls-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 12px',
                borderRadius: 12,
                background:
                  'linear-gradient(180deg, var(--bg-now-start) 0%, var(--bg-now-end) 100%)',
                border: '1px solid var(--border)',
              }}
            >
              <button
                type="button"
                className={`ls-btn ${video ? 'ls-btn-primary' : ''}`}
                onClick={onTogglePlay}
                disabled={!video}
                aria-label={video?.playing ? t.pauseVideo : t.playVideo}
                style={{
                  flex: '0 0 40px',
                  width: 40,
                  height: 40,
                  padding: 0,
                  borderRadius: '50%',
                  border: 0,
                  background: video ? accent : 'var(--knob-off)',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: video ? 'pointer' : 'not-allowed',
                }}
              >
                {video?.playing ? <PauseIcon /> : <PlayIcon />}
              </button>

              <div
                style={{
                  flex: '1 1 0',
                  minWidth: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                }}
              >
                <span
                  style={{
                    fontSize: 10.5,
                    lineHeight: '14px',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                    color: 'var(--text-muted)',
                  }}
                >
                  {t.nowPlaying}
                </span>
                <span
                  style={{
                    fontSize: 13.5,
                    lineHeight: '18px',
                    fontWeight: 700,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {hostname || (restricted ? t.browserPage : t.thisTab)}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: '16px',
                    color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {video
                    ? `${video.playing ? t.playing : t.paused} · ${formatDuration(video.currentTime)} / ${formatDuration(video.duration)}`
                    : restricted
                      ? t.notAvailableBrowser
                      : t.noVideoDetected}
                </span>
              </div>

              {stats && (
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    gap: 2,
                    textAlign: 'right',
                  }}
                >
                  <span
                    style={{
                      fontSize: 15,
                      lineHeight: '20px',
                      fontWeight: 800,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {leftLabel}
                  </span>
                  <span
                    style={{
                      fontSize: 11.5,
                      lineHeight: '16px',
                      fontWeight: 700,
                      color: deltaColor,
                      fontVariantNumeric: 'tabular-nums',
                    }}
                  >
                    {deltaLabel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {!enabled && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: 24,
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 12,
                maxWidth: 260,
                padding: 20,
                borderRadius: 14,
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-pop)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800 }}>{t.offTitle}</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.45, color: 'var(--text-muted)' }}>
                {t.offDesc}
              </span>
              <button
                type="button"
                className="ls-btn ls-btn-primary"
                onClick={onTogglePower}
                style={{
                  height: 40,
                  padding: '0 18px',
                  borderRadius: 10,
                  border: 0,
                  background: accent,
                  color: '#FFFFFF',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                {t.turnOn}
              </button>
            </div>
          </div>
        )}
      </div>

      <footer
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: 10,
          padding: '12px 16px',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}
        >
          <button
            type="button"
            className="ls-btn ls-btn-surface"
            onClick={onOpenSettings}
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 11px',
              borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-primary)',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <SlidersIcon color="var(--accent-fg)" />
            <span>{t.settings}</span>
          </button>

          <div
            style={{
              display: 'inline-flex',
              alignItems: 'stretch',
              height: 36,
              borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-surface)',
              boxShadow: 'var(--shadow-btn)',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={onToggleTheme}
              title={theme === 'dark' ? t.switchToLight : t.switchToDark}
              aria-label={theme === 'dark' ? t.switchToLight : t.switchToDark}
              className="ls-btn"
              style={{
                width: 34,
                height: '100%',
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--accent-fg)',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {theme === 'dark' ? (
                <SunIcon size={15} color="var(--accent-fg)" />
              ) : (
                <MoonIcon size={15} color="var(--accent-fg)" />
              )}
            </button>
            <span
              aria-hidden="true"
              style={{
                width: 1,
                background: 'var(--border)',
                alignSelf: 'stretch',
                margin: '6px 0',
              }}
            />
            <button
              type="button"
              onClick={onToggleLang}
              title={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              aria-label={lang === 'id' ? 'Switch to English' : 'Ganti ke Bahasa Indonesia'}
              className="ls-btn"
              style={{
                width: 34,
                height: '100%',
                padding: 0,
                border: 0,
                background: 'transparent',
                color: 'var(--accent-fg)',
                fontSize: 11,
                fontWeight: 800,
                letterSpacing: '0.03em',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              {lang.toUpperCase()}
            </button>
          </div>

          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title={t.officialWebsite}
            aria-label={t.visitWebsite}
            className="ls-btn ls-btn-surface"
            style={{
              flex: '0 0 34px',
              width: 34,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              border: '1.5px solid var(--border)',
              background: 'var(--bg-surface)',
              color: 'var(--text-secondary)',
              textDecoration: 'none',
            }}
          >
            <GlobeIcon size={16} color="var(--accent-fg)" />
          </a>

          <a
            href={supportUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={supportAria}
            className="ls-btn ls-btn-warm"
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              height: 36,
              padding: '0 11px',
              borderRadius: 10,
              border: '1.5px solid var(--warm-border)',
              background: 'var(--warm-bg)',
              color: 'var(--warm-text)',
              textDecoration: 'none',
              fontSize: 12.5,
              fontWeight: 700,
            }}
          >
            <CoffeeIcon size={16} />
            {t.buyCoffee}
          </a>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: 11,
            lineHeight: '16px',
            fontWeight: 500,
            color: 'var(--text-subtle)',
          }}
        >
          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            © 2026 Lightspeed - Video Speed Controller Pro
          </span>
          <a
            href={PRIVACY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="ls-credit-link"
            style={{ flex: '0 0 auto', whiteSpace: 'nowrap' }}
          >
            {t.privacyPolicy}
          </a>
        </div>
      </footer>
    </div>
  );
}
