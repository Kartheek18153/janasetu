import { schemeData } from './schemeData';

const BUDGET_API = 'https://indiandataproject.org/data/budget/2025-26/schemes.json';
const CACHE_KEY = 'janasetu_schemes_cache';
const CACHE_TTL = 24 * 60 * 60 * 1000;

interface BudgetScheme {
  id: string;
  name: string;
  ministry: string;
  ministryName: string;
  allocation: number;
  previousYear: number;
  yoyChange: number;
  humanContext: string;
  officialUrl: string;
}

const OFFICIAL_URLS: Record<string, string> = {
  mgnrega: 'https://nrega.nic.in',
  'pm-kisan': 'https://pmkisan.gov.in',
  'pmay-g': 'https://pmaymis.gov.in',
  'samagra-shiksha': 'https://samagra.education.gov.in',
  nhm: 'https://nhm.gov.in',
  pmgsy: 'https://pmgsy.nic.in',
  'crop-insurance': 'https://pmfby.gov.in',
  'mid-day-meal': 'https://pmposhan.education.gov.in',
  'ayushman-bharat': 'https://pmjay.gov.in',
  'food-subsidy': 'https://nfsa.gov.in',
};

interface CacheData {
  schemes: BudgetScheme[];
  fetchedAt: number;
}

function loadCache(): CacheData | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as CacheData;
  } catch {
    return null;
  }
}

function saveCache(schemes: BudgetScheme[]) {
  try {
    const data: CacheData = { schemes, fetchedAt: Date.now() };
    localStorage.setItem(CACHE_KEY, JSON.stringify(data));
  } catch {
    // localStorage full or unavailable
  }
}

export const ExternalSchemeService = {
  async getBudgetSchemes(): Promise<BudgetScheme[]> {
    const cached = loadCache();
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL) {
      return cached.schemes;
    }
    try {
      const res = await fetch(BUDGET_API, { cache: 'no-cache' });
      const data = await res.json();
      const schemes = (data.schemes || []).map((s: any) => ({
        ...s,
        officialUrl: OFFICIAL_URLS[s.id] || `https://www.india.gov.in/topics/rural`,
      }));
      saveCache(schemes);
      return schemes;
    } catch {
      if (cached) return cached.schemes;
      return [];
    }
  },

  async getBudgetSchemeById(id: string): Promise<BudgetScheme | undefined> {
    const schemes = await this.getBudgetSchemes();
    return schemes.find(s => s.id === id);
  },

  getLocalSchemeById(id: string) {
    return schemeData.find(s => s.id === id);
  },

  getLastUpdated(): Date | null {
    const cached = loadCache();
    return cached ? new Date(cached.fetchedAt) : null;
  },
};

export type { BudgetScheme };
export default ExternalSchemeService;
