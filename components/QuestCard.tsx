
import React from 'react';
import { Quest, QuestType } from '../types';

interface QuestCardProps {
  quest: Quest;
  onToggleComplete: (id: string) => void;
  onUpload: (id: string) => void;
}

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onToggleComplete, onUpload }) => {
  const isWeekly = quest.type === QuestType.WEEKLY;
  
  // Als de quest voltooid is, doen we alsof de voortgang 100% is voor de balk
  const currentProgress = quest.completed ? (quest.goal || 0) : (quest.progress || 0);
  const goal = quest.goal || 1;
  const progressPercent = Math.min((currentProgress / goal) * 100, 100);

  return (
    <div className={`p-6 neumorphic mb-6 transition-all ${quest.completed ? 'border-2 border-emerald-400/30' : 'hover:scale-[1.02]'}`}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className={`text-xs font-bold px-3 py-1 rounded-full text-white mb-2 inline-block ${
            quest.category === 'Sport' ? 'bg-orange-500' : 
            quest.category === 'Focus' ? 'bg-indigo-500' :
            quest.category === 'Ontspanning' ? 'bg-emerald-500' : 'bg-pink-500'
          }`}>
            {quest.category}
          </span>
          <h3 className="text-xl font-extrabold text-slate-800 leading-tight">{quest.title}</h3>
        </div>
        <div className="text-right">
          <span className={`font-black text-lg ${quest.completed ? 'text-emerald-600' : 'text-indigo-600'}`}>
            {quest.completed ? '✓ ' : '+'}{quest.points} pts
          </span>
          <p className="text-[10px] text-slate-400 font-medium">
            {quest.participantsCount.toLocaleString()} {quest.participantsCount === 1 ? 'persoon doet' : 'mensen doen'} dit
          </p>
        </div>
      </div>
      
      <p className="text-slate-600 mb-6 font-medium leading-relaxed">{quest.description}</p>

      {isWeekly && (
        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
            <span>Voortgang</span>
            <span>{currentProgress} / {goal}</span>
          </div>
          <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden neumorphic-inset">
            <div 
              className={`h-full transition-all duration-700 ease-out ${quest.completed ? 'bg-emerald-500' : 'bg-gradient-to-r from-indigo-500 to-purple-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        {!quest.completed ? (
          <>
            <button 
              onClick={() => onToggleComplete(quest.id)}
              className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-colors"
            >
              Voltooien
            </button>
          </>
        ) : (
          <div className="flex gap-2 w-full">
            <button 
              onClick={() => onToggleComplete(quest.id)}
              className="flex-1 py-3 text-center text-emerald-600 font-black flex items-center justify-center gap-2 hover:bg-emerald-50 rounded-2xl transition-colors group"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
              </svg>
              <span className="group-hover:hidden uppercase">Voltooid</span>
              <span className="hidden group-hover:inline uppercase text-slate-400 font-bold">Ongedaan maken</span>
            </button>
            <button 
              onClick={() => onUpload(quest.id)}
              title="Deel resultaat"
              className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl shadow-sm border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              📷
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
