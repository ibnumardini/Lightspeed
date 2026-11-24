export const COPY = {
  en: {
    navFeatures: 'Features',
    navSettings: 'Settings',
    navReleases: 'Releases',
    navPrivacy: 'Privacy',
    navGithub: 'GitHub',
    heroTitle: 'Video speed, without the friction.',
    heroLatestLabel: 'Latest release',
    heroSub:
      '0.1× to 16× playback speed for Chromium and Firefox-based browsers. Per tab, per site, or across every tab.',
    addChrome: 'Add to Chrome',
    addFirefox: 'Add to Firefox',
    alsoFirefox: 'Also available for Firefox',
    alsoChrome: 'Also available for Chrome',
    heroTagline: 'Free, open source, and zero telemetry. Built for Chromium and Firefox-based browsers.',

    showcaseTitle: 'Built for everyday watching.',
    showcaseLead:
      'Everything fits in one 400px popup, with a dedicated Settings tab and live preview.',
    specs: [
      {
        title: 'Scoped control: tab, site, or all tabs',
        desc: 'Keep lectures at 1.75× on one tab, set a default speed for YouTube, or apply one rate everywhere. Speeds stay enforced across SPA navigation and iframes.',
      },
      {
        title: 'Quick speeds and custom fine-tune steps',
        desc: 'Pick up to 10 one-tap presets (each with an expandable +0.5× tab), press-and-hold percentage steps, or adjust 0.1× to 16× with typing, scroll wheel, or arrow keys.',
      },
      {
        title: 'Shortcuts and live remaining time',
        desc: 'Press A, D, or S on any video page to step up, step down, or reset to 1× (toggleable in Settings, ignored while typing). See progress, remaining time, and minutes saved in Now playing.',
      },
    ],

    featuresTitle: 'Quiet details that stay out of your way.',
    featuresLead: 'No account, no subscription wall, and no background bloat.',
    settingsTitle: 'A dedicated Settings tab with live preview.',
    settingsLead:
      'Every change saves automatically and updates the popup preview side by side.',
    settingsOverviewTitle: 'Popup layout and live preview',
    settingsOverviewDesc:
      'Turn individual popup sections on or off (Scope selector, Quick speeds, Fine-tune buttons, Manual input, Now playing) and see the exact result immediately.',
    settingsSpeedsTitle: 'Quick speeds and fine-tune steps',
    settingsSpeedsDesc:
      'Manage up to 10 one-tap presets from 0.1× to 16×, sorted automatically. Pick preset small/big percentage steps or enter your own custom value.',
    settingsCustomTitle: 'Shortcuts, language, and appearance',
    settingsCustomDesc:
      'Rebind single-key shortcuts (A, D, S by default), switch between Auto, English, or Bahasa Indonesia, choose System/Light/Dark theme, and pick from 6 WCAG-checked accents or a custom color.',
    cards: [
      {
        title: 'Toolbar speed badge',
        desc: 'Shows the active speed right on the extension icon. Choose Always show, Hide at 1×, or Always hide in Settings.',
      },
      {
        title: 'Themes and dynamic accents',
        desc: 'Switch between System, Light, and Dark mode from Settings or the popup. Choose from 6 WCAG-checked accent presets or pick a custom color.',
      },
      {
        title: 'English and Bahasa Indonesia',
        desc: 'Follows your browser language automatically, or switch between EN and ID in one click directly from the popup footer.',
      },
    ],

    releasesTitle: 'Releases',
    releasesLead: 'Prebuilt packages for Chromium (MV3) and Firefox-based (MV2) browsers.',
    releasesViewAll: 'All releases on GitHub',
    releasesLatest: 'Latest',
    releasesLoading: 'Loading releases…',
    releasesFallbackTitle: 'v1.1.1',
    releasesFallbackDate: 'Nov 23, 2026',
    releasesFallbackNotes: [
      '0.1× to 16× HTML5 video playback speed control across Chromium (MV3) and Firefox-based (MV2) browsers.',
      'Per-tab, per-site, and all-tabs scope modes with automatic enforcement in SPAs and iframes.',
      'Up to 10 customizable Quick speeds, preset & custom Fine-tune steps, and single-key shortcuts (A / D / S).',
      'Toolbar speed badge, Now playing time-saved card, System/Light/Dark themes, 6 WCAG-checked accents, and EN/ID support.',
    ],

    privacyTitle: 'Zero telemetry, by design.',
    privacyP1:
      'Lightspeed does not collect, transmit, or sell browsing history, analytics, or personal data. Every preference stays inside your browser storage.',
    privacyPoints: [
      'All preferences stored locally in browser storage',
      'No analytics scripts, trackers, or external API calls',
      'Full source code open for inspection on GitHub',
    ],
    privacyPermsTitle: 'Permissions requested',
    privacyLink: 'Read full Privacy Policy',
    perms: [
      ['storage', 'Saves your settings, shortcuts, and per-site speed preferences locally.'],
      ['tabs', 'Reads the active tab hostname to apply per-tab, per-site, or all-tabs speeds and update the toolbar badge.'],
      ['<all_urls>', 'Finds HTML5 <video> elements (including iframes) and listens for your configured shortcuts.'],
    ],

    footerMade: 'Made by',
    footerPrivacy: 'Privacy Policy',
    ctaBandTitle: 'Watch at your own pace.',
    ctaBandSub: 'Free for Chromium and Firefox-based browsers. No account, no tracking.',
  },
  id: {
    navFeatures: 'Fitur',
    navSettings: 'Settings',
    navReleases: 'Rilis',
    navPrivacy: 'Privasi',
    navGithub: 'GitHub',
    heroTitle: 'Atur kecepatan video tanpa ribet.',
    heroLatestLabel: 'Rilis terbaru',
    heroSub:
      'Kecepatan 0.1× sampai 16× untuk browser berbasis Chromium dan Firefox. Per tab, per situs, atau semua tab.',
    addChrome: 'Pasang di Chrome',
    addFirefox: 'Pasang di Firefox',
    alsoFirefox: 'Juga tersedia untuk Firefox',
    alsoChrome: 'Juga tersedia untuk Chrome',
    heroTagline: 'Gratis, open source, dan tanpa telemetri. Untuk browser berbasis Chromium dan Firefox.',

    showcaseTitle: 'Dirancang untuk pemakaian harian.',
    showcaseLead:
      'Semua kontrol muat dalam popup 400px, lengkap dengan halaman Settings dan Live preview.',
    specs: [
      {
        title: 'Scope fleksibel: tab, situs, atau semua tab',
        desc: 'Atur kecepatan khusus untuk satu tab, simpan kecepatan default per situs seperti YouTube, atau terapkan ke semua tab sekaligus. Tetap terjaga saat pindah video di SPA maupun iframe.',
      },
      {
        title: 'Preset kecepatan dan langkah penyesuaian',
        desc: 'Simpan hingga 10 preset sekali klik (masing-masing dilengkapi tab +0.5× saat di-hover), tahan tombol −/+ untuk repeat, atau atur 0.1× sampai 16× lewat ketik, scroll mouse, dan tombol panah.',
      },
      {
        title: 'Pintasan keyboard dan estimasi sisa waktu',
        desc: 'Tekan A, D, atau S di halaman video untuk naik, turun, atau reset ke 1× (bisa dimatikan di Pengaturan, otomatis jeda saat mengetik). Kartu Sedang diputar menampilkan progress, sisa durasi, dan waktu hemat.',
      },
    ],

    featuresTitle: 'Detail ringkas yang tidak mengganggu.',
    featuresLead: 'Tanpa akun, tanpa langganan, dan tanpa proses latar belakang berlebihan.',
    settingsTitle: 'Halaman Settings khusus dengan Live preview.',
    settingsLead:
      'Semua perubahan tersimpan otomatis dan langsung terlihat di preview popup di sebelahnya.',
    settingsOverviewTitle: 'Popup layout dan Live preview',
    settingsOverviewDesc:
      'Aktifkan atau sembunyikan bagian popup sesuai kebutuhan (Scope selector, Quick speeds, Fine-tune buttons, Manual input, Now playing) sambil melihat hasilnya secara langsung.',
    settingsSpeedsTitle: 'Quick speeds dan Fine-tune steps',
    settingsSpeedsDesc:
      'Kelola hingga 10 preset sekali klik dari 0.1× sampai 16× yang otomatis terurut. Pilih preset step kecil/besar atau masukkan persentase custom sendiri.',
    settingsCustomTitle: 'Shortcut, bahasa, dan tampilan',
    settingsCustomDesc:
      'Ubah shortcut satu tombol (default A, D, S), pilih bahasa Auto, English, atau Bahasa Indonesia, atur mode System/Light/Dark, serta 6 preset warna accent atau warna Custom.',
    cards: [
      {
        title: 'Badge kecepatan di icon toolbar',
        desc: 'Menampilkan kecepatan aktif langsung di icon extension. Pilih Selalu tampil, Sembunyikan di 1×, atau Selalu sembunyikan di Pengaturan.',
      },
      {
        title: 'Theme dan warna accent dinamis',
        desc: 'Pilih mode System, Light, atau Dark dari Settings maupun langsung di popup. Tersedia 6 preset warna teruji kontras WCAG atau warna Custom.',
      },
      {
        title: 'Bahasa Indonesia dan English',
        desc: 'Otomatis mengikuti bahasa browser, atau ganti cepat antara EN dan ID dalam satu klik dari footer popup.',
      },
    ],

    releasesTitle: 'Rilis',
    releasesLead: 'Paket siap pakai untuk browser berbasis Chromium (MV3) dan Firefox (MV2).',
    releasesViewAll: 'Semua rilis di GitHub',
    releasesLatest: 'Terbaru',
    releasesLoading: 'Memuat daftar rilis…',
    releasesFallbackTitle: 'v1.1.1',
    releasesFallbackDate: '23 Nov 2026',
    releasesFallbackNotes: [
      'Kontrol kecepatan video HTML5 0.1× sampai 16× untuk browser berbasis Chromium (MV3) dan Firefox (MV2).',
      'Mode scope per tab, per situs, dan semua tab yang tetap aktif di SPA dan iframe.',
      'Hingga 10 Quick speeds, Fine-tune steps preset & custom, serta keyboard shortcut satu tombol (A / D / S).',
      'Badge kecepatan di toolbar, kartu Now playing dengan estimasi waktu hemat, tema System/Light/Dark, 6 warna accent, dan bahasa EN/ID.',
    ],

    privacyTitle: 'Tanpa telemetri sejak awal.',
    privacyP1:
      'Lightspeed tidak mengumpulkan, mengirim, atau menjual riwayat browsing, analitik, maupun data pribadi. Semua pengaturan tersimpan lokal di browser kamu.',
    privacyPoints: [
      'Semua pengaturan tersimpan lokal di storage browser',
      'Tanpa skrip analitik, pelacak, atau panggilan API eksternal',
      'Kode sumber terbuka dan bisa diaudit langsung di GitHub',
    ],
    privacyPermsTitle: 'Izin yang diminta',
    privacyLink: 'Baca Privacy Policy lengkap',
    perms: [
      ['storage', 'Menyimpan pengaturan, shortcut, dan kecepatan per situs secara lokal.'],
      ['tabs', 'Membaca hostname tab aktif untuk menerapkan scope tab/situs/semua tab dan memperbarui badge toolbar.'],
      ['<all_urls>', 'Mendeteksi elemen <video> HTML5 (termasuk di iframe) serta mendengarkan shortcut keyboard kamu.'],
    ],

    footerMade: 'Made by',
    footerPrivacy: 'Privacy Policy',
    ctaBandTitle: 'Tonton dengan ritme kamu sendiri.',
    ctaBandSub: 'Gratis untuk browser berbasis Chromium dan Firefox. Tanpa akun, tanpa pelacakan.',
  },
};
