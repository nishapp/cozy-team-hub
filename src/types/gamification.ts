
export interface UserStats {
  id: string;
  totalPoints: number;
  currentLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  imageUrl?: string;
  pointsReward: number;
  requirementType: 'bits_count' | 'streak_days' | 'buddies_count' | 'bookmarks_count';
  requirementValue: number;
  createdAt: string;
}

export interface UserBadge {
  id: string;
  userId: string;
  badgeId: string;
  earnedAt: string;
  badge?: Badge;
}

export interface PointTransaction {
  id: string;
  userId: string;
  points: number;
  transactionType: 'bit_created' | 'streak_bonus' | 'badge_earned' | 'buddy_added';
  referenceId?: string;
  createdAt: string;
}

export interface GamificationStats {
  stats: UserStats;
  badges: UserBadge[];
  recentTransactions: PointTransaction[];
  activityDates: Date[];
}
