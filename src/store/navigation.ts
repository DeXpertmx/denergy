import { create } from "zustand";

export type PageId =
  | "inicio"
  | "faq"
  | "contacto"
  | "privacidad"
  | "cookies"
  | "legal";

interface NavigationState {
  currentPage: PageId;
  mobileMenuOpen: boolean;
  navigate: (page: PageId) => void;
  setMobileMenuOpen: (open: boolean) => void;
}

export const useNavigation = create<NavigationState>((set) => ({
  currentPage: "inicio",
  mobileMenuOpen: false,
  navigate: (page) => {
    set({ currentPage: page, mobileMenuOpen: false });
    window.location.hash = page === "inicio" ? "" : page;
    window.scrollTo({ top: 0, behavior: "smooth" });
  },
  setMobileMenuOpen: (open) => set({ mobileMenuOpen: open }),
}));

interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  acceptedAt: string | null;
}

interface CookieState {
  preferences: CookiePreferences | null;
  bannerVisible: boolean;
  settingsOpen: boolean;
  showBanner: () => void;
  hideBanner: () => void;
  openSettings: () => void;
  closeSettings: () => void;
  acceptAll: () => void;
  rejectAll: () => void;
  savePreferences: (analytics: boolean, marketing: boolean) => void;
}

const COOKIE_KEY = "dimension_energy_cookies";

function loadPrefs(): CookiePreferences | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function savePrefs(prefs: CookiePreferences) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(prefs));
  } catch {
    // ignore
  }
}

export const useCookies = create<CookieState>((set, get) => ({
  preferences: null,
  bannerVisible: false,
  settingsOpen: false,
  showBanner: () => {
    const prefs = get().preferences ?? loadPrefs();
    if (!prefs) {
      set({ bannerVisible: true });
    }
  },
  hideBanner: () => set({ bannerVisible: false }),
  openSettings: () => set({ settingsOpen: true }),
  closeSettings: () => set({ settingsOpen: false }),
  acceptAll: () => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: true,
      marketing: true,
      acceptedAt: new Date().toISOString(),
    };
    savePrefs(prefs);
    set({ preferences: prefs, bannerVisible: false, settingsOpen: false });
  },
  rejectAll: () => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics: false,
      marketing: false,
      acceptedAt: new Date().toISOString(),
    };
    savePrefs(prefs);
    set({ preferences: prefs, bannerVisible: false, settingsOpen: false });
  },
  savePreferences: (analytics, marketing) => {
    const prefs: CookiePreferences = {
      necessary: true,
      analytics,
      marketing,
      acceptedAt: new Date().toISOString(),
    };
    savePrefs(prefs);
    set({ preferences: prefs, bannerVisible: false, settingsOpen: false });
  },
}));
