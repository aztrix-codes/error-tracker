'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ErrorList from '@/components/ErrorList';
import ErrorDetail from '@/components/ErrorDetail';

export default function MonitorPage() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const abortControllerRef = useRef(null);

  const fetchLogs = useCallback(async (qEmail) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    const url = `https://testgo.lineupx.com/RecruiterV2/Job/SET/GetMobilePayloadData?limit=100&page=1&agency_id=&email=${qEmail}`;

    try {
      const res = await fetch(url, { signal: abortControllerRef.current.signal });
      const result = await res.json();
      
      if (result.status === 'success' && Array.isArray(result.data)) {
        setLogs(result.data);
      } else {
        setLogs([]);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        console.error('Fetch failed:', err);
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => fetchLogs(email), 400);
    const interval = setInterval(() => fetchLogs(email), 30000);

    return () => {
      clearTimeout(debounce);
      clearInterval(interval);
    };
  }, [email, fetchLogs]);

  const handleSelect = useCallback((logEntry) => {
    if (!logEntry || !logEntry._id) return;
    setSelectedEntryId(logEntry._id);
    const reportData = logEntry.reports && logEntry.reports.length > 0 
      ? logEntry.reports[0] 
      : null;
    setSelectedLog(reportData);
  }, []);

  const handleBack = () => {
    setSelectedLog(null);
    setSelectedEntryId(null);
  };

  return (
    <div className="app-body">
      <Navbar
        onRefresh={() => fetchLogs(email)}
      />

      <div className="main-content-layout">
        <div className={`list-panel ${selectedLog ? 'mobile-hidden' : ''}`}>
          <ErrorList
            logs={logs}
            selectedId={selectedEntryId}
            onSelect={handleSelect}
            email={email}
            setEmail={setEmail}
            isLoading={isLoading}
          />
        </div>

        <div className={`detail-panel ${!selectedLog ? 'mobile-hidden' : ''}`}>
          <ErrorDetail 
            report={selectedLog} 
            onBack={handleBack} 
          />
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .main-content-layout {
          display: flex;
          flex: 1;
          overflow: hidden;
          background-color: var(--background);
        }

        .list-panel {
          width: 400px;
          flex-shrink: 0;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
        }

        .detail-panel {
          flex: 1;
          overflow-y: auto;
        }

        @media (max-width: 768px) {
          .list-panel, .detail-panel {
            width: 100%;
            border-right: none;
          }

          .mobile-hidden {
            display: none !important;
          }
        }
      `}} />
    </div>
  );
}