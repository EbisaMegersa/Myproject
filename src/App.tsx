import React, { useEffect, useState } from 'react';

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

  if (loading) return <div style={{ padding: '20px', fontFamily: 'monospace' }}>Loading stats...</div>;
  if (error) return <div style={{ padding: '20px', fontFamily: 'monospace', color: 'red' }}>Error: {error}</div>;
  if (!data) return null;

  const username = data.username.startsWith('@') ? data.username : `@${data.username}`;
  const referralLink = `https://t.me/Tasktuner_bot?startapp=${data.userId}`;

  return (
    <div style={{ 
      padding: '24px', 
      fontFamily: 'monospace', 
      lineHeight: '1.6', 
      fontSize: '16px',
      whiteSpace: 'pre-wrap'
    }}>
      {data.isNew && (
        <div style={{ marginBottom: '24px', color: '#10b981', fontWeight: 'bold' }}>
          Welcome to Task Tuner! Start completing tasks to earn rewards.
        </div>
      )}
      
      <div>User: {username}</div>
      <div>Referral Link: {referralLink}</div>
      <div>Total Referrals: {data.invitedCount}</div>
      <div>Balance: ${data.balance.toFixed(2)}</div>
    </div>
  );
}
