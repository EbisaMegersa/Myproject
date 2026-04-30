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
        tg?.expand?.();

        // Get user from TG or use mock for local development
        const tgUser = tg?.initDataUnsafe?.user || {
          id: 987654321,
          username: "tester",
          first_name: "TestUser"
        };
        
        const startParam = tg?.initDataUnsafe?.start_param;

        const response = await fetch('/api/user/init', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: tgUser.id,
            username: tgUser.username || tgUser.first_name,
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

  return (
    <div style={{ 
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      backgroundColor: '#f9f9f9',
      padding: '20px',
      fontFamily: 'monospace'
    }}>
      {data.isNew && (
        <div style={{ marginBottom: '16px', color: '#10b981', fontWeight: 'bold', textAlign: 'center' }}>
          Welcome to Task Tuner! Start completing tasks to earn rewards.
        </div>
      )}

      <div style={{
        backgroundColor: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '24px',
        width: '100%',
        maxWidth: '350px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        lineHeight: '1.8'
      }}>
        <div style={{ borderBottom: '1px solid #f3f4f6', marginBottom: '16px', paddingBottom: '8px' }}>
          <strong style={{ fontSize: '18px' }}>User Stats</strong>
        </div>

        <div><strong>User:</strong> {username}</div>
        
        <div style={{ marginTop: '12px' }}>
          <strong>Total Referrals:</strong> {data.invitedCount}
        </div>
        
        <div style={{ marginTop: '4px' }}>
          <strong>Balance:</strong> ${data.balance.toFixed(2)}
        </div>

        <div style={{ marginTop: '20px', borderTop: '1px solid #f3f4f6', paddingTop: '16px' }}>
          <div style={{ fontSize: '12px', color: '#6b7280', marginBottom: '4px' }}>Your Referral Link:</div>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            backgroundColor: '#f3f4f6',
            padding: '8px 12px',
            borderRadius: '6px',
            fontSize: '11px',
            wordBreak: 'break-all'
          }}>
            <span style={{ flex: 1 }}>{referralLink}</span>
            <button 
              onClick={handleCopy}
              style={{ 
                background: 'none', 
                border: 'none', 
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                color: copied ? '#10b981' : '#3b82f6'
              }}
            >
              {copied ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
