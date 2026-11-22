import type { LanguageMode } from '@/utils/storage';

export type ResolvedLang = 'en' | 'id';

export function detectBrowserLang(): ResolvedLang {
  if (typeof navigator !== 'undefined' && typeof navigator.language === 'string') {
    if (navigator.language.toLowerCase().startsWith('id')) return 'id';
  }
  return 'en';
}

export function resolveLang(
  mode: LanguageMode | undefined,
  browserLang: ResolvedLang = detectBrowserLang(),
): ResolvedLang {
  if (mode === 'en' || mode === 'id') return mode;
  return browserLang;
}

export interface Strings {
  // Popup
  resetAll: string;
  resetAllTitle: string;
  powerAria: string;
  turnOffTitle: string;
  turnOnTitle: string;
  applyTo: string;
  scopeTab: string;
  scopeSite: string;
  scopeAll: string;
  quickSpeed: string;
  playbackSpeed: string;
  apply: string;
  hintNormal: (pct: number) => string;
  hintInvalid: string;
  hintDirty: (target: string) => string;
  shortcutTip: (key: string) => string;
  decreaseBy: (step: number, key?: string) => string;
  increaseBy: (step: number, key?: string) => string;
  nowPlaying: string;
  playing: string;
  paused: string;
  playVideo: string;
  pauseVideo: string;
  browserPage: string;
  thisTab: string;
  notAvailableBrowser: string;
  noVideoDetected: string;
  live: string;
  timeLeft: (dur: string) => string;
  normalSpeed: string;
  savesTime: (dur: string) => string;
  longerTime: (dur: string) => string;
  offTitle: string;
  offDesc: string;
  turnOn: string;
  settings: string;
  officialWebsite: string;
  visitWebsite: string;
  switchToLight: string;
  switchToDark: string;
  buyCoffee: string;
  supportAria: (isID: boolean) => string;
  privacyPolicy: string;

  // Settings
  settingsTitle: string;
  changesAutoSave: string;
  website: string;
  supportButton: (isID: boolean) => string;
  navPopup: string;
  navQuick: string;
  navSteps: string;
  navShortcuts: string;
  navAppearance: string;

  popupLayoutDesc: string;
  visScopeTitle: string;
  visScopeDesc: string;
  visQuickTitle: string;
  visQuickDesc: string;
  visFineTitle: string;
  visFineDesc: string;
  visManualTitle: string;
  visManualDesc: string;
  visNowTitle: string;
  visNowDesc: string;

  quickSpeedsDesc: string;
  resetToDefault: string;
  edit: string;
  save: string;
  cancel: string;
  addASpeed: string;
  addPlaceholder: string;
  add: string;
  quickCountMsg: (count: number) => string;
  quickErrRange: string;
  quickErrDuplicate: (label: string) => string;
  quickErrMax: string;

  fineTuneDesc: string;
  smallStep: string;
  bigStep: string;
  custom: string;
  stepErrRange: (max: number) => string;

  shortcutsDesc: string;
  shortcutUp: (small: number) => string;
  shortcutDown: (small: number) => string;
  shortcutReset: string;
  pressKey: string;
  change: string;
  keyTaken: (key: string) => string;

  appearanceDesc: string;
  language: string;
  langAuto: string;
  theme: string;
  themeSystem: string;
  themeLight: string;
  themeDark: string;
  accentColor: string;
  lowContrastWarn: string;

  livePreview: string;
  livePreviewSub: string;
}

const EN: Strings = {
  resetAll: 'Reset all',
  resetAllTitle: 'Reset all tabs and sites to 1×',
  powerAria: 'Speed control on or off',
  turnOffTitle: 'Turn off Lightspeed',
  turnOnTitle: 'Turn on Lightspeed',
  applyTo: 'Apply to',
  scopeTab: 'This tab',
  scopeSite: 'This site',
  scopeAll: 'All tabs',
  quickSpeed: 'Quick speed',
  playbackSpeed: 'Playback speed',
  apply: 'Apply',
  hintNormal: (pct) => `Now ${pct}% · type any speed, then Apply`,
  hintInvalid: 'Enter a speed from 0.1× to 16×',
  hintDirty: (target) => `Press Apply or Enter to switch to ${target}`,
  shortcutTip: (key) => `Shortcut: ${key}`,
  decreaseBy: (step, key) =>
    key ? `Decrease speed by ${step}% (shortcut ${key})` : `Decrease speed by ${step}%`,
  increaseBy: (step, key) =>
    key ? `Increase speed by ${step}% (shortcut ${key})` : `Increase speed by ${step}%`,
  nowPlaying: 'Now playing',
  playing: 'Playing',
  paused: 'Paused',
  playVideo: 'Play video',
  pauseVideo: 'Pause video',
  browserPage: 'Browser page',
  thisTab: 'This tab',
  notAvailableBrowser: 'Not available on browser pages',
  noVideoDetected: 'No video detected on this tab',
  live: 'Live',
  timeLeft: (dur) => `${dur} left`,
  normalSpeed: 'normal speed',
  savesTime: (dur) => `saves ${dur}`,
  longerTime: (dur) => `+${dur} longer`,
  offTitle: 'Lightspeed is off',
  offDesc: 'Videos play at their normal speed until you turn it back on.',
  turnOn: 'Turn on',
  settings: 'Settings',
  officialWebsite: 'Official website',
  visitWebsite: 'Visit official website',
  switchToLight: 'Switch to light theme',
  switchToDark: 'Switch to dark theme',
  buyCoffee: 'Buy me a coffee',
  supportAria: (isID) =>
    isID ? 'Support Lightspeed on Trakteer' : 'Support Lightspeed on Ko-fi',
  privacyPolicy: 'Privacy Policy',

  settingsTitle: 'Settings',
  changesAutoSave: 'Changes save automatically',
  website: 'Website',
  supportButton: (isID) =>
    isID ? 'Buy me a coffee on Trakteer' : 'Buy me a coffee on Ko-fi',
  navPopup: 'Popup layout',
  navQuick: 'Quick speeds',
  navSteps: 'Fine-tune steps',
  navShortcuts: 'Keyboard shortcuts',
  navAppearance: 'Appearance',

  popupLayoutDesc:
    'Choose what shows in the popup. The header with the on/off switch and Reset all always stays.',
  visScopeTitle: 'Scope selector',
  visScopeDesc: 'Apply a speed to this tab, the whole site, or all tabs.',
  visQuickTitle: 'Quick speeds',
  visQuickDesc: 'One-tap speed buttons. Edit the list in Quick speeds below.',
  visFineTitle: 'Fine-tune buttons',
  visFineDesc: 'The −/+ step buttons around the speed field. They change the speed right away.',
  visManualTitle: 'Manual speed input',
  visManualDesc: 'Type any speed from 0.1× to 16×. It only takes effect after Apply or Enter.',
  visNowTitle: 'Now playing',
  visNowDesc: 'The current video, time left at your speed, and how much time it saves.',

  quickSpeedsDesc:
    'The one-tap buttons in the popup, shown from slowest to fastest. Up to 10, from 0.1× to 16×.',
  resetToDefault: 'Reset to default',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  addASpeed: 'Add a speed',
  addPlaceholder: 'e.g. 1.5',
  add: 'Add',
  quickCountMsg: (count) => `${count} of 10 · the popup shows up to 5 per row`,
  quickErrRange: 'Enter a speed from 0.1× to 16×.',
  quickErrDuplicate: (label) => `${label} is already in the list.`,
  quickErrMax: 'You can have up to 10 quick speeds.',

  fineTuneDesc: 'How much the −/+ buttons change the speed. 1% of 1× is 0.01×.',
  smallStep: 'Small step',
  bigStep: 'Big step',
  custom: 'Custom',
  stepErrRange: (max) => `Enter a whole number from 1% to ${max}%.`,

  shortcutsDesc:
    'Work on any page with a video, as long as you are not typing in a text field. Click Change, then press a letter or number.',
  shortcutUp: (small) => `Increase speed by ${small}%`,
  shortcutDown: (small) => `Decrease speed by ${small}%`,
  shortcutReset: 'Reset to 1×',
  pressKey: 'Press a key…',
  change: 'Change',
  keyTaken: (key) => `${key} is already used by another shortcut.`,

  appearanceDesc: 'Language, theme mode, and accent color for the popup and settings.',
  language: 'Language',
  langAuto: 'Auto',
  theme: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  accentColor: 'Accent color',
  lowContrastWarn:
    'This color is light, so white text on buttons may be hard to read. Try a darker shade.',

  livePreview: 'Live preview',
  livePreviewSub: 'Updates as you change settings',
};

const ID: Strings = {
  resetAll: 'Reset all',
  resetAllTitle: 'Reset semua tab dan situs ke 1×',
  powerAria: 'Aktifkan atau matikan kontrol kecepatan',
  turnOffTitle: 'Matikan Lightspeed',
  turnOnTitle: 'Nyalakan Lightspeed',
  applyTo: 'Terapkan ke',
  scopeTab: 'Tab ini',
  scopeSite: 'Situs ini',
  scopeAll: 'Semua tab',
  quickSpeed: 'Quick speed',
  playbackSpeed: 'Playback speed',
  apply: 'Apply',
  hintNormal: (pct) => `Sekarang ${pct}% · ketik kecepatan, lalu Apply`,
  hintInvalid: 'Masukkan kecepatan dari 0.1× sampai 16×',
  hintDirty: (target) => `Klik Apply atau tekan Enter untuk ubah ke ${target}`,
  shortcutTip: (key) => `Shortcut: ${key}`,
  decreaseBy: (step, key) =>
    key ? `Kurangi kecepatan ${step}% (shortcut ${key})` : `Kurangi kecepatan ${step}%`,
  increaseBy: (step, key) =>
    key ? `Tambah kecepatan ${step}% (shortcut ${key})` : `Tambah kecepatan ${step}%`,
  nowPlaying: 'Now playing',
  playing: 'Diputar',
  paused: 'Dijeda',
  playVideo: 'Putar video',
  pauseVideo: 'Jeda video',
  browserPage: 'Halaman browser',
  thisTab: 'Tab ini',
  notAvailableBrowser: 'Tidak tersedia di halaman browser',
  noVideoDetected: 'Tidak ada video terdeteksi di tab ini',
  live: 'Live',
  timeLeft: (dur) => `Sisa ${dur}`,
  normalSpeed: 'kecepatan normal',
  savesTime: (dur) => `hemat ${dur}`,
  longerTime: (dur) => `+${dur} lebih lama`,
  offTitle: 'Lightspeed nonaktif',
  offDesc: 'Video diputar dengan kecepatan normal sampai kamu menyalakannya lagi.',
  turnOn: 'Nyalakan',
  settings: 'Settings',
  officialWebsite: 'Website resmi',
  visitWebsite: 'Kunjungi website resmi',
  switchToLight: 'Ganti ke tema Light',
  switchToDark: 'Ganti ke tema Dark',
  buyCoffee: 'Buy me a coffee',
  supportAria: (isID) =>
    isID ? 'Dukung Lightspeed di Trakteer' : 'Dukung Lightspeed di Ko-fi',
  privacyPolicy: 'Privacy Policy',

  settingsTitle: 'Settings',
  changesAutoSave: 'Perubahan tersimpan otomatis',
  website: 'Website',
  supportButton: (isID) =>
    isID ? 'Traktir kopi di Trakteer' : 'Buy me a coffee on Ko-fi',
  navPopup: 'Popup layout',
  navQuick: 'Quick speeds',
  navSteps: 'Fine-tune steps',
  navShortcuts: 'Keyboard shortcuts',
  navAppearance: 'Appearance',

  popupLayoutDesc:
    'Pilih bagian yang tampil di popup. Header dengan switch on/off dan Reset all selalu tampil.',
  visScopeTitle: 'Scope selector',
  visScopeDesc: 'Terapkan kecepatan untuk tab ini, satu situs penuh, atau semua tab.',
  visQuickTitle: 'Quick speeds',
  visQuickDesc: 'Tombol kecepatan sekali klik. Atur daftarnya di bagian Quick speeds di bawah.',
  visFineTitle: 'Fine-tune buttons',
  visFineDesc: 'Tombol step −/+ di samping kolom kecepatan. Langsung mengubah kecepatan saat diklik.',
  visManualTitle: 'Manual speed input',
  visManualDesc: 'Ketik kecepatan bebas dari 0.1× sampai 16×. Baru aktif setelah klik Apply atau Enter.',
  visNowTitle: 'Now playing',
  visNowDesc: 'Info video yang diputar, sisa waktu di kecepatan aktif, dan estimasi waktu hemat.',

  quickSpeedsDesc:
    'Tombol sekali klik di popup, diurutkan dari paling lambat ke paling cepat. Maksimal 10, dari 0.1× sampai 16×.',
  resetToDefault: 'Reset ke default',
  edit: 'Edit',
  save: 'Simpan',
  cancel: 'Batal',
  addASpeed: 'Tambah kecepatan',
  addPlaceholder: 'mis. 1.5',
  add: 'Tambah',
  quickCountMsg: (count) => `${count} dari 10 · popup menampilkan hingga 5 tombol per baris`,
  quickErrRange: 'Masukkan kecepatan dari 0.1× sampai 16×.',
  quickErrDuplicate: (label) => `${label} sudah ada di daftar.`,
  quickErrMax: 'Maksimal 10 quick speeds.',

  fineTuneDesc: 'Seberapa besar tombol −/+ mengubah kecepatan. 1% dari 1× sama dengan 0.01×.',
  smallStep: 'Small step',
  bigStep: 'Big step',
  custom: 'Custom',
  stepErrRange: (max) => `Masukkan angka bulat dari 1% sampai ${max}%.`,

  shortcutsDesc:
    'Berfungsi di halaman mana pun yang ada videonya, selama tidak sedang mengetik di kolom teks. Klik Ubah, lalu tekan huruf atau angka.',
  shortcutUp: (small) => `Tambah kecepatan ${small}%`,
  shortcutDown: (small) => `Kurangi kecepatan ${small}%`,
  shortcutReset: 'Reset ke 1×',
  pressKey: 'Tekan tombol…',
  change: 'Ubah',
  keyTaken: (key) => `Tombol ${key} sudah dipakai shortcut lain.`,

  appearanceDesc: 'Bahasa, mode theme, dan warna accent untuk popup dan settings.',
  language: 'Bahasa',
  langAuto: 'Auto',
  theme: 'Theme',
  themeSystem: 'System',
  themeLight: 'Light',
  themeDark: 'Dark',
  accentColor: 'Accent color',
  lowContrastWarn:
    'Warna ini terlalu terang sehingga teks putih di tombol bisa sulit dibaca. Coba pilih warna yang lebih gelap.',

  livePreview: 'Live preview',
  livePreviewSub: 'Otomatis update saat setting diubah',
};

export function getStrings(lang: ResolvedLang): Strings {
  return lang === 'id' ? ID : EN;
}
