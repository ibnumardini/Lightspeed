import type { RuntimeMessage, VideoInfo } from '@/utils/messaging';
import { clampSpeed, DEFAULT_SPEED, nearSpeed } from '@/utils/speed';
import { DEFAULT_SETTINGS, type Settings, settingsStorage } from '@/utils/storage';

function collectVideos(root: Document | ShadowRoot = document): HTMLVideoElement[] {
  const videos: HTMLVideoElement[] = [];
  const stack: (Document | ShadowRoot | Element)[] = [root];

  while (stack.length > 0) {
    const node = stack.pop();
    if (!node) continue;
    if (node instanceof HTMLVideoElement) {
      videos.push(node);
    }
    const children = node.children;
    if (children) {
      for (let i = 0; i < children.length; i++) {
        const el = children[i];
        stack.push(el);
        if (el.shadowRoot) {
          stack.push(el.shadowRoot);
        }
      }
    }
  }
  return videos;
}

function getPrimaryVideo(): HTMLVideoElement | null {
  const videos = collectVideos();
  if (videos.length === 0) return null;

  const playing = videos.find((v) => !v.paused && !v.ended && v.readyState > 0);
  if (playing) return playing;

  let best: HTMLVideoElement | null = null;
  let bestArea = -1;
  for (const v of videos) {
    const rect = v.getBoundingClientRect();
    const area = rect.width * rect.height;
    if (area > bestArea) {
      bestArea = area;
      best = v;
    }
  }
  return best ?? videos[0];
}

function readVideoInfo(video: HTMLVideoElement): VideoInfo {
  return {
    playing: !video.paused && !video.ended,
    currentTime: Number.isFinite(video.currentTime) ? video.currentTime : 0,
    duration: Number.isFinite(video.duration) ? video.duration : 0,
    playbackRate: video.playbackRate,
  };
}

function isEditableEvent(e: KeyboardEvent): boolean {
  const path = e.composedPath();
  for (const target of path) {
    if (!(target instanceof HTMLElement)) continue;
    const tag = target.tagName;
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
    if (target.isContentEditable) return true;
  }
  return false;
}

export default defineContentScript({
  matches: ['<all_urls>'],
  allFrames: true,
  runAt: 'document_idle',

  main() {
    let settings: Settings = DEFAULT_SETTINGS;
    let targetSpeed = DEFAULT_SPEED;
    let enabled = true;
    let applying = false;
    const boundVideos = new WeakSet<HTMLVideoElement>();

    function applyToVideo(video: HTMLVideoElement): void {
      const desired = enabled ? targetSpeed : DEFAULT_SPEED;
      if (!nearSpeed(video.playbackRate, desired)) {
        applying = true;
        try {
          video.playbackRate = desired;
        } finally {
          applying = false;
        }
      }
    }

    function bindVideo(video: HTMLVideoElement): void {
      if (boundVideos.has(video)) return;
      boundVideos.add(video);

      const enforce = () => {
        if (!applying && enabled) {
          applyToVideo(video);
        }
      };

      video.addEventListener('ratechange', enforce);
      video.addEventListener('loadedmetadata', enforce);
      video.addEventListener('play', enforce);
      applyToVideo(video);
    }

    function scanAndApply(): void {
      for (const video of collectVideos()) {
        bindVideo(video);
        applyToVideo(video);
      }
    }

    void settingsStorage.getValue().then((s) => {
      settings = s;
      enabled = s.enabled;
    });

    settingsStorage.watch((next) => {
      if (!next) return;
      settings = next;
      enabled = next.enabled;
      scanAndApply();
    });

    void browser.runtime
      .sendMessage({ type: 'GET_MY_SPEED' } satisfies RuntimeMessage)
      .then((res: { speed?: number; enabled?: boolean } | undefined) => {
        if (!res) return;
        if (typeof res.enabled === 'boolean') enabled = res.enabled;
        if (typeof res.speed === 'number') targetSpeed = clampSpeed(res.speed);
        scanAndApply();
      })
      .catch(() => { });

    const observer = new MutationObserver(() => {
      const videos = collectVideos();
      for (const video of videos) {
        if (!boundVideos.has(video)) {
          bindVideo(video);
        }
      }
    });

    if (document.documentElement) {
      observer.observe(document.documentElement, { childList: true, subtree: true });
    }

    browser.runtime.onMessage.addListener(
      (message: RuntimeMessage): Promise<unknown> | undefined => {
        if (!message || typeof message !== 'object') return undefined;

        if (message.type === 'APPLY_SPEED') {
          enabled = message.enabled;
          targetSpeed = clampSpeed(message.speed);
          scanAndApply();
          return Promise.resolve({ ok: true });
        }

        if (message.type === 'QUERY_VIDEO') {
          const video = getPrimaryVideo();
          if (!video) return undefined;
          return Promise.resolve(readVideoInfo(video));
        }

        if (message.type === 'VIDEO_TOGGLE_PLAY') {
          const video = getPrimaryVideo();
          if (!video) return undefined;
          return (async () => {
            if (video.paused || video.ended) {
              await video.play().catch(() => { });
            } else {
              video.pause();
            }
            return readVideoInfo(video);
          })();
        }

        return undefined;
      },
    );

    window.addEventListener(
      'keydown',
      (e: KeyboardEvent) => {
        if (!enabled || settings.shortcutsEnabled === false || e.ctrlKey || e.altKey || e.metaKey) return;
        if (e.key.length !== 1 || !/[a-z0-9]/i.test(e.key)) return;
        if (isEditableEvent(e)) return;
        if (collectVideos().length === 0) return;

        const key = e.key.toUpperCase();
        const { up, down, reset } = settings.keys;
        if (key !== up && key !== down && key !== reset) return;

        e.preventDefault();
        if (key === reset) {
          targetSpeed = DEFAULT_SPEED;
          scanAndApply();
          void browser.runtime
            .sendMessage({ type: 'SHORTCUT_RESET' } satisfies RuntimeMessage)
            .catch(() => { });
        } else {
          const step = (settings.smallStep ?? 1) / 100;
          const delta = key === up ? step : -step;
          targetSpeed = clampSpeed(targetSpeed + delta);
          scanAndApply();
          void browser.runtime
            .sendMessage({ type: 'SHORTCUT_DELTA', delta } satisfies RuntimeMessage)
            .catch(() => { });
        }
      },
      true,
    );
  },
});
