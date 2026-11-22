import type { ScopeMode } from './storage';

export interface VideoInfo {
  playing: boolean;
  currentTime: number;
  duration: number;
  playbackRate: number;
}

export interface TabStateResponse {
  speed: number;
  enabled: boolean;
  scope: ScopeMode;
  hostname: string;
  video: VideoInfo | null;
  restricted: boolean;
}

export type RuntimeMessage =
  | { type: 'GET_TAB_STATE' }
  | { type: 'SET_SPEED'; speed: number; scope?: ScopeMode }
  | { type: 'SET_SCOPE'; scope: ScopeMode }
  | { type: 'TOGGLE_POWER'; enabled: boolean }
  | { type: 'RESET_ALL' }
  | { type: 'TOGGLE_PLAY' }
  | { type: 'GET_MY_SPEED' }
  | { type: 'SHORTCUT_DELTA'; delta: number }
  | { type: 'SHORTCUT_RESET' }
  | { type: 'APPLY_SPEED'; speed: number; enabled: boolean }
  | { type: 'QUERY_VIDEO' }
  | { type: 'VIDEO_TOGGLE_PLAY' };
