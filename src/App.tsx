import React, { useEffect, useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface UserData {
  userId: number;
  username: string;
  invitedCount: number;
  balance: number;
  isNew: boolean;
}

export default function App() {
  const [data, setData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function initApp() {
      try {
        const tg = (window as any).Telegram?.WebApp;
        
        if (tg) {
          tg.ready();
          tg.expand();
        }

        // Detect if we are in Telegram or just a browser
        const isTelegram = !!tg?.initDataUnsafe?.user;
        
        // Get user from TG or use mock ONLY for local dev
        const tgUser = tg?.initDataUnsafe?.user;
        
        if (!tgUser && !window.location.hostname.includes('localhost')) {
          // If not in Telegram and not on localhost, we can't get the ID
          setError("Telegram environment not detected. Please open this app inside the Telegram Bot.");
          setLoading(false);
          return;
        }

        // Fallback for local testing only
        const finalUser = tgUser || {
          id: 987654321,
          username: "WebPlayer",
          first_name: "Web"
        };

        const startParam = tg?.initDataUnsafe?.start_param;

        const response = await fetch('/api/user/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: finalUser.id,
            username: finalUser.username || finalUser.first_name,
            startParam: startParam
          })
        });

        if (!response.ok) throw new Error("Failed to sync with server");
        
        const result = await response.json();
        setData(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    initApp();
  }, []);

  const handleCopy = () => {
    if (!data) return;
    const referralLink = `https://t.me/Tasktuner_bot?startapp=${data.userId}`;
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div style={{ padding: '20px', fontFamily: 'monospace' }}>Loading stats...</div>;
  if (error) return <div style={{ padding: '20px', fontFamily: 'monospace', color: 'red' }}>Error: {error}</div>;
  if (!data) return null;

  const username = data.username.startsWith('@') ? data.username : `@${data.username}`;
  const referralLink = `https://t.me/Tasktuner_bot?startapp=${data.userId}`;

  const isMock = !((window as any).Telegram?.WebApp?.initDataUnsafe?.user);

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f3f4f6',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      {isMock && (
        <div style={{ 
          marginBottom: '16px', 
          backgroundColor: '#fee2e2', 
          color: '#b91c1c', 
          padding: '12px', 
          borderRadius: '8px', 
          fontSize: '12px',
          textAlign: 'center',
          maxWidth: '350px',
          border: '1px solid #fecaca'
        }}>
          ⚠️ You are opening this in a browser. Open through your <strong>Telegram Bot</strong> to use your real ID and track referrals.
        </div>
      )}

      {data.isNew && (
        <div style={{ marginBottom: '16px', color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
          Welcome to Task Tuner! Start completing tasks to earn rewards.
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '16px',
        padding: '30px',
        width: '100%',
        maxWidth: '350px',
        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
        lineHeight: '1.8',
        position: 'relative'
      }}>
        <div style={{ 
          position: 'absolute',
          top: '-10px',
          right: '20px',
          backgroundColor: isMock ? '#9ca3af' : '#10b981',
          color: 'white',
          padding: '2px 10px',
          borderRadius: '20px',
          fontSize: '10px',
          fontWeight: 'bold'
        }}>
          {isMock ? 'OFFLINE' : 'VERIFIED'}
        </div>

        <div style={{ borderBottom: '2px solid #f3f4f6', marginBottom: '20px', paddingBottom: '10px' }}>
          <strong style={{ fontSize: '20px' }}>Dashboard</strong>
        </div>

        <div style={{ fontSize: '15px' }}><strong>User:</strong> {username}</div>
        <div style={{ fontSize: '15px' }}><strong>ID:</strong> {data.userId}</div>
        
        <div style={{ marginTop: '16px', backgroundColor: '#f9fafb', padding: '12px', borderRadius: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Total Referrals:</span>
            <strong>{data.invitedCount}</strong>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
            <span>Balance:</span>
            <strong style={{ color: '#059669' }}>${data.balance.toFixed(2)}</strong>
          </div>
        </div>

        <div style={{ marginTop: '24px', borderTop: '1px solid #f3f4f6', paddingTop: '20px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px', fontWeight: 'bold' }}>SHARE & EARN ($0.35/user):</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: '#f3f4f6',
            padding: '10px 14px',
            borderRadius: '10px',
            fontSize: '11px',
            wordBreak: 'break-all',
            border: '1px dashed #d1d5db'
          }}>
            <span style={{ flex: 1, opacity: 0.8 }}>{referralLink}</span>
            <button 
              onClick={handleCopy}
              style={{ 
                background: '#3b82f6', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                padding: '6px',
                borderRadius: '6px',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#2563eb'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#3b82f6'}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
