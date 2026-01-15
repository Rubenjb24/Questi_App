
export enum QuestType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY'
}

export interface Quest {
  id: string;
  title: string;
  description: string;
  points: number;
  type: QuestType;
  participantsCount: number;
  completed?: boolean;
  category: 'Sport' | 'Focus' | 'Ontspanning' | 'Sociaal';
  progress?: number;
  goal?: number;
}

export interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  likes?: number;
  likedByMe?: boolean;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  questTitle: string;
  imageUrl: string;
  caption?: string;
  likes: number;
  timestamp: string;
  likedByMe?: boolean;
  comments?: Comment[];
}

export interface Badge {
  id: string;
  name: string;
  icon: string;
  description: string;
  unlocked: boolean;
}

export interface User {
  points: number;
  streak: number;
  level: number;
  name: string;
  avatar: string;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  points: number;
  rank: number;
  isFriend?: boolean;
}
