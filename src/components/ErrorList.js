'use client';
import { User, Activity, ChevronRight, Search } from 'lucide-react';

export default function ErrorList({ logs, selectedId, onSelect, email, setEmail }) {
  return (
    <div className="error-list-container">
      {/* Search Header - Responsive Layout */}
      <div className="list-header">
        <div className="search-pill">
          <Search size={16} color="var(--muted)" />
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Search by email..."
            className="header-input"
          />
        </div>
        
        {/* Count Badge - Always visible, repositioned for mobile via CSS */}
        <div className="count-badge">
          {logs.length.toString().padStart(2, '0')} 
          <span className="count-label"> EVENTS</span>
        </div>
      </div>

      {/* Scrollable Feed */}
      <div className="feed-viewport custom-scrollbar">
        {logs.length === 0 ? (
          <div className="empty-state">
            <p>AWAITING_TELEMETRY...</p>
          </div>
        ) : (
          logs.map((item) => {
            const report = item.reports?.[0];
            if (!report) return null;

            const isSelected = selectedId === item._id;
            const isFatal = report.type?.includes('FATAL') || report.type?.includes('CRASH');

            return (
              <div
                key={item._id}
                onClick={() => onSelect(item)}
                className={`incident-item ${isSelected ? 'selected' : ''}`}
              >
                <div className="incident-meta">
                  <span className={`type-tag ${isFatal ? 'fatal' : ''}`}>
                    {report.type || 'LOG'}
                  </span>
                  <span className="incident-time">
                    {report.time || '00:00:00'}
                  </span>
                </div>

                <div className="incident-message">
                  {report.message || report.url || 'LOG_ENTRY'}
                </div>

                <div className="incident-user">
                  <User size={12} color="var(--muted)" />
                  <span className="user-email">
                    {report.userEmail || 'anonymous'}
                  </span>
                  <ChevronRight size={18} className="chevron-icon" />
                </div>
              </div>
            );
          })
        )}
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .error-list-container { height: 100%; display: flex; flex-direction: column; background: var(--background); }
        
        .list-header { padding: 16px 20px; border-bottom: 1px solid var(--border); display: flex; align-items: center; gap: 12px; }
        .search-pill { flex: 1; display: flex; align-items: center; gap: 10px; background: var(--card-secondary); padding: 8px 14px; border-radius: 10px; border: 1px solid var(--border); }
        .header-input { background: transparent; border: none; outline: none; color: var(--foreground); font-size: 14px; width: 100%; }
        
        .count-badge { font-size: 11px; font-family: monospace; font-weight: 700; color: var(--foreground); background: var(--card-secondary); padding: 11px 12px; border-radius: 8px; border: 1px solid var(--border); white-space: nowrap; }
        
        .desktop-sub-header { padding: 12px 20px; background: var(--card-secondary); border-bottom: 1px solid var(--border); display: block; }
        
        .feed-viewport { flex: 1; overflow-y: auto; padding-bottom: 150px; }
        .empty-state { padding: 80px 20px; text-align: center; color: var(--muted); font-size: 12px; letter-spacing: 0.1em; }
        
        .incident-item { padding: 18px 20px; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s; position: relative; }
        .incident-item:hover { background: var(--card-secondary); }
        .incident-item.selected { background: var(--card-secondary); }
        .incident-item.selected::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 3px; background: var(--accent-primary); }
        
        .incident-meta { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .type-tag { font-size: 10px; font-weight: 700; padding: 2px 8px; border-radius: 4px; background: var(--border); color: var(--foreground); text-transform: uppercase; }
        .type-tag.fatal { background: var(--error); color: white; }
        .incident-time { font-size: 11px; color: var(--muted); font-family: monospace; }
        
        .incident-message { font-size: 14px; font-weight: 500; color: var(--foreground); margin-bottom: 10px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        
        .incident-user { display: flex; align-items: center; gap: 8px; }
        .user-email { font-size: 13px; color: var(--muted); flex: 1; overflow: hidden; text-overflow: ellipsis; }
        .chevron-icon { color: var(--accent-primary); opacity: 0; transition: opacity 0.2s; }
        .incident-item.selected .chevron-icon { opacity: 1; }

        @media (max-width: 768px) {
          .list-header { padding: 12px 16px; }
          .count-label { display: none; }
          .desktop-sub-header { display: none; }
          .incident-message { font-size: 16px; }
          .user-email { font-size: 14px; }
          .type-tag { font-size: 11px; }
        }
      `}} />
    </div>
  );
}