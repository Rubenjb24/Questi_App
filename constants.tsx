
import { Quest, QuestType, Badge, Post, LeaderboardEntry } from './types';

export const INITIAL_QUESTS: Quest[] = [
  {
    id: 'd1',
    title: '10 Squats',
    description: 'Snelle energieboost! Doe 10 squats waar je ook bent.',
    points: 50,
    type: QuestType.DAILY,
    participantsCount: 12450,
    category: 'Sport'
  },
  {
    id: 'd2',
    title: 'Digitale Detox',
    description: 'Leg je telefoon 5 minuten weg en kijk naar buiten.',
    points: 30,
    type: QuestType.DAILY,
    participantsCount: 8900,
    category: 'Ontspanning'
  },
  {
    id: 'd3',
    title: 'Complimentje',
    description: 'Stuur een lief berichtje naar iemand die je al even niet gesproken hebt.',
    points: 40,
    type: QuestType.DAILY,
    participantsCount: 5200,
    category: 'Sociaal'
  },
  {
    id: 'w1',
    title: 'Wekelijkse Runner',
    description: 'Ren deze week in totaal 5 kilometer.',
    points: 500,
    type: QuestType.WEEKLY,
    participantsCount: 34000,
    category: 'Sport',
    progress: 2.4,
    goal: 5.0
  },
  {
    id: 'w2',
    title: 'Focus Meester',
    description: 'Log 4 uur aan gefocuste werksessies.',
    points: 400,
    type: QuestType.WEEKLY,
    participantsCount: 15600,
    category: 'Focus',
    progress: 1,
    goal: 4
  }
];

export const INITIAL_BADGES: Badge[] = [
  { id: 'b1', name: 'Vroege Vogel', icon: '🌅', description: 'Voltooi een quest voor 08:00', unlocked: true },
  { id: 'b2', name: 'Week Strijder', icon: '⚔️', description: 'Voltooi alle weekquests', unlocked: false },
  { id: 'b3', name: 'Reeks van 7', icon: '🔥', description: 'Behaal een streak van 7 dagen', unlocked: true },
  { id: 'b4', name: 'Sociaal Dier', icon: '🦋', description: 'Verdien 100 punten in sociale quests', unlocked: false }
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'p1',
    userId: 'u1',
    userName: 'Thomas V.',
    userAvatar: 'https://picsum.photos/100/100?random=1',
    questTitle: '10 Squats',
    caption: 'Tussen het programmeren door even die beentjes laten branden! 🔥 #fitcheck',
    imageUrl: 'https://picsum.photos/400/300?random=10',
    likes: 24,
    timestamp: '2u geleden'
  },
  {
    id: 'p2',
    userId: 'u2',
    userName: 'Sarah de Groot',
    userAvatar: 'https://picsum.photos/100/100?random=2',
    questTitle: 'Digitale Detox',
    caption: 'Bizar hoe fijn het is om even 5 minuten NIET naar een scherm te staren. Rust. 🍃',
    imageUrl: 'https://picsum.photos/400/300?random=11',
    likes: 12,
    timestamp: '4u geleden'
  },
  {
    id: 'p3',
    userId: 'u3',
    userName: 'Lucas M.',
    userAvatar: 'https://picsum.photos/100/100?random=3',
    questTitle: 'Wekelijkse Runner',
    caption: 'De eerste kilometers zitten erop voor deze week! Lekker tempo te pakken vandaag.',
    imageUrl: 'https://picsum.photos/400/300?random=12',
    likes: 89,
    timestamp: '5u geleden'
  },
  {
    id: 'p4',
    userId: 'u4',
    userName: 'Emma de Wit',
    userAvatar: 'https://picsum.photos/100/100?random=4',
    questTitle: 'Complimentje',
    caption: 'Mijn beste vriendin verrast met een lief appje. Het kleine gebaar doet het hem! ✨',
    imageUrl: 'https://picsum.photos/400/300?random=13',
    likes: 45,
    timestamp: '6u geleden'
  },
  {
    id: 'p5',
    userId: 'u5',
    userName: 'Bram Bakker',
    userAvatar: 'https://picsum.photos/100/100?random=5',
    questTitle: 'Focus Meester',
    caption: 'Pomodoro timer aan en gaan. Die deadline van morgen gaat me niet tegenhouden! 🚀',
    imageUrl: 'https://picsum.photos/400/300?random=14',
    likes: 31,
    timestamp: '8u geleden'
  }
];

export const GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { id: 'l1', name: 'Max Power', points: 18450, rank: 1 },
  { id: 'l2', name: 'Lara Croft', points: 17200, rank: 2 },
  { id: 'l3', name: 'CyberSam', points: 16100, rank: 3 },
  { id: 'l4', name: 'EliteQuest', points: 15900, rank: 4 },
  { id: 'l5', name: 'ProGamer99', points: 14200, rank: 5 },
  { id: 'l_me', name: 'Jij', points: 2450, rank: 347 }
];
