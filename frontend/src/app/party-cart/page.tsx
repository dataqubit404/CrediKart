'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

interface Member {
  id: number;
  name: string;
  avatar: string;
  role: 'HOST' | 'MEMBER';
  status: 'Shopping' | 'Idle' | 'Ready';
  color: string;
}

export default function PartyCartPage() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isLobbyActive, setIsLobbyActive] = useState(false);

  // Part 2 states
  const [myStatus, setMyStatus] = useState<'Shopping' | 'Idle' | 'Ready'>('Shopping');
  const [members, setMembers] = useState<Member[]>([
    { id: 1, name: 'Arjun (You)', avatar: '👑', role: 'HOST', status: 'Shopping', color: '#F7D300' },
    { id: 2, name: 'Priya', avatar: '🥑', role: 'MEMBER', status: 'Shopping', color: '#10B981' },
    { id: 3, name: 'Rahul', avatar: '🥩', role: 'MEMBER', status: 'Idle', color: '#3B82F6' },
    { id: 4, name: 'Tanya', avatar: '🍵', role: 'MEMBER', status: 'Ready', color: '#EC4899' },
  ]);
  const [activities, setActivities] = useState<string[]>([
    '👑 Arjun created the session lobby',
    '👥 Priya joined the party cart',
    '👥 Rahul joined the party cart',
    '👥 Tanya joined the party cart',
  ]);

  const activityEndRef = useRef<HTMLDivElement>(null);

  const generateCode = () => {
    const num = Math.floor(100 + Math.random() * 900);
    const words = ['VIP', 'GOLD', 'CLUB', 'LUXE', 'ELITE'];
    const word = words[Math.floor(Math.random() * words.length)];
    const code = `LUXE-${num}-${word}`;
    setSessionCode(code);
    toast.success('Luxe shopping session created!');
  };

  const handleJoin = () => {
    if (!joinCodeInput.trim()) {
      toast.error('Please enter a valid invite code');
      return;
    }
    const cleanCode = joinCodeInput.trim().toUpperCase();
    if (!cleanCode.startsWith('LUXE-')) {
      toast.error('Invalid code format. Must start with LUXE-');
      return;
    }
    setSessionCode(cleanCode);
    setIsLobbyActive(true);
    toast.success(`Successfully joined session ${cleanCode}!`);
  };

  const handleStartHost = () => {
    if (sessionCode) {
      setIsLobbyActive(true);
      toast.success('Entering Luxe Party Cart Lobby...');
    }
  };

  const handleLeaveLobby = () => {
    setIsLobbyActive(false);
    setSessionCode(null);
    setJoinCodeInput('');
    setMyStatus('Shopping');
    setActivities([
      '👑 Arjun created the session lobby',
      '👥 Priya joined the party cart',
      '👥 Rahul joined the party cart',
      '👥 Tanya joined the party cart',
    ]);
    toast.success('Session ended.');
  };

  const copyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast.success('Invite code copied to clipboard!');
    }
  };

  const handleStatusChange = (newStatus: 'Shopping' | 'Idle' | 'Ready') => {
    setMyStatus(newStatus);
    setMembers(prev => prev.map(m => m.id === 1 ? { ...m, status: newStatus } : m));
    setActivities(prev => [...prev, `⚡ Arjun updated status to ${newStatus.toUpperCase()}`]);
    toast.success(`Status updated to ${newStatus}`);
  };

  // Simulate active group activity log stream
  useEffect(() => {
    if (!isLobbyActive) return;

    const mockLogs = [
      '🥩 Arjun added A5 Wagyu Steak to the shared cart',
      '💬 Priya: "Added some A5 Wagyu for our dinner party!"',
      '🥑 Priya added Artisan Avocado Toast to the shared cart',
      '⚡ Rahul changed status to Idle',
      '💬 Rahul: "Checking out the dessert selection..."',
      '🍵 Tanya added Organic Ceremonial Matcha to the shared cart',
      '💬 Tanya: "Got the premium grade Matcha!"',
      '✨ Tanya marked status as READY',
      '🍇 Priya added Organic Blueberries to the shared cart',
      '💬 Rahul: "Looks good, I will get the beverages."',
      '✓ Rahul marked status as READY',
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < mockLogs.length) {
        const nextLog = mockLogs[currentIndex];
        
        // Update activities
        setActivities(prev => [...prev, nextLog]);

        // Dynamically update member statuses if the log suggests a status change
        if (nextLog.includes('Rahul changed status to Idle')) {
          setMembers(prev => prev.map(m => m.id === 3 ? { ...m, status: 'Idle' } : m));
        } else if (nextLog.includes('Tanya marked status as READY')) {
          setMembers(prev => prev.map(m => m.id === 4 ? { ...m, status: 'Ready' } : m));
        } else if (nextLog.includes('Rahul marked status as READY')) {
          setMembers(prev => prev.map(m => m.id === 3 ? { ...m, status: 'Ready' } : m));
        }

        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isLobbyActive]);

  // Scroll to bottom of activity logs
  useEffect(() => {
    if (activityEndRef.current) {
      activityEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activities]);

  return (
    <div className="min-h-screen bg-black text-white relative flex flex-col justify-between overflow-hidden font-sans">
      {/* Immersive background decoration */}
      <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-brand-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="sticky top-0 z-50 p-6 bg-gradient-to-b from-black/80 to-transparent border-b border-white/5 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/dashboard" className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">
            <span className="text-xl">←</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center text-black font-black text-sm shadow-[0_0_10px_rgba(247,211,0,0.3)]">
              CP
            </div>
            <span className="font-display font-black text-lg tracking-widest uppercase text-white drop-shadow-md">
              Party Cart
            </span>
          </div>
          <div className="w-10 h-10" /> {/* Spacer */}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10 w-full max-w-7xl mx-auto">
        {!isLobbyActive ? (
          /* Hub Landing Screen */
          <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-500 animate-fade-up mx-auto">
            <div className="text-center mb-10">
              <span className="text-5xl mb-4 inline-block drop-shadow-md">👥</span>
              <h2 className="font-display font-black text-3xl md:text-4xl text-white tracking-tight leading-none bg-gradient-to-r from-white via-gray-200 to-brand-300 bg-clip-text text-transparent">
                Luxe Party Cart
              </h2>
              <p className="text-gray-400 mt-3 text-sm font-medium leading-relaxed max-w-md mx-auto">
                Host a collaborative shopping session. Invite friends to vote on items, react in real-time, and split the bill with CrediPay.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-stretch">
              {/* Creator Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-brand-500/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-brand-500/0 blur-[40px] rounded-full group-hover:bg-brand-500/5 transition-all duration-500 pointer-events-none" />
                <div>
                  <div className="text-3xl mb-4">👑</div>
                  <h3 className="text-lg font-black text-white tracking-tight">Host a Session</h3>
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed font-medium">
                    Generate an elite invite code to start shopping collaboratively as the Party Leader.
                  </p>
                </div>
                <div className="mt-8">
                  {sessionCode ? (
                    <div className="flex flex-col gap-3">
                      <div 
                        onClick={copyCode}
                        className="bg-black/40 border border-brand-500/30 rounded-xl px-4 py-3 text-center cursor-pointer hover:bg-brand-500/5 active:scale-95 transition-all"
                      >
                        <span className="font-mono text-sm font-black tracking-widest text-brand-400">{sessionCode}</span>
                        <p className="text-[10px] text-gray-500 mt-1 uppercase font-bold tracking-wider">Click to copy code</p>
                      </div>
                      <button 
                        onClick={handleStartHost}
                        className="w-full bg-brand-500 text-black py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-brand-400 transition-all shadow-[0_0_15px_rgba(247,211,0,0.3)] hover:scale-[1.02] active:scale-95"
                      >
                        Enter Lobby →
                      </button>
                    </div>
                  ) : (
                    <button 
                      onClick={generateCode}
                      className="w-full bg-white/5 border border-white/10 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all active:scale-95"
                    >
                      Create Session
                    </button>
                  )}
                </div>
              </div>

              {/* Joiner Card */}
              <div className="bg-white/5 border border-white/10 rounded-3xl p-6 flex flex-col justify-between hover:border-purple-500/30 transition-all duration-300 relative group overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/0 blur-[40px] rounded-full group-hover:bg-purple-500/5 transition-all duration-500 pointer-events-none" />
                <div>
                  <div className="text-3xl mb-4">🔑</div>
                  <h3 className="text-lg font-black text-white tracking-tight">Join a Session</h3>
                  <p className="text-gray-400 text-xs mt-1.5 leading-relaxed font-medium">
                    Enter an active code shared by a friend to jump into their shopping lobby.
                  </p>
                </div>
                <div className="mt-8 flex flex-col gap-3">
                  <input 
                    type="text" 
                    placeholder="Enter code (e.g. LUXE-123-VIP)"
                    value={joinCodeInput}
                    onChange={e => setJoinCodeInput(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-center text-sm font-semibold tracking-wider placeholder-gray-600 focus:outline-none focus:border-purple-500/60 focus:ring-1 focus:ring-purple-500/60 transition-all uppercase"
                  />
                  <button 
                    onClick={handleJoin}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-white py-3 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-[0_0_15px_rgba(147,51,234,0.3)] hover:scale-[1.02] active:scale-95"
                  >
                    Join Session
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Active Shared Session Lobby Screen (Fleshed out in Part 2) */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 w-full transition-all duration-500 animate-fade-in pointer-events-auto">
            {/* Left Column: Session Card & Presence List */}
            <div className="lg:col-span-1 flex flex-col gap-6">
              {/* Session Control Panel */}
              <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-400 mb-1">Active Luxe Session</p>
                <div className="flex justify-between items-center gap-3">
                  <h3 className="font-mono text-xl font-black tracking-widest text-white leading-none">
                    {sessionCode}
                  </h3>
                  <button 
                    onClick={copyCode}
                    className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 active:scale-95 transition-all text-[10px] font-black tracking-wider uppercase text-gray-300"
                  >
                    📋 Copy
                  </button>
                </div>
                <div className="w-full h-px bg-white/10 my-4" />
                
                {/* User Status Toggler */}
                <p className="text-xs font-black uppercase tracking-wider text-gray-500 mb-3">Your Shopping Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {(['Shopping', 'Idle', 'Ready'] as const).map(status => {
                    const styles = {
                      Shopping: 'border-purple-500/30 text-purple-400 bg-purple-500/5 hover:bg-purple-500/10 active:border-purple-500',
                      Idle: 'border-amber-500/30 text-amber-400 bg-amber-500/5 hover:bg-amber-500/10 active:border-amber-500',
                      Ready: 'border-green-500/30 text-green-400 bg-green-500/5 hover:bg-green-500/10 active:border-green-500'
                    };
                    const activeStyles = {
                      Shopping: 'border-purple-500 bg-purple-500/20 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]',
                      Idle: 'border-amber-500 bg-amber-500/20 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.3)]',
                      Ready: 'border-green-500 bg-green-500/20 text-green-300 shadow-[0_0_15px_rgba(34,197,94,0.3)]'
                    };
                    return (
                      <button
                        key={status}
                        onClick={() => handleStatusChange(status)}
                        className={`py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300 ${myStatus === status ? activeStyles[status] : styles[status]}`}
                      >
                        {status}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Connected Members Presence List */}
              <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex-1 flex flex-col justify-between min-h-[300px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-display font-black text-sm uppercase tracking-widest text-white">
                      Shopping Party
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-[10px] font-black">
                      {members.length} Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    {members.map(m => (
                      <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-white/5 border border-white/5 hover:border-white/10 transition-all duration-300">
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl bg-white/5 border flex items-center justify-center text-lg relative"
                            style={{ borderColor: `${m.color}30` }}
                          >
                            {m.avatar}
                            <span 
                              className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-black"
                              style={{ 
                                backgroundColor: 
                                  m.status === 'Ready' ? '#10B981' : 
                                  m.status === 'Idle' ? '#F59E0B' : '#8B5CF6' 
                              }}
                            />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-white leading-none">{m.name}</p>
                            <p className="text-[9px] font-bold text-gray-500 uppercase tracking-widest mt-1">
                              {m.role}
                            </p>
                          </div>
                        </div>

                        <span 
                          className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${
                            m.status === 'Ready' ? 'bg-green-500/10 border-green-500/30 text-green-400' :
                            m.status === 'Idle' ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                            'bg-purple-500/10 border-purple-500/30 text-purple-400'
                          }`}
                        >
                          {m.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={handleLeaveLobby}
                  className="mt-6 w-full py-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/20 transition-all active:scale-95 text-center"
                >
                  Leave Session
                </button>
              </div>
            </div>

            {/* Right Columns: Activity Log (Part 2) & Shared Items Feed Placeholder (Part 3) */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Activity Log Feed (Live Chat/System logs) */}
              <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-6 shadow-[0_8px_32px_rgba(0,0,0,0.6)] h-64 flex flex-col">
                <h4 className="font-display font-black text-sm uppercase tracking-widest text-white/50 mb-3 shrink-0">
                  Live Activity Feed
                </h4>
                
                {/* Auto-scrolling logs container */}
                <div className="flex-1 overflow-y-auto pr-2 flex flex-col gap-2.5 hide-scrollbar">
                  {activities.map((act, index) => {
                    const isSystem = act.startsWith('👑') || act.startsWith('👥') || act.startsWith('⚡') || act.startsWith('✓') || act.startsWith('✨');
                    const isChat = act.includes(':');
                    
                    return (
                      <div 
                        key={index}
                        className={`text-xs font-medium px-4 py-2.5 rounded-xl border transition-all duration-300 ${
                          isChat ? 'bg-brand-500/5 border-brand-500/10 text-brand-300' :
                          isSystem ? 'bg-white/5 border-white/5 text-gray-300' :
                          'bg-emerald-500/5 border-emerald-500/10 text-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.05)]'
                        }`}
                      >
                        {act}
                      </div>
                    );
                  })}
                  <div ref={activityEndRef} />
                </div>
              </div>

              {/* Shared Party Cart Items - Part 3 Placeholder */}
              <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.6)] flex-1 flex flex-col items-center justify-center border-dashed min-h-[250px] relative overflow-hidden">
                {/* Ambient glow inside */}
                <div className="absolute w-40 h-40 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                <span className="text-4xl mb-3 opacity-30 select-none">🛒</span>
                <h4 className="font-display font-black text-base text-white/50 tracking-tight uppercase select-none">
                  Shared Cart Feed
                </h4>
                <p className="text-gray-500 text-xs font-medium mt-1 uppercase tracking-wider select-none text-center max-w-xs leading-relaxed">
                  Lobby items feed is configured. Collaborative cart lists will load in Part 3.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="p-6 text-center text-[10px] font-semibold text-gray-600 uppercase tracking-widest">
        CrediKart Premium Party Cart Experience · Secured by CrediPay
      </footer>
    </div>
  );
}
