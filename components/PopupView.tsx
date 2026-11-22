import React, { useEffect, useState } from 'react';
import {
  CoffeeIcon,
  GlobeIcon,
  LightspeedLogo,
  PauseIcon,
  PlayIcon,
  ResetIcon,
  SlidersIcon,
} from '@/components/Icons';
import { PRIVACY_URL, SUPPORT_URLS, WEBSITE_URL } from '@/utils/color';
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
import type { PopupVisibility, ScopeMode } from '@/utils/storage';

export interface PopupViewProps {
  enabled: boolean;
  scope: ScopeMode;
  speed: number;
  vis: PopupVisibility;
  quickSpeeds: number[];
  smallStep: number;
  bigStep: number;
  accent: string;
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
  onOpenSettings: () => void;
}

const SCOPES: { id: ScopeMode; label: string }[] = [
  { id: 'tab', label: 'This tab' },
  { id: 'site', label: 'This site' },
  { id: 'all', label: 'All tabs' },
];

export function PopupView({
  enabled,
  scope,
  speed,
  vis,
  quickSpeeds,
  smallStep,
  bigStep,
  accent,
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
  onOpenSettings,
}: PopupViewProps) {
  const [draft, setDraft] = useState(() => formatSpeed(speed));

  useEffect(() => {
    setDraft(formatSpeed(speed));
  }, [speed]);

  const tint = `color-mix(in srgb, ${accent} 10%, #ffffff)`;
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

  let hint = `Now ${Math.round(speed * 100)}% · type any speed, then Apply`;
  let hintColor = '#4A6663';
  if (!valid) {
    hint = 'Enter a speed from 0.1× to 16×';
    hintColor = '#B42318';
  } else if (dirty) {
    hint = `Press Apply or Enter to switch to ${formatShortSpeed(parsed)}`;
    hintColor = accent;
  }

  const quickList = quickSpeeds.length > 0 ? quickSpeeds : [1, 2, 3, 4, 5];
  const quickCols = Math.min(5, quickList.length);
  const showSpeedRow = vis.fine || vis.manual;

  const supportUrl = isIndonesia ? SUPPORT_URLS.indonesia : SUPPORT_URLS.global;
  const supportAria = isIndonesia
    ? 'Support Lightspeed on Trakteer'
    : 'Support Lightspeed on Ko-fi';
  const version = browser?.runtime?.getManifest?.().version ?? '1.0.0';

  const stats = video ? calcTimeStats(video.currentTime, video.duration, speed) : null;
  const deltaColor =
    stats?.deltaKind === 'faster'
      ? accent
      : stats?.deltaKind === 'slower'
        ? '#B54708'
        : '#4A6663';

  return (
    <div
      style={
        {
          '--accent': accent,
          width: 400,
          display: 'flex',
          flexDirection: 'column',
          background: '#FFFFFF',
          color: '#0B2B28',
          fontSize: 14,
          border: isPreview ? '1px solid #DCE7E5' : 'none',
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
          padding: '16px 14px',
          background: 'linear-gradient(180deg, #FFFFFF 0%, #F9FCFB 100%)',
          borderBottom: '1px solid #E3ECEA',
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
                color: '#5F7672',
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
              color: accent,
            }}
          >
            Video Speed Controller Pro
          </span>
        </div>

        <button
          type="button"
          className="ls-btn ls-btn-surface"
          onClick={onResetAll}
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 5,
            height: 40,
            padding: '0 10px',
            borderRadius: 10,
            border: `1.5px solid ${accent}`,
            background: '#FFFFFF',
            color: accent,
            fontSize: 12,
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          <ResetIcon />
          Reset all
        </button>

        <button
          type="button"
          className="ls-btn ls-btn-surface"
          aria-pressed={enabled}
          aria-label="Speed control on or off"
          onClick={onTogglePower}
          style={{
            flex: '0 0 auto',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            height: 40,
            padding: '0 6px 0 10px',
            borderRadius: 10,
            border: `1.5px solid ${enabled ? accent : '#9DB0AD'}`,
            background: '#FFFFFF',
            color: enabled ? accent : '#4A6663',
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: '0.04em',
            cursor: 'pointer',
          }}
        >
          {enabled ? 'ON' : 'OFF'}
          <span
            style={{
              width: 20,
              height: 20,
              borderRadius: 6,
              background: enabled ? accent : '#C5D3D1',
            }}
          />
        </button>
      </header>

      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 18,
            padding: 16,
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
                  marginBottom: 8,
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4A6663',
                }}
              >
                Apply to
              </legend>
              <div
                className="ls-scope-track"
                style={{
                  display: 'flex',
                  gap: 4,
                  padding: 4,
                  borderRadius: 12,
                  background: tint,
                }}
              >
                {SCOPES.map((sc) => {
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
                        minHeight: 36,
                        borderRadius: 9,
                        fontSize: 12.5,
                        fontWeight: 700,
                        cursor: 'pointer',
                        background: checked ? '#FFFFFF' : 'transparent',
                        color: checked ? accent : '#2D4744',
                        boxShadow: checked ? '0 1px 3px rgba(11,43,40,0.14)' : 'none',
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
                          border: `1.5px solid ${checked ? accent : '#9DB0AD'}`,
                          background: '#FFFFFF',
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
                            background: accent,
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4A6663',
                }}
              >
                Quick speed
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
                  return (
                    <button
                      key={v}
                      type="button"
                      className={`ls-btn ${active ? 'ls-btn-primary' : 'ls-btn-tint'}`}
                      onClick={() => commitSpeed(v)}
                      aria-pressed={active}
                      style={{
                        height: 44,
                        padding: 0,
                        borderRadius: 10,
                        border: `1.5px solid ${active ? accent : 'transparent'}`,
                        background: active ? accent : tint,
                        color: active ? '#FFFFFF' : accent,
                        fontSize: 15,
                        fontWeight: 800,
                        cursor: 'pointer',
                        fontVariantNumeric: 'tabular-nums',
                      }}
                    >
                      {formatShortSpeed(v)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {showSpeedRow && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  lineHeight: '16px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#4A6663',
                }}
              >
                Playback speed
              </span>
              <div style={{ display: 'flex', gap: 6, alignItems: 'stretch' }}>
                {vis.fine && (
                  <>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint"
                      onClick={() => commitSpeed(speed - bigStep / 100)}
                      aria-label={`Decrease speed by ${bigStep}%`}
                      style={{
                        flex: '0 0 44px',
                        height: 48,
                        padding: 0,
                        borderRadius: 12,
                        border: 0,
                        background: tint,
                        color: accent,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      −{bigStep}%
                    </button>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint"
                      onClick={() => commitSpeed(speed - smallStep / 100)}
                      aria-label={`Decrease speed by ${smallStep}%`}
                      style={{
                        flex: '0 0 44px',
                        height: 48,
                        padding: 0,
                        borderRadius: 12,
                        border: 0,
                        background: tint,
                        color: accent,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      −{smallStep}%
                    </button>
                  </>
                )}

                <div
                  className="ls-input-well"
                  style={{
                    flex: '1 1 0',
                    minWidth: 0,
                    height: 48,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 2,
                    padding: '0 12px',
                    borderRadius: 12,
                    border: `2px solid ${!valid ? '#B42318' : dirty ? accent : '#DCE7E5'}`,
                    background: '#FFFFFF',
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
                        onKeyDown={(e) => {
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
                          color: '#0B2B28',
                          textAlign: 'right',
                          fontVariantNumeric: 'tabular-nums',
                        }}
                      />
                      <span style={{ fontSize: 18, fontWeight: 800, color: '#4A6663' }}>×</span>
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
                      className="ls-btn ls-btn-tint"
                      onClick={() => commitSpeed(speed + smallStep / 100)}
                      aria-label={`Increase speed by ${smallStep}%`}
                      style={{
                        flex: '0 0 44px',
                        height: 48,
                        padding: 0,
                        borderRadius: 12,
                        border: 0,
                        background: tint,
                        color: accent,
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      +{smallStep}%
                    </button>
                    <button
                      type="button"
                      className="ls-btn ls-btn-tint"
                      onClick={() => commitSpeed(speed + bigStep / 100)}
                      aria-label={`Increase speed by ${bigStep}%`}
                      style={{
                        flex: '0 0 44px',
                        height: 48,
                        padding: 0,
                        borderRadius: 12,
                        border: 0,
                        background: tint,
                        color: accent,
                        fontSize: 13,
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
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
                      height: 40,
                      padding: '0 20px',
                      borderRadius: 10,
                      border: 0,
                      fontSize: 13,
                      fontWeight: 700,
                      background: dirty ? accent : '#E3ECEA',
                      color: dirty ? '#FFFFFF' : '#5F7672',
                      cursor: dirty ? 'pointer' : 'not-allowed',
                    }}
                  >
                    Apply
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
                padding: 12,
                borderRadius: 12,
                background: 'linear-gradient(180deg, #F7FBFA 0%, #EEF5F3 100%)',
                border: '1px solid #DCE7E5',
              }}
            >
              <button
                type="button"
                className={`ls-btn ${video ? 'ls-btn-primary' : ''}`}
                onClick={onTogglePlay}
                disabled={!video}
                aria-label={video?.playing ? 'Pause video' : 'Play video'}
                style={{
                  flex: '0 0 44px',
                  width: 44,
                  height: 44,
                  padding: 0,
                  borderRadius: '50%',
                  border: 0,
                  background: video ? accent : '#C5D3D1',
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
                    color: '#4A6663',
                  }}
                >
                  Now playing
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
                  {hostname || (restricted ? 'Browser page' : 'This tab')}
                </span>
                <span
                  style={{
                    fontSize: 12,
                    lineHeight: '16px',
                    color: '#4A6663',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {video
                    ? `${video.playing ? 'Playing' : 'Paused'} · ${formatDuration(video.currentTime)} / ${formatDuration(video.duration)}`
                    : restricted
                      ? 'Not available on browser pages'
                      : 'No video detected on this tab'}
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
                    {stats.leftText}
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
                    {stats.deltaText}
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
                background: '#FFFFFF',
                border: '1px solid #DCE7E5',
                boxShadow: '0 12px 32px rgba(11,43,40,0.16)',
                textAlign: 'center',
              }}
            >
              <span style={{ fontSize: 14, fontWeight: 800 }}>Lightspeed is off</span>
              <span style={{ fontSize: 12.5, lineHeight: 1.45, color: '#4A6663' }}>
                Videos play at their normal speed until you turn it back on.
              </span>
              <button
                type="button"
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
                Turn on
              </button>
            </div>
          </div>
        )}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          padding: '12px 16px',
          borderTop: '1px solid #E3ECEA',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            type="button"
            className="ls-btn ls-btn-surface"
            onClick={onOpenSettings}
            style={{
              flex: '0 0 auto',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              height: 36,
              padding: '0 12px',
              borderRadius: 10,
              border: '1.5px solid #DCE7E5',
              background: '#FFFFFF',
              color: '#0B2B28',
              fontSize: 12.5,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            <SlidersIcon color={accent} />
            <span>Settings</span>
          </button>

          <a
            href={WEBSITE_URL}
            target="_blank"
            rel="noopener noreferrer"
            title="Official website"
            aria-label="Visit official website"
            className="ls-btn ls-btn-surface"
            style={{
              flex: '0 0 36px',
              width: 36,
              height: 36,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 10,
              border: '1.5px solid #DCE7E5',
              background: '#FFFFFF',
              color: '#2D4744',
              textDecoration: 'none',
            }}
          >
            <GlobeIcon size={16} color={accent} />
          </a>
        </div>

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
            padding: '0 12px',
            borderRadius: 10,
            border: '1.5px solid #FDE3C2',
            background: '#FFF4E5',
            color: '#7A3E00',
            textDecoration: 'none',
            fontSize: 12.5,
            fontWeight: 700,
          }}
        >
          <CoffeeIcon size={16} />
          Buy me a coffee
        </a>
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
          padding: '10px 16px',
          borderTop: '1px solid #E3ECEA',
          background: '#F4F8F7',
          fontSize: 11,
          lineHeight: '16px',
          fontWeight: 500,
          color: '#5F7672',
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
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
