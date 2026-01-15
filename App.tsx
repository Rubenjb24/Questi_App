
import React, { useState, useEffect } from 'react';
import { Quest, QuestType, Post, User, Comment, LeaderboardEntry } from './types';
import { INITIAL_QUESTS, INITIAL_BADGES, INITIAL_POSTS, GLOBAL_LEADERBOARD } from './constants';
import { QuestCard } from './components/QuestCard';

type Tab = 'quests' | 'social' | 'stats' | 'profile';
type LeaderboardTab = 'global' | 'friends';

// Helper to get consistent vector avatars
const getAvatar = (seed: string) => `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9`;

// Available images for selection
const AVAILABLE_POST_IMAGES = [
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&q=80',
  'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&q=80',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=500&q=80',
  'https://images.unsplash.com/photo-1434494878577-86c23bdd0639?w=500&q=80',
  'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=500&q=80',
  'https://images.unsplash.com/photo-1594882645126-14020914d58d?w=500&q=80',
];

const HISTORICAL_QUESTS_13_DEC: Quest[] = [
  {
    id: 'h13-1',
    title: 'Gezonde Lunch',
    description: 'Eet een lunch met minimaal 2 verschillende soorten groenten.',
    points: 40,
    type: QuestType.DAILY,
    participantsCount: 14200,
    category: 'Sport',
    completed: true
  },
  {
    id: 'h13-2',
    title: 'Traplopen',
    description: 'Neem vandaag de trap in plaats van de lift of roltrap.',
    points: 30,
    type: QuestType.DAILY,
    participantsCount: 11500,
    category: 'Sport',
    completed: true
  },
  {
    id: 'h13-3',
    title: 'Leesmoment',
    description: 'Lees 15 minuten in een fysiek boek of e-reader.',
    points: 50,
    type: QuestType.DAILY,
    participantsCount: 9200,
    category: 'Focus',
    completed: false
  }
];

const HISTORICAL_QUESTS_12_DEC: Quest[] = [
  {
    id: 'h12-1',
    title: 'Water Drinken',
    description: 'Drink 2 liter water gedurende de dag.',
    points: 20,
    type: QuestType.DAILY,
    participantsCount: 18000,
    category: 'Sport',
    completed: true
  },
  {
    id: 'h12-2',
    title: 'Geen Suiker',
    description: 'Eet vandaag geen toegevoegde suikers.',
    points: 60,
    type: QuestType.DAILY,
    participantsCount: 7400,
    category: 'Sport',
    completed: false
  },
  {
    id: 'h12-3',
    title: 'Bel een vriend',
    description: 'Bel iemand op om gewoon even bij te praten.',
    points: 50,
    type: QuestType.DAILY,
    participantsCount: 6100,
    category: 'Sociaal',
    completed: true
  }
];

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('quests');
  const [leaderboardTab, setLeaderboardTab] = useState<LeaderboardTab>('global');
  const [quests, setQuests] = useState<Quest[]>(INITIAL_QUESTS);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [commentInput, setCommentInput] = useState<{ [key: string]: string }>({});
  
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 11, 1)); // Dec 2025
  const [selectedDate, setSelectedDate] = useState<number>(14);

  // New/Edit post state
  const [newPostCaption, setNewPostCaption] = useState('');
  const [selectedQuestId, setSelectedQuestId] = useState('');
  const [selectedImageUrl, setSelectedImageUrl] = useState('');
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [activeActionsPostId, setActiveActionsPostId] = useState<string | null>(null);

  const [user, setUser] = useState<User>({
    points: 2450,
    streak: 5,
    level: 12,
    name: 'Jij',
    avatar: getAvatar('me-questi-user')
  });

  const [userRank, setUserRank] = useState(347);

  const generateAIComments = (postId: string, index: number): Comment[] => {
    const sets = [
      [
        { id: `c-${postId}-1`, userName: 'Lara Croft', userAvatar: getAvatar('Lara'), text: 'Lekker bezig! 💪', likes: 2, likedByMe: false },
        { id: `c-${postId}-2`, userName: 'Max Power', userAvatar: getAvatar('Max'), text: 'Die squats branden altijd zo goed haha.', likes: 0, likedByMe: false }
      ],
      [
        { id: `c-${postId}-3`, userName: 'Thomas V.', userAvatar: getAvatar('ThomasV'), text: 'Heel rustgevend dit, goeie tip!', likes: 5, likedByMe: true },
        { id: `c-${postId}-4`, userName: 'Anoniempje', userAvatar: getAvatar('Anon'), text: '5 minuten is lastiger dan het lijkt!', likes: 1, likedByMe: false }
      ]
    ];
    return sets[index % sets.length];
  };

  const [posts, setPosts] = useState<Post[]>(INITIAL_POSTS.map((p, idx) => ({
    ...p,
    userAvatar: getAvatar(p.userName),
    likedByMe: false,
    comments: generateAIComments(p.id, idx)
  })));

  const [showConfetti, setShowConfetti] = useState(false);

  const globalLeaderboardDisplay = [
    ...GLOBAL_LEADERBOARD.filter(entry => entry.rank <= 5).map(e => ({...e, avatar: getAvatar(e.name)})),
    { id: 'l_me', name: 'Jij', points: user.points, rank: userRank, avatar: user.avatar }
  ].sort((a, b) => b.points - a.points);

  const friendsRaw: Omit<LeaderboardEntry, 'rank'>[] = [
    { id: 'f1', name: 'David VDB', points: 3200 },
    { id: 'f2', name: 'Thomas the Tibb', points: 2850 },
    { id: 'f_me', name: 'Jij', points: user.points },
    { id: 'f3', name: 'Nickie U', points: 2100 },
    { id: 'f4', name: 'Allard Manneveen', points: 1950 },
    { id: 'f5', name: 'Maarinus Goose', points: 1800 }
  ];

  const friendsLeaderboardDisplay: LeaderboardEntry[] = friendsRaw
    .sort((a, b) => b.points - a.points)
    .map((entry, index) => ({
      ...entry,
      rank: index + 1,
      // Fixed avatars for consistent look
      avatar: entry.name === 'Jij' ? user.avatar : getAvatar(entry.name)
    }));

  const currentLeaderboard = leaderboardTab === 'global' ? globalLeaderboardDisplay : friendsLeaderboardDisplay;

  const handleToggleQuest = (id: string) => {
    if (selectedDate !== 14) return;
    setQuests(prev => prev.map(q => {
      if (q.id === id) {
        const becomingCompleted = !q.completed;
        setUser(currentUser => ({
          ...currentUser,
          points: becomingCompleted ? currentUser.points + q.points : currentUser.points - q.points
        }));
        const rankChange = Math.max(1, Math.floor(q.points / 10));
        setUserRank(currentRank => becomingCompleted ? Math.max(6, currentRank - rankChange) : Math.min(999, currentRank + rankChange));
        if (becomingCompleted) {
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        }
        return { ...q, completed: becomingCompleted };
      }
      return q;
    }));
  };

  const handleLikePost = (postId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        const isLiked = !!p.likedByMe;
        return { ...p, likes: isLiked ? p.likes - 1 : p.likes + 1, likedByMe: !isLiked };
      }
      return p;
    }));
  };

  const handleLikeComment = (postId: string, commentId: string) => {
    setPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          comments: p.comments?.map(c => {
            if (c.id === commentId) {
              const isLiked = !!c.likedByMe;
              return { ...c, likes: (c.likes || 0) + (isLiked ? -1 : 1), likedByMe: !isLiked };
            }
            return c;
          })
        };
      }
      return p;
    }));
  };

  const handleAddComment = (postId: string) => {
    const text = commentInput[postId];
    if (!text || !text.trim()) return;
    const newComment: Comment = {
      id: Math.random().toString(),
      userName: user.name,
      userAvatar: user.avatar,
      text: text,
      likes: 0,
      likedByMe: false
    };
    setPosts(prev => prev.map(p => {
      if (p.id === postId) return { ...p, comments: [...(p.comments || []), newComment] };
      return p;
    }));
    setCommentInput(prev => ({ ...prev, [postId]: '' }));
  };

  const toggleComments = (postId: string) => {
    setExpandedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(postId)) newSet.delete(postId);
      else newSet.add(postId);
      return newSet;
    });
  };

  const handleUpload = (id: string) => {
    if (selectedDate !== 14) return;
    const quest = quests.find(q => q.id === id);
    if (!quest) return;
    
    // Pre-fill state for the modal
    setSelectedQuestId(id);
    setNewPostCaption('');
    setSelectedImageUrl('');
    setIsPostModalOpen(true);
  };

  const handleCreateCustomPost = () => {
    if (!selectedQuestId || !selectedImageUrl) return;
    const quest = quests.find(q => q.id === selectedQuestId);
    if (!quest) return;

    const newPost: Post = {
      id: Math.random().toString(),
      userId: 'me',
      userName: user.name,
      userAvatar: user.avatar,
      questTitle: quest.title,
      imageUrl: selectedImageUrl,
      caption: newPostCaption,
      likes: 0,
      timestamp: 'Zojuist',
      likedByMe: false,
      comments: [],
    };

    setPosts([newPost, ...posts]);
    setIsPostModalOpen(false);
    setNewPostCaption('');
    setSelectedQuestId('');
    setSelectedImageUrl('');
    setActiveTab('social');
  };

  const handleDeletePost = (id: string) => {
    setPosts(prev => prev.filter(p => p.id !== id));
    setActiveActionsPostId(null);
  };

  const handleStartEdit = (post: Post) => {
    setEditingPostId(post.id);
    setNewPostCaption(post.caption || '');
    setIsEditModalOpen(true);
    setActiveActionsPostId(null);
  };

  const handleSaveEdit = () => {
    if (!editingPostId) return;
    setPosts(prev => prev.map(p => 
      p.id === editingPostId ? { ...p, caption: newPostCaption } : p
    ));
    setIsEditModalOpen(false);
    setEditingPostId(null);
    setNewPostCaption('');
  };

  const changeMonth = (offset: number) => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
  };

  const monthName = currentMonth.toLocaleString('nl-NL', { month: 'long', year: 'numeric' });
  const isCurrentMonthView = currentMonth.getMonth() === 11 && currentMonth.getFullYear() === 2025;

  const getActiveQuests = () => {
    if (selectedDate === 14) return quests.filter(q => q.type === QuestType.DAILY);
    if (selectedDate === 13) return HISTORICAL_QUESTS_13_DEC;
    if (selectedDate === 12) return HISTORICAL_QUESTS_12_DEC;
    return [];
  };

  const completedQuests = quests.filter(q => q.completed);

  return (
    <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative pb-24 shadow-2xl overflow-x-hidden">
      {showConfetti && (
        <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
          <div className="text-6xl animate-bounce">✨🎉✨</div>
        </div>
      )}

      {/* Floating Action Button */}
      {activeTab === 'social' && (
        <button
          onClick={() => {
            setSelectedQuestId('');
            setNewPostCaption('');
            setSelectedImageUrl('');
            setIsPostModalOpen(true);
          }}
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-xl hover:bg-indigo-700 active:scale-95 transition-all z-40"
        >
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
      )}

      {/* Create Post Modal */}
      {isPostModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsPostModalOpen(false)} />
          <div className="relative w-full max-w-[360px] neumorphic bg-white p-6 animate-in zoom-in-95 duration-200 border border-white/20 shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Nieuwe Post</h2>
              <button onClick={() => setIsPostModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Kies Quest</label>
                <select 
                  value={selectedQuestId}
                  onChange={(e) => setSelectedQuestId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>Welke quest heb je gedaan?</option>
                  {completedQuests.length > 0 ? (
                    completedQuests.map(q => (
                      <option key={q.id} value={q.id}>{q.title}</option>
                    ))
                  ) : (
                    <option disabled>Nog geen voltooide quests vandaag</option>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Kies een foto</label>
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                  {AVAILABLE_POST_IMAGES.map((url, i) => (
                    <button
                      key={i}
                      onClick={() => setSelectedImageUrl(url)}
                      className={`flex-shrink-0 relative w-24 h-24 rounded-2xl overflow-hidden border-4 transition-all ${
                        selectedImageUrl === url ? 'border-indigo-600 scale-105 shadow-md' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={url} className="w-full h-full object-cover" alt={`Option ${i}`} />
                      {selectedImageUrl === url && (
                        <div className="absolute inset-0 bg-indigo-600/20 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Beschrijving</label>
                <textarea 
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  placeholder="Wat was je ervaring?..."
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              <div className="pt-2">
                <button 
                  disabled={!selectedQuestId || !selectedImageUrl}
                  onClick={handleCreateCustomPost}
                  className={`w-full py-4 rounded-2xl font-black text-sm shadow-lg transition-all ${
                    (selectedQuestId && selectedImageUrl) 
                      ? 'bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700 active:scale-95' 
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
                  }`}
                >
                  Plaatsen
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Post Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsEditModalOpen(false)} />
          <div className="relative w-full max-w-[340px] neumorphic bg-white p-6 animate-in zoom-in-95 duration-200 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-black text-slate-800">Bericht Bewerken</h2>
              <button onClick={() => setIsEditModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 ml-1">Beschrijving</label>
                <textarea 
                  value={newPostCaption}
                  onChange={(e) => setNewPostCaption(e.target.value)}
                  placeholder="Wat was je ervaring?..."
                  rows={4}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all resize-none"
                />
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSaveEdit}
                  className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isCalendarOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setIsCalendarOpen(false)} />
          <div className="relative w-full max-w-[340px] neumorphic bg-white p-6 animate-in zoom-in-95 duration-200 border border-white/20 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <button onClick={() => changeMonth(-1)} className="w-8 h-8 neumorphic flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-95 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M15 19l-7-7 7-7"/></svg>
                </button>
                <h2 className="text-sm font-black text-slate-800 capitalize tracking-tight">{monthName}</h2>
                <button onClick={() => changeMonth(1)} className="w-8 h-8 neumorphic flex items-center justify-center text-indigo-600 hover:scale-110 active:scale-95 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7"/></svg>
                </button>
              </div>
              <button onClick={() => setIsCalendarOpen(false)} className="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-slate-500 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </button>
            </div>
            <div className="grid grid-cols-7 gap-2 mb-4">
              {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(d => (
                <div key={d} className="text-center text-[9px] font-black text-slate-400 uppercase">{d}</div>
              ))}
              {Array.from({ length: 31 }).map((_, i) => {
                const day = i + 1;
                const hasStreak = isCurrentMonthView && day >= 10 && day <= 14;
                const isSelected = isCurrentMonthView && selectedDate === day;
                return (
                  <button 
                    key={day}
                    onClick={() => { if (isCurrentMonthView) { setSelectedDate(day); setIsCalendarOpen(false); } }}
                    className={`aspect-square rounded-xl flex flex-col items-center justify-center relative transition-all ${isSelected ? 'bg-indigo-600 text-white shadow-lg' : 'hover:bg-slate-50 text-slate-800'} ${!isCurrentMonthView ? 'opacity-20 cursor-default' : ''}`}
                  >
                    <span className="text-xs font-bold">{day}</span>
                    {hasStreak && <span className="text-[8px] absolute -top-1 -right-0.5">🔥</span>}
                  </button>
                );
              })}
            </div>
            <div className="p-3 neumorphic-inset bg-slate-50/50">
              <p className="text-[10px] font-bold text-slate-400 leading-snug">{isCurrentMonthView ? 'Kies een dag. Vlammen tonen je huidige streak van 5 dagen!' : 'Geen historie beschikbaar voor deze periode.'}</p>
            </div>
          </div>
        </div>
      )}

      <header className="p-6 sticky top-0 glass z-40">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-black text-indigo-600 tracking-tight">Questi</h1>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-orange-500 font-bold justify-end"><span>🔥</span><span>{user.streak}</span></div>
            <div className="text-indigo-600 font-black transition-all duration-300">{user.points.toLocaleString()} pts</div>
          </div>
        </div>
      </header>

      <main className="px-6 py-4">
        {activeTab === 'quests' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="mb-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 leading-tight">{selectedDate === 14 ? "Dagelijkse Questi's" : `Quests van ${selectedDate} Dec`}</h2>
                  <p className="text-sm font-bold text-slate-400">{selectedDate} December, 2025</p>
                </div>
                <button onClick={() => setIsCalendarOpen(true)} className="p-2.5 neumorphic bg-white hover:scale-105 active:scale-95 transition-all text-indigo-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" /></svg>
                </button>
              </div>
              <div className="space-y-4">
                {getActiveQuests().length > 0 ? getActiveQuests().map(quest => (
                  <div key={quest.id} className={`relative ${selectedDate !== 14 ? 'opacity-80 grayscale-[0.3]' : ''}`}>
                    {selectedDate !== 14 && <div className="absolute top-4 right-4 z-10 bg-slate-800 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-widest shadow-lg">Historie</div>}
                    <QuestCard quest={quest} onToggleComplete={handleToggleQuest} onUpload={handleUpload} />
                    {selectedDate !== 14 && <div className="absolute inset-0 z-20 cursor-not-allowed" />}
                  </div>
                )) : (
                  <div className="p-10 text-center neumorphic bg-white"><p className="text-slate-400 font-bold italic">Geen data voor deze dag</p></div>
                )}
              </div>
            </section>
            {selectedDate === 14 && (
              <section className="animate-in fade-in duration-700">
                <h2 className="text-2xl font-black text-slate-800 mb-4">Wekelijkse Bazen</h2>
                {quests.filter(q => q.type === QuestType.WEEKLY).map(quest => (
                  <QuestCard key={quest.id} quest={quest} onToggleComplete={handleToggleQuest} onUpload={handleUpload} />
                ))}
              </section>
            )}
          </div>
        )}

        {activeTab === 'social' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Community Feed</h2>
            <div className="space-y-8">
              {posts.map(post => {
                const isExpanded = expandedComments.has(post.id);
                const isOwnPost = post.userName === 'Jij';
                return (
                  <div key={post.id} className="neumorphic overflow-hidden bg-white">
                    <div className="p-4 flex items-center gap-3 relative">
                      <img src={post.userAvatar} alt={post.userName} className="w-10 h-10 rounded-full border shadow-sm bg-slate-100" />
                      <div>
                        <p className="font-bold text-slate-800 leading-none">{post.userName}</p>
                        <p className="text-xs font-bold text-indigo-500 mt-1">{post.questTitle}</p>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <span className="text-xs text-slate-400 font-medium">{post.timestamp}</span>
                        {isOwnPost && (
                          <div className="relative">
                            <button 
                              onClick={() => setActiveActionsPostId(activeActionsPostId === post.id ? null : post.id)}
                              className="p-1 text-slate-300 hover:text-slate-500 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>
                            </button>
                            {activeActionsPostId === post.id && (
                              <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-xl border border-slate-100 z-50 overflow-hidden animate-in fade-in slide-in-from-top-1 duration-200">
                                <button 
                                  onClick={() => handleStartEdit(post)}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-indigo-600 hover:bg-slate-50 border-b border-slate-50"
                                >
                                  Bewerken
                                </button>
                                <button 
                                  onClick={() => handleDeletePost(post.id)}
                                  className="w-full text-left px-4 py-2.5 text-xs font-bold text-red-500 hover:bg-red-50"
                                >
                                  Verwijderen
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                    <img src={post.imageUrl} alt="Quest actie" className="w-full aspect-[4/3] object-cover" />
                    
                    {/* Caption Section */}
                    <div className="px-5 pt-4">
                      <p className="text-sm text-slate-800 leading-relaxed">
                        <span className="font-bold mr-2">{post.userName}</span>
                        <span className="text-slate-600">{post.caption}</span>
                      </p>
                    </div>

                    <div className="px-5 py-5 flex gap-10 items-center">
                      <button onClick={() => handleLikePost(post.id)} className={`flex items-center gap-3 transition-all active:scale-90 ${post.likedByMe ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-400'}`}>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
                        <span className="text-lg font-black tracking-tight">{post.likes}</span>
                      </button>
                      <button onClick={() => toggleComments(post.id)} className={`flex items-center gap-3 transition-all active:scale-90 ${isExpanded ? 'text-indigo-600' : 'text-slate-400 hover:text-indigo-600'}`}>
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>
                        <span className="text-lg font-black tracking-tight">{post.comments?.length || 0}</span>
                      </button>
                    </div>
                    {isExpanded && (
                      <div className="px-5 pb-5 pt-2 bg-slate-50/80 border-t border-slate-100/50 animate-in slide-in-from-top-2 duration-300">
                        <div className="space-y-5 mb-6">
                          {post.comments?.map(comment => (
                            <div key={comment.id} className="flex gap-3 items-start">
                              <img src={comment.userAvatar} alt={comment.userName} className="w-8 h-8 rounded-full mt-0.5 shadow-sm border border-white bg-slate-100" />
                              <div className="flex-1">
                                <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm border border-slate-100">
                                  <p className="text-[13px] font-bold text-slate-800 leading-tight mb-1">{comment.userName}</p>
                                  <p className="text-[13px] text-slate-600 leading-snug">{comment.text}</p>
                                </div>
                                <div className="flex gap-4 mt-1.5 ml-1">
                                  <button onClick={() => handleLikeComment(post.id, comment.id)} className={`text-[10px] font-black uppercase flex items-center gap-1 ${comment.likedByMe ? 'text-indigo-600' : 'text-slate-400'}`}>
                                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>{comment.likes || 0} Vind ik leuk
                                  </button>
                                  <button className="text-[10px] font-black uppercase text-slate-400">Beantwoorden</button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-3 items-center mt-4">
                          <img src={user.avatar} className="w-8 h-8 rounded-full shadow-sm border border-white bg-slate-100" />
                          <div className="flex-1 relative">
                            <input type="text" value={commentInput[post.id] || ''} onChange={(e) => setCommentInput(prev => ({ ...prev, [post.id]: e.target.value }))} placeholder="Typ een reactie..." className="w-full bg-white border border-slate-200 rounded-2xl py-2.5 px-4 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all pr-20" onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post.id)} />
                            <button onClick={() => handleAddComment(post.id)} className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-indigo-600 text-white text-[10px] font-black rounded-xl hover:bg-indigo-700 transition-colors">Verstuur</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <section className="mb-10">
              <h2 className="text-2xl font-black text-slate-800 mb-6">Ranglijst</h2>
              <div className="flex gap-2 mb-6">
                <button onClick={() => setLeaderboardTab('global')} className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${leaderboardTab === 'global' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}>Globaal</button>
                <button onClick={() => setLeaderboardTab('friends')} className={`flex-1 py-2 px-4 rounded-xl font-bold text-sm transition-all ${leaderboardTab === 'friends' ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-600 border'}`}>Vrienden</button>
              </div>
              <div key={leaderboardTab} className="neumorphic bg-white divide-y divide-slate-100 overflow-hidden animate-in fade-in duration-300">
                {currentLeaderboard.map((entry, index) => (
                  <React.Fragment key={entry.id}>
                    {leaderboardTab === 'global' && index > 0 && entry.rank > currentLeaderboard[index - 1].rank + 1 && (
                      <div className="py-2 bg-slate-50 flex justify-center items-center gap-1">
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                        <div className="w-1 h-1 bg-slate-300 rounded-full"></div>
                      </div>
                    )}
                    <div className={`p-4 flex items-center gap-4 transition-all duration-500 ${entry.name === 'Jij' ? 'bg-indigo-50 border-y border-indigo-100' : ''}`}>
                      <span className={`w-10 text-center font-black transition-all duration-500 ${entry.rank <= 3 ? 'text-indigo-600 text-xl' : 'text-slate-400'}`}>{entry.rank}</span>
                      <img src={(entry as any).avatar} alt={entry.name} className="w-10 h-10 rounded-xl border shadow-sm bg-slate-100" />
                      <span className="font-bold text-slate-800 flex-1">{entry.name}</span>
                      <span className="font-black text-indigo-600">{entry.points.toLocaleString()}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeTab === 'profile' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h2 className="text-2xl font-black text-slate-800 mb-6">Mijn Profiel</h2>
            <div className="neumorphic p-8 text-center mb-8 bg-white">
              <div className="relative inline-block mb-4">
                <img src={user.avatar} className="w-32 h-32 rounded-[40px] shadow-xl border-4 border-white bg-slate-50" />
                <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white text-xs font-black px-3 py-1 rounded-full shadow-lg">LVL {user.level}</div>
              </div>
              <h3 className="text-2xl font-black text-slate-800">{user.name}</h3>
              <p className="text-slate-400 font-bold mb-6">Avonturier sinds Mei 2024</p>
              <div className="grid grid-cols-2 gap-4">
                <div className="neumorphic-inset p-4">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Totaal Punten</p>
                  <p className="text-xl font-black text-indigo-600 transition-all duration-300">{user.points.toLocaleString()}</p>
                </div>
                <div className="neumorphic-inset p-4">
                  <p className="text-[10px] uppercase font-black text-slate-400 mb-1">Huidige Positie</p>
                  <p className="text-xl font-black text-orange-500 transition-all duration-300">#{userRank}</p>
                </div>
              </div>
            </div>
            <section>
              <h2 className="text-xl font-black text-slate-800 mb-4">Mijn Badges</h2>
              <div className="grid grid-cols-2 gap-4">
                {INITIAL_BADGES.map(badge => (
                  <div key={badge.id} className={`p-4 rounded-3xl neumorphic border-2 ${badge.unlocked ? 'border-emerald-100 bg-white' : 'border-transparent opacity-40 grayscale bg-slate-100'}`}>
                    <div className="text-4xl mb-3">{badge.icon}</div>
                    <h4 className="font-extrabold text-slate-800 text-sm leading-tight mb-1">{badge.name}</h4>
                    <p className="text-[10px] font-bold text-slate-400">{badge.description}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto h-20 glass flex justify-around items-center px-4 rounded-t-[32px] shadow-[0_-10px_30px_rgba(0,0,0,0.05)] border-t border-slate-200 z-50">
        <button onClick={() => { setActiveTab('quests'); setSelectedDate(14); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'quests' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 11.55C9.64 9.35 6.48 8 3 8v11c3.48 0 6.64 1.35 9 3.55 2.36-2.2 5.52-3.55 9-3.55V8c-3.48 0-6.64 1.35-9 3.55zM12 8c1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3 1.34 3 3 3z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">QUESTI'S</span>
        </button>
        <button onClick={() => { setActiveTab('social'); setSelectedDate(14); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'social' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5s-3 1.34-3 3 1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">FEED</span>
        </button>
        <button onClick={() => { setActiveTab('stats'); setSelectedDate(14); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'stats' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6l2.29 2.29-4.88 4.88-4-4L2 16.59 3.41 18l6-6 4 4 6.3-6.29L22 12V6z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">RANGLIJST</span>
        </button>
        <button onClick={() => { setActiveTab('profile'); setSelectedDate(14); }} className={`flex flex-col items-center gap-1 transition-all ${activeTab === 'profile' ? 'text-indigo-600 scale-110' : 'text-slate-400'}`}>
          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
          <span className="text-[9px] font-black uppercase tracking-tighter text-center">PROFIEL</span>
        </button>
      </nav>
    </div>
  );
};

export default App;
