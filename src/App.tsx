import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react'; // Using framer-motion as it is usually aliased or installed
import { 
  Zap, 
  Wallet, 
  Users, 
  Trophy, 
  Share2, 
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Coins
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for Tailwind class merging
 */
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
}

interface FloatingText {
  id: number;
  x: number;
  y: number;
  value: string;
}

// --- Constants ---
const MAX_ENERGY = 1000;
const ENERGY_RECOVERY_RATE = 1; // 1 energy per second
const TAP_VALUE = 1;

// --- Mock Telegram ---
const mockTelegram = {
  WebApp: {
    initDataUnsafe: {
      user: {
        id: 123456,
        first_name: "Ethio",
        username: "etb_miner",
      }
    },
    expand: () => console.log("Telegram expanded"),
    HapticFeedback: {
      impactOccurred: (style: string) => console.log(`Haptic: ${style}`)
    }
  }
};

export default function App() {
  const [balance, setBalance] = useState<number>(() => {
    const saved = localStorage.getItem('etb_balance');
    return saved ? parseFloat(saved) : 0;
  });
  const [energy, setEnergy] = useState<number>(MAX_ENERGY);
  const [floatingTexts, setFloatingTexts] = useState<FloatingText[]>([]);
  const [user, setUser] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'tap' | 'stats' | 'friends'>('tap');
  const tapperRef = useRef<HTMLDivElement>(null);

  // Initialize User
  useEffect(() => {
    const tg = (window as any).Telegram?.WebApp || mockTelegram.WebApp;
    if (tg.initDataUnsafe?.user) {
      setUser(tg.initDataUnsafe.user);
    }
    tg.expand();
  }, []);

  // Energy Recovery & Persistence
  useEffect(() => {
    const interval = setInterval(() => {
      setEnergy(prev => Math.min(prev + ENERGY_RECOVERY_RATE, MAX_ENERGY));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('etb_balance', balance.toString());
  }, [balance]);

  const handleTap = (e: React.TouchEvent | React.MouseEvent) => {
    if (energy < TAP_VALUE) return;

    // Support multi-touch
    const touches = 'touches' in e ? Array.from(e.touches) : [e];
    
    // Haptic feedback
    const tg = (window as any).Telegram?.WebApp || mockTelegram.WebApp;
    tg.HapticFeedback?.impactOccurred('medium');

    touches.forEach(touch => {
      const x = 'clientX' in touch ? touch.clientX : (touch as any).pageX;
      const y = 'clientY' in touch ? touch.clientY : (touch as any).pageY;
      
      const id = Date.now() + Math.random();
      setFloatingTexts(prev => [...prev, { id, x, y, value: `+${TAP_VALUE}` }]);
      
      // Remove floating text after animation
      setTimeout(() => {
        setFloatingTexts(prev => prev.filter(t => t.id !== id));
      }, 800);
    });

    setBalance(prev => prev + (touches.length * TAP_VALUE));
    setEnergy(prev => Math.max(0, prev - (touches.length * TAP_VALUE)));
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#00BE63]/30 overflow-hidden flex flex-col">
      
      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-white/5 bg-[#0F0F0F]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#00BE63] to-[#FAD900] p-[1px]">
            <div className="w-full h-full rounded-xl bg-[#151515] flex items-center justify-center overflow-hidden">
               <span className="text-lg font-bold text-[#00BE63]">
                {user.first_name?.[0] || 'E'}
               </span>
            </div>
          </div>
          <div>
            <div className="text-xs text-white/40 font-medium uppercase tracking-wider">Miner</div>
            <div className="text-sm font-semibold truncate max-w-[120px]">
              {user.first_name || 'Guest'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/10">
          <Trophy className="w-4 h-4 text-[#FAD900]" />
          <span className="text-xs font-bold uppercase tracking-tighter">Bronze Rank</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center relative px-6 pb-24">
        
        {/* Balance Display */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="p-2 bg-[#FAD900]/10 rounded-lg border border-[#FAD900]/20">
              <Coins className="w-6 h-6 text-[#FAD900]" />
            </div>
            <span className="text-sm font-bold text-white/50 uppercase tracking-[0.2em] translate-y-0.5">
              Current Balance
            </span>
          </div>
          <div className="text-6xl font-black tracking-tighter text-white tabular-nums drop-shadow-[0_0_20px_rgba(255,255,255,0.1)]">
            {balance.toLocaleString()}
            <span className="text-2xl text-[#00BE63] ml-2 tracking-normal">ETB</span>
          </div>
        </motion.div>

        {/* Tapper Area */}
        <div className="relative w-full max-w-[320px] aspect-square group">
          {/* Outer Glow */}
          <div className="absolute inset-0 rounded-full bg-[#00BE63]/10 blur-[80px] animate-pulse" />
          
          {/* Main Button */}
          <motion.div
            ref={tapperRef}
            whileTap={{ scale: 0.96 }}
            onPointerDown={handleTap}
            className="w-full h-full rounded-full relative z-10 p-4 cursor-pointer select-none"
          >
            <div className="w-full h-full rounded-full bg-gradient-to-b from-[#1A1A1A] to-[#0F0F0F] border-[8px] border-[#1F1F1F] shadow-[0_0_40px_rgba(0,0,0,0.5),inset_0_0_20px_rgba(255,255,255,0.05)] flex items-center justify-center overflow-hidden relative active:border-[#00BE63]/30 transition-colors">
              
              {/* Coin Visuals */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(250,217,0,0.1)_0%,transparent_70%)]" />
              
              <div className="relative flex flex-col items-center">
                <div className="w-40 h-40 bg-gradient-to-br from-[#00BE63] to-[#FAD900] rounded-full flex items-center justify-center overflow-hidden shadow-2xl p-1">
                   <div className="w-full h-full bg-[#0A0A0A] rounded-full flex items-center justify-center p-2">
                     <img 
                      src="https://images.unsplash.com/photo-1621416894569-0f39ed31d247?auto=format&fit=crop&q=80&w=300&h=300" 
                      alt="ETB Token" 
                      className="w-full h-full object-cover rounded-full opacity-80"
                      referrerPolicy="no-referrer"
                     />
                   </div>
                </div>
                <div className="absolute -bottom-6 bg-[#00BE63] text-black px-6 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-[#00BE63]/40">
                  Tap to Mine
                </div>
              </div>
            </div>
          </motion.div>

          {/* Floating Text Particles */}
          <AnimatePresence>
            {floatingTexts.map(text => (
              <motion.div
                key={text.id}
                initial={{ opacity: 1, y: text.y - 120, x: text.x - 20 }}
                animate={{ opacity: 0, y: text.y - 300, scale: 1.8 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="fixed z-[100] text-[#FAD900] font-black text-4xl pointer-events-none drop-shadow-[0_0_12px_rgba(250,217,0,0.8)]"
              >
                {text.value}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Energy Bar */}
        <div className="w-full max-w-[320px] mt-20">
          <div className="flex items-center justify-between mb-4 px-2">
            <div className="flex items-center gap-2">
              <Zap className={cn("w-5 h-5", energy > 100 ? "text-[#FAD900] animate-pulse" : "text-red-500")} />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-white/40">Power Reserve</span>
            </div>
            <span className="text-sm font-bold tabular-nums">
              {energy} <span className="text-white/20">/ {MAX_ENERGY}</span>
            </span>
          </div>
          <div className="h-4 w-full bg-white/5 rounded-full overflow-hidden border border-white/10 p-1">
            <motion.div 
              initial={false}
              animate={{ width: `${(energy / MAX_ENERGY) * 100}%` }}
              className={cn(
                "h-full rounded-full transition-colors duration-500",
                energy > 300 ? "bg-gradient-to-r from-[#00BE63] via-[#FAD900] to-[#00BE63]" : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"
              )}
              style={{ backgroundSize: '200% 100%' }}
            />
          </div>
        </div>

        {/* Community Link */}
        <div className="mt-12 w-full max-w-[320px]">
          <a 
            href="https://t.me/etb_tap_community" 
            target="_blank"
            className="w-full flex items-center justify-between p-5 rounded-2xl bg-[#151515] border border-white/5 hover:border-[#00BE63]/30 transition-all group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00BE63]/5 to-transparent translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
            <div className="flex items-center gap-4 relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#00BE63] to-[#00BE63]/80 flex items-center justify-center text-black shadow-lg shadow-[#00BE63]/20">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <div className="text-sm font-bold tracking-tight">ETB Community</div>
                <div className="text-[10px] text-white/40 uppercase font-black tracking-widest">Join 124k Miners</div>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/10 group-hover:text-[#00BE63] group-hover:translate-x-1 transition-all" />
          </a>
        </div>
      </main>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 px-6 pb-10 pt-4 bg-[#0A0A0A]/95 backdrop-blur-xl border-t border-white/5 z-50">
        <div className="flex items-center justify-between max-w-sm mx-auto">
          {[
            { id: 'tap', icon: TrendingUp, label: 'Mine' },
            { id: 'friends', icon: Share2, label: 'Friends' },
            { id: 'stats', icon: Wallet, label: 'Wallet' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex flex-col items-center gap-2 transition-all relative px-6 py-2 rounded-2xl",
                activeTab === tab.id ? "text-[#00BE63]" : "text-white/20 hover:text-white/40"
              )}
            >
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTabGlow"
                  className="absolute inset-x-0 -top-[calc(1.5rem+1px)] h-[2px] bg-[#00BE63] shadow-[0_0_15px_#00BE63]"
                />
              )}
              <tab.icon className="w-7 h-7" />
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">{tab.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Grid Background Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.05] z-[-1]" 
        style={{ 
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '40px 40px' 
        }} 
      />
    </div>
  );
}
