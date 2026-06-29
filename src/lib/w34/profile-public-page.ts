// ============================================================
// PROFILE PUBLIC PAGE + FOLLOW + PRIVACY (Wave 34)
// Cabala dos Caminhos — pure TypeScript, no runtime imports.
// Composes with: w28/auth, w29/reputation-universalista,
// w29/mentorship-matching.
// ============================================================

// ============================================================
// TYPES
// ============================================================

export type ProfileVisibility = "public" | "followers_only" | "private";

export type FollowStatus = "active" | "muted" | "blocked";

export type FollowButtonState = "not_following" | "following" | "requested" | "mutual";

export interface SocialLink {
  platform: string;
  url: string;
}

export interface PublicProfile {
  userId: string;
  displayName: string;
  username: string;
  bio: string;
  avatarUrl: string | null;
  coverUrl: string | null;
  joinedAt: Date;
  visibility: ProfileVisibility;
  verified: boolean;
  socialLinks: SocialLink[];
}

export interface ProfileStats {
  userId: string;
  postsCount: number;
  followersCount: number;
  followingCount: number;
  reputationScore: number;
  badgesCount: number;
  mentorshipSessions: number;
}

export interface FollowRelationship {
  followerId: string;
  followeeId: string;
  status: FollowStatus;
  followedAt: Date;
  notificationsEnabled: boolean;
}

export interface ProfilePost {
  id: string;
  postId: string;
  title: string;
  excerpt: string;
  publishedAt: Date;
  reactions: number;
  commentCount: number;
}

export interface ProfileViewModel {
  profile: PublicProfile;
  stats: ProfileStats;
  isOwnProfile: boolean;
  canFollow: boolean;
  isFollowing: boolean;
}

export interface UnfollowResult {
  success: boolean;
  relationship: null;
}

export interface FollowersSummary {
  followers: string[];
  following: string[];
  mutual: string[];
  blocked: string[];
}

export interface ProfileBadge {
  name: string;
  description: string;
  earnedAt: Date;
}

// ============================================================
// VIEW MODEL
// ============================================================

/** Bundle profile+stats+viewer context. canFollow=false when viewer is owner. */
export function buildProfileViewModel(
  profile: PublicProfile,
  stats: ProfileStats,
  isOwnProfile: boolean,
  currentUserId: string,
): ProfileViewModel {
  const sameUser = profile.userId === currentUserId;
  return {
    profile,
    stats,
    isOwnProfile: isOwnProfile || sameUser,
    canFollow: !isOwnProfile && !sameUser,
    isFollowing: sameUser,
  };
}

// ============================================================
// VISIBILITY
// ============================================================

/** public→all, followers_only→must follow, private→owner only. */
export function canViewProfile(
  profile: PublicProfile,
  viewerId: string,
  isFollower: boolean,
): boolean {
  if (profile.userId === viewerId) return true;
  if (profile.visibility === "public") return true;
  if (profile.visibility === "followers_only") return isFollower;
  return false;
}

/** Private-account flag forces visibility=private; otherwise any value ok. */
export function validateProfileVisibility(
  visibility: ProfileVisibility,
  isPrivateAccount: boolean,
): boolean {
  if (isPrivateAccount) return visibility === "private";
  return visibility === "public" || visibility === "followers_only" || visibility === "private";
}

// ============================================================
// DIRECT MESSAGE GATE
// ============================================================

/** DM allowed when public, or viewer is owner, or viewer is follower. */
export function canSendDirectMessage(
  viewerId: string,
  targetProfile: PublicProfile,
  isFollowing: boolean,
): boolean {
  if (targetProfile.userId === viewerId) return true;
  if (targetProfile.visibility === "public") return true;
  return isFollowing;
}

// ============================================================
// FOLLOW MUTATIONS
// ============================================================

/** Create follow. Private targets disable notifications pending approval. */
export function followProfile(
  followerId: string,
  followeeId: string,
  targetVisibility: ProfileVisibility = "public",
): FollowRelationship {
  return {
    followerId,
    followeeId,
    status: "active",
    followedAt: new Date(),
    notificationsEnabled: targetVisibility !== "private",
  };
}

/** Unfollow destroys the relationship. */
export function unfollowProfile(_relationship: FollowRelationship | null): UnfollowResult {
  return { success: true, relationship: null };
}

/** Mute keeps the follow but silences notifications. */
export function muteProfile(relationship: FollowRelationship): FollowRelationship {
  return { ...relationship, status: "muted", notificationsEnabled: false };
}

/** Block prevents further contact. */
export function blockProfile(followerId: string, followeeId: string): FollowRelationship {
  return {
    followerId,
    followeeId,
    status: "blocked",
    followedAt: new Date(),
    notificationsEnabled: false,
  };
}

// ============================================================
// FOLLOW QUERIES
// ============================================================

/** Active or muted relationship against followeeId counts as following. */
export function isFollowing(
  relationship: FollowRelationship | null | undefined,
  followeeId: string,
): boolean {
  if (!relationship) return false;
  if (relationship.followeeId !== followeeId) return false;
  return relationship.status === "active" || relationship.status === "muted";
}

/** Followers of userId (blocked excluded). */
export function getFollowers(
  userId: string,
  relationships: FollowRelationship[],
): string[] {
  return relationships
    .filter((r) => r.followeeId === userId && r.status !== "blocked")
    .map((r) => r.followerId);
}

/** Users that userId follows (active or muted). */
export function getFollowing(
  userId: string,
  relationships: FollowRelationship[],
): string[] {
  return relationships
    .filter(
      (r) => r.followerId === userId && (r.status === "active" || r.status === "muted"),
    )
    .map((r) => r.followeeId);
}

/** Users who follow BOTH userAId and userBId (intersection of follower sets). */
export function getMutualFollows(
  userAId: string,
  userBId: string,
  relationships: FollowRelationship[],
): string[] {
  const aSet = new Set(getFollowers(userAId, relationships));
  return getFollowers(userBId, relationships).filter((id) => aSet.has(id));
}

/** Bulk breakdown: followers, following, mutual, blocked. */
export function summarizeFollowers(
  relationships: FollowRelationship[],
  userId: string,
): FollowersSummary {
  const followers = getFollowers(userId, relationships);
  const following = getFollowing(userId, relationships);
  const fSet = new Set(following);
  const mutual = followers.filter((id) => fSet.has(id));
  const blocked = relationships
    .filter((r) => r.followerId === userId && r.status === "blocked")
    .map((r) => r.followeeId);
  return { followers, following, mutual, blocked };
}

// ============================================================
// URL + BADGES
// ============================================================

/** Canonical profile URL: <baseUrl>/@<username>. */
export function formatProfileUrl(username: string, baseUrl: string): string {
  const cleanBase = baseUrl.replace(/\/+$/, "");
  const handle = username.replace(/^@/, "");
  return `${cleanBase}/@${handle}`;
}

/** Earned badges derived from stats. Top Mentor ties to mentorship+reputation. */
export function buildProfileBadges(stats: ProfileStats): ProfileBadge[] {
  const now = new Date();
  const badges: ProfileBadge[] = [];

  if (stats.postsCount >= 1) {
    badges.push({ name: "First Post", description: "Primeira publicação na plataforma.", earnedAt: now });
  }
  if (stats.followersCount >= 10) {
    badges.push({ name: "10 Followers", description: "Conquistou 10 seguidores.", earnedAt: now });
  }
  if (stats.followersCount >= 100) {
    badges.push({ name: "100 Followers", description: "Alcançou 100 seguidores.", earnedAt: now });
  }
  if (stats.followersCount >= 1000) {
    badges.push({ name: "1K Followers", description: "Influenciador — 1.000 seguidores.", earnedAt: now });
  }
  if (stats.mentorshipSessions >= 25 && stats.reputationScore >= 800) {
    badges.push({ name: "Top Mentor", description: "Mentor ativo (>= 25 sessões, reputação >= 800).", earnedAt: now });
  }
  if (stats.reputationScore >= 500) {
    badges.push({ name: "Reputação Elevada", description: "Score universalista >= 500.", earnedAt: now });
  }
  if (stats.badgesCount >= 10) {
    badges.push({ name: "Condecorado", description: "Acumulou 10+ badges.", earnedAt: now });
  }
  return badges;
}
