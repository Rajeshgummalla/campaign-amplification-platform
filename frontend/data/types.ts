export interface Campaign {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  creatorName: string;
  creatorType: 'individual' | 'nonprofit' | 'organization' | 'advocacy' | 'business';
  summary: string;
  story: string;
  coverImage: string;
  adHeadline: string;
  adDescription: string;
  callToAction: string;
  targetAmount: number;
  raisedAmount: number;
  backerCount: number;
  status: CampaignStatus;
  reachEstimate: number;
  reachPerDollar: number;
  duration: number;
  daysLeft: number;
  targetLocations: string[];
  targetAudience: string;
  channels: string[];
  sources: Source[];
  platformFeePercent: number;
  processingFeePercent: number;
  createdAt: string;
  submittedAt?: string;
  approvedAt?: string;
  featured: boolean;
  tags: string[];
  impressions?: number;
  clicks?: number;
}

export type CampaignStatus =
  | 'draft'
  | 'submitted'
  | 'under_review'
  | 'changes_requested'
  | 'approved'
  | 'funding'
  | 'goal_reached'
  | 'preparing'
  | 'promoting'
  | 'completed'
  | 'rejected'
  | 'cancelled';

export interface Source {
  title: string;
  url: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  joinedAt: string;
  role?: 'user' | 'creator' | 'admin' | 'reviewer';
  backedCount: number;
  createdCount: number;
  totalContributed: number;
  adminStats?: {
    reviewedCount: number;
    approvedCount: number;
    pendingCount: number;
  };
}

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  campaignId?: string;
  campaignTitle?: string;
  timestamp: string;
  read: boolean;
}

export type NotificationType =
  | 'campaign_submitted'
  | 'campaign_approved'
  | 'campaign_rejected'
  | 'campaign_changes_requested'
  | 'funding_milestone'
  | 'deadline_approaching'
  | 'contribution_confirmed'
  | 'contribution_failed'
  | 'campaign_promoting'
  | 'campaign_completed'
  | 'report_available'
  | 'security_event';

export interface BackingRecord {
  id: string;
  campaignId: string;
  campaignTitle: string;
  campaignImage: string;
  amount: number;
  date: string;
  status: 'pending' | 'confirmed' | 'failed' | 'refunded';
  estimatedReach: number;
}

export interface CampaignDraft {
  id: string;
  // Step 1 — Basics
  title: string;
  category: string;
  creatorName: string;
  summary: string;
  coverImage?: string;
  // Step 2 — Story
  storyHeadline: string;
  storyBody: string;
  sources: Source[];
  // Step 3 — Visuals
  adHeadline: string;
  adDescription: string;
  callToAction: string;
  adImages: string[];
  // Step 4 — Reach
  targetLocations: string[];
  targetAudience: string;
  channels: string[];
  duration: number;
  budgetAllocation: BudgetAllocation;
  // Step 5 — Submit
  targetAmount: number;
  // Meta
  currentStep: number;
  savedAt: string;
  status: CampaignStatus;
}

export interface BudgetAllocation {
  socialMedia: number;
  searchAds: number;
  displayNetwork: number;
  video: number;
}

export interface ContributionStep {
  campaignId: string;
  amount: number;
  fees: number;
  total: number;
  estimatedReach: number;
  isAnonymous: boolean;
  guestEmail?: string;
  paymentMethod?: 'card' | 'paypal';
}
