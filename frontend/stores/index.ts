import { create } from 'zustand';
import { Campaign, CampaignDraft, BackingRecord, Notification, User, ContributionStep } from '../data/types';
import {
  DEMO_CAMPAIGNS,
  DEMO_NOTIFICATIONS,
  DEMO_BACKED_CAMPAIGNS,
  DEMO_USER,
  ADMIN_USER,
  CREATOR_USER,
} from '../data/seed';

// ─── Campaign Store ──────────────────────────────────────────────────────────

interface CampaignStore {
  campaigns: Campaign[];
  drafts: CampaignDraft[];
  searchQuery: string;
  selectedCategory: string;
  sortBy: 'trending' | 'newest' | 'most_funded' | 'ending_soon';

  setSearchQuery: (q: string) => void;
  setCategory: (c: string) => void;
  setSortBy: (s: 'trending' | 'newest' | 'most_funded' | 'ending_soon') => void;
  getCampaignById: (id: string) => Campaign | undefined;
  getFilteredCampaigns: () => Campaign[];
  getFeaturedCampaigns: () => Campaign[];

  saveDraft: (draft: CampaignDraft) => void;
  deleteDraft: (id: string) => void;
  submitCampaign: (draftId: string) => void;
  contributeToCamera: (campaignId: string, amount: number) => void;
}

export const useCampaignStore = create<CampaignStore>((set, get) => ({
  campaigns: DEMO_CAMPAIGNS,
  drafts: [],
  searchQuery: '',
  selectedCategory: 'all',
  sortBy: 'trending',

  setSearchQuery: (q) => set({ searchQuery: q }),
  setCategory: (c) => set({ selectedCategory: c }),
  setSortBy: (s) => set({ sortBy: s }),

  getCampaignById: (id) => get().campaigns.find((c) => c.id === id),

  getFilteredCampaigns: () => {
    const { campaigns, searchQuery, selectedCategory, sortBy } = get();
    let filtered = campaigns.filter((c) => c.status !== 'draft');

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (c) =>
          c.title.toLowerCase().includes(q) ||
          c.summary.toLowerCase().includes(q) ||
          c.creatorName.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q) ||
          c.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        (c) => c.category.toLowerCase().replace(/\s+/g, '-') === selectedCategory ||
               c.category.toLowerCase() === selectedCategory
      );
    }

    switch (sortBy) {
      case 'newest':
        filtered = [...filtered].sort(
          (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'most_funded':
        filtered = [...filtered].sort((a, b) => b.raisedAmount - a.raisedAmount);
        break;
      case 'ending_soon':
        filtered = [...filtered].sort((a, b) => a.daysLeft - b.daysLeft);
        break;
      default: // trending
        filtered = [...filtered].sort((a, b) => b.backerCount - a.backerCount);
    }

    return filtered;
  },

  getFeaturedCampaigns: () => get().campaigns.filter((c) => c.featured),

  saveDraft: (draft) =>
    set((state) => {
      const existing = state.drafts.findIndex((d) => d.id === draft.id);
      if (existing >= 0) {
        const updated = [...state.drafts];
        updated[existing] = draft;
        return { drafts: updated };
      }
      return { drafts: [...state.drafts, draft] };
    }),

  deleteDraft: (id) =>
    set((state) => ({ drafts: state.drafts.filter((d) => d.id !== id) })),

  submitCampaign: (draftId) =>
    set((state) => ({
      drafts: state.drafts.map((d) =>
        d.id === draftId ? { ...d, status: 'submitted' as const } : d
      ),
    })),

  contributeToCamera: (campaignId, amount) =>
    set((state) => ({
      campaigns: state.campaigns.map((c) =>
        c.id === campaignId
          ? {
              ...c,
              raisedAmount: c.raisedAmount + amount,
              backerCount: c.backerCount + 1,
            }
          : c
      ),
    })),
}));

// ─── Auth / User Store ────────────────────────────────────────────────────────

interface AuthStore {
  user: User | null;
  isLoggedIn: boolean;
  backedCampaigns: BackingRecord[];

  login: (user: User, backed?: BackingRecord[]) => void;
  logout: () => void;
  loginAsDemo: () => void;
  loginAsRole: (role: 'admin' | 'user') => void;
  addBacking: (record: BackingRecord) => void;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoggedIn: false,
  backedCampaigns: [],

  login: (user, backed = []) => set({ user, isLoggedIn: true, backedCampaigns: backed }),
  logout: () => set({ user: null, isLoggedIn: false, backedCampaigns: [] }),
  loginAsDemo: () =>
    set({
      user: DEMO_USER,
      isLoggedIn: true,
      backedCampaigns: DEMO_BACKED_CAMPAIGNS,
    }),
  loginAsRole: (role) => {
    if (role === 'admin') {
      set({
        user: ADMIN_USER,
        isLoggedIn: true,
        backedCampaigns: [
          DEMO_BACKED_CAMPAIGNS[0],
          DEMO_BACKED_CAMPAIGNS[1],
        ],
      });
    } else {
      set({
        user: DEMO_USER,
        isLoggedIn: true,
        backedCampaigns: DEMO_BACKED_CAMPAIGNS,
      });
    }
  },
  addBacking: (record) =>
    set((state) => ({
      backedCampaigns: [...state.backedCampaigns, record],
      user: state.user
        ? {
            ...state.user,
            backedCount: state.user.backedCount + 1,
            totalContributed: state.user.totalContributed + record.amount,
          }
        : null,
    })),
}));

// ─── Notification Store ───────────────────────────────────────────────────────

interface NotificationStore {
  notifications: Notification[];
  unreadCount: number;

  markRead: (id: string) => void;
  markAllRead: () => void;
  addNotification: (n: Notification) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: DEMO_NOTIFICATIONS,
  unreadCount: DEMO_NOTIFICATIONS.filter((n) => !n.read).length,

  markRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return { notifications: updated, unreadCount: updated.filter((n) => !n.read).length };
    }),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  addNotification: (n) =>
    set((state) => ({
      notifications: [n, ...state.notifications],
      unreadCount: state.unreadCount + (n.read ? 0 : 1),
    })),
}));

// ─── Contribution Flow Store ──────────────────────────────────────────────────

interface ContributionStore {
  flow: Partial<ContributionStep> | null;
  startFlow: (campaignId: string) => void;
  setAmount: (amount: number) => void;
  setAnonymous: (v: boolean) => void;
  setGuestEmail: (email: string) => void;
  clearFlow: () => void;
}

export const useContributionStore = create<ContributionStore>((set) => ({
  flow: null,

  startFlow: (campaignId) =>
    set({
      flow: {
        campaignId,
        amount: 0,
        fees: 0,
        total: 0,
        estimatedReach: 0,
        isAnonymous: false,
      },
    }),

  setAmount: (amount) =>
    set((state) => {
      if (!state.flow) return state;
      const fees = Math.round(amount * 0.11 * 100) / 100;
      const total = amount + fees;
      const estimatedReach = Math.round(amount * 100);
      return { flow: { ...state.flow, amount, fees, total, estimatedReach } };
    }),

  setAnonymous: (v) =>
    set((state) => state.flow ? { flow: { ...state.flow, isAnonymous: v } } : state),

  setGuestEmail: (email) =>
    set((state) => state.flow ? { flow: { ...state.flow, guestEmail: email } } : state),

  clearFlow: () => set({ flow: null }),
}));
