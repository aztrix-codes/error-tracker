'use client';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect, useCallback } from 'react';
import { 
  RefreshCcw, 
  Sun, 
  Moon, 
} from 'lucide-react';

export default function Navbar({ onRefresh }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isDark, setIsDark] = useState(true);
  const [lastSynced, setLastSynced] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('monitor-theme') || 'dark';
    const isDarkTheme = savedTheme === 'dark';
    setIsDark(isDarkTheme);
    document.documentElement.classList.toggle('dark', isDarkTheme);
    setLastSynced(new Date());
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    localStorage.setItem('monitor-theme', newDark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', newDark);
  };

  const handleManualRefresh = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    await onRefresh();
    setLastSynced(new Date());
    setTimeout(() => setIsSyncing(false), 1000);
  }, [onRefresh, isSyncing]);

  const formatTime = (date) => {
    if (!date) return '--:--:--';
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      hour12: true 
    });
  };

  return (
    <nav className="nav-container">
      <div className="nav-switcher">
        <button 
          onClick={() => router.push('/test')} 
          className={`nav-btn ${pathname === '/test' ? 'active' : ''}`}
        >
          Test
        </button>
        <button 
          onClick={() => router.push('/prod')} 
          className={`nav-btn ${pathname === '/prod' ? 'active' : ''}`}
        >
          Prod
        </button>
      </div>

      {/* --- SEARCH INPUT REMOVED FROM HERE --- */}

      <div className="nav-right-actions">
        <div className="sync-info-box">
          <span className="sync-label">Last Fetched</span>
          <span className="sync-time">{formatTime(lastSynced)}</span>
        </div>

        <button onClick={handleManualRefresh} className="icon-action-btn">
          <RefreshCcw size={18} className={isSyncing ? 'spin-icon' : ''} />
        </button>

        <button onClick={toggleTheme} className="icon-action-btn">
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .nav-container {
          height: 64px;
          padding: 0 24px;
          border-bottom: 1px solid var(--border);
          background-color: var(--background);
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 100;
        }
        .nav-switcher {
          display: flex;
          background-color: var(--card-secondary);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid var(--border);
        }
        .nav-btn {
          padding: 6px 16px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--muted);
          transition: all 0.2s;
        }
        .nav-btn.active {
          background-color: var(--card);
          color: var(--foreground);
          box-shadow: var(--shadow-gentle);
        }
        .nav-right-actions {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .sync-info-box {
          text-align: right;
          margin-right: 8px;
          display: flex;
          flex-direction: column;
        }
        .sync-label {
          font-size: 10px;
          font-weight: 700;
          color: var(--muted);
          letter-spacing: 0.1em;
        }
        .sync-time {
          font-size: 13px;
          color: var(--foreground);
          font-family: monospace;
          font-weight: 500;
          letter-spacing: 0.1em;
          margin-top: 2px;
        }
        .icon-action-btn {
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          border: 1px solid var(--border);
          background: var(--card);
          color: var(--foreground);
          cursor: pointer;
          transition: 0.2s;
        }
        .icon-action-btn:hover {
          background: var(--card-secondary);
        }
        .spin-icon {
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @media (max-width: 768px) {
          .nav-container {
            height: 60px;
            padding: 0 16px;
          }
          .nav-btn {
            font-size: 12px;
            padding: 8px 20px;
          }
          .sync-info-box {
            display: none;
          }
          .icon-action-btn {
            width: 36px;
            height: 36px;
          }
        }
      `}} />
    </nav>
  );
}