'use client';
import { useState } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function PartyCartPage() {
  const [sessionCode, setSessionCode] = useState<string | null>(null);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isLobbyActive, setIsLobbyActive] = useState(false);

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
    toast.success('Session ended.');
  };

  const copyCode = () => {
    if (sessionCode) {
      navigator.clipboard.writeText(sessionCode);
      toast.success('Invite code copied to clipboard!');
    }
  };

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
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        {!isLobbyActive ? (
          /* Hub Landing Screen */
          <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 max-w-2xl w-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-500 animate-fade-up">
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
          /* Session Lobby Screen (Part 2 Placeholder) */
          <div className="bg-luxe-800/50 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] p-8 md:p-12 max-w-4xl w-full shadow-[0_15px_40px_rgba(0,0,0,0.8)] transition-all duration-500 animate-fade-in text-center">
            <span className="text-4xl animate-bounce inline-block mb-4">🛒</span>
            <h2 className="font-display font-black text-2xl text-white tracking-tight uppercase">
              Active Lobby: {sessionCode}
            </h2>
            <p className="text-gray-400 text-sm font-medium mt-2">
              Collaborative Party Cart lobby setup has loaded successfully.
            </p>
            <div className="mt-8 p-6 bg-white/5 border border-white/5 rounded-2xl max-w-md mx-auto text-left text-xs font-semibold text-gray-500">
              <p className="text-white text-sm font-black mb-2">Lobby Details:</p>
              <p>• Host: Arjun (Owner)</p>
              <p className="mt-1">• Connected Peers: Waiting for Part 2 integration...</p>
            </div>
            <button 
              onClick={handleLeaveLobby}
              className="mt-8 px-6 py-2.5 bg-red-500/20 border border-red-500/40 text-red-400 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500/30 transition-all active:scale-95"
            >
              Leave Session
            </button>
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
