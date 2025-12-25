'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import ErrorList from '@/components/ErrorList';
import ErrorDetail from '@/components/ErrorDetail';

export default function MonitorPage() {
  const [logs, setLogs] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedEntryId, setSelectedEntryId] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const observerTarget = useRef(null);
  const abortControllerRef = useRef(null);

  const fetchLogs = useCallback(async (qEmail, pageNum, isRefresh = false) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    setIsLoading(true);
    const url = `https://testgo.lineupx.com/RecruiterV2/Job/SET/GetMobilePayloadData?limit=15&page=${pageNum}&agency_id=&email=${qEmail}`;

    try {
      const res = await fetch(url, { signal: abortControllerRef.current.signal });
      const result = await res.json();
      
      if (result.status === 'success' && Array.isArray(result.data)) {
        setLogs(prev => isRefresh ? result.data : [...prev, ...result.data]);
        setTotalItems(result.pagination?.total_items || 0);
        
        const totalPages = result.pagination?.total_pages || 1;
        setHasMore(pageNum < totalPages);
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
    setPage(1);
    const debounce = setTimeout(() => fetchLogs(email, 1, true), 400);
    
    const interval = setInterval(() => {
      setPage(1);
      fetchLogs(email, 1, true);
    }, 30000);

    return () => {
      clearTimeout(debounce);
      clearInterval(interval);
    };
  }, [email, fetchLogs]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchLogs(email, nextPage);
        }
      },
      { threshold: 1.0 }
    );

    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasMore, isLoading, page, email, fetchLogs]);

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
        onRefresh={() => { setPage(1); fetchLogs(email, 1, true); }}
      />

      <div className="main-content-layout">
        <div className={`list-panel ${selectedLog ? 'mobile-hidden' : ''}`}>
          <ErrorList
            logs={logs}
            totalCount={totalItems}
            selectedId={selectedEntryId}
            onSelect={handleSelect}
            email={email}
            setEmail={setEmail}
            isLoading={isLoading}
            observerTarget={observerTarget}
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