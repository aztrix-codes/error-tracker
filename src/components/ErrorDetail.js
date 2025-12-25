'use client';
import { useState, useEffect } from 'react';
import { 
  Copy, Terminal, User, Play, CheckCircle2, XCircle, 
  FlaskConical, Zap, Box, ShieldCheck, Smartphone, 
  Hash, Building2, Lock, ChevronLeft, Send, Code, RefreshCcw, Check, ChevronDown, ChevronUp 
} from 'lucide-react';

export default function ErrorDetail({ report, onBack }) {
  const [liveResponse, setLiveResponse] = useState(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [editUrl, setEditUrl] = useState('');
  const [editToken, setEditToken] = useState('');
  const [editMethod, setEditMethod] = useState('GET');
  const [copyStatus, setCopyStatus] = useState(null);
  const [isRawExpanded, setIsRawExpanded] = useState(false);

  useEffect(() => {
    setLiveResponse(null);
    setIsExecuting(false);
    setEditUrl(report?.url || '');
    setEditToken(report?.token || '');
    
    // Dynamically determine method from curl or type
    const detectedMethod = report?.curl?.split(' ')[2]?.replace(/['"]+/g, '') || 'GET';
    setEditMethod(detectedMethod.toUpperCase());
    
    setCopyStatus(null);
    setIsRawExpanded(false);
  }, [report]);

  if (!report) {
    return (
      <div className="empty-detail-state">
        <div className="empty-center-container">
          <div className="empty-glow">
            <Terminal size={48} strokeWidth={1} />
          </div>
          <h2 style={{ fontSize: '14px', fontWeight: 600, letterSpacing: '0.1em', marginTop: '20px' }}>SYSTEM_IDLE</h2>
          <p style={{ fontSize: '11px', color: 'var(--muted)', marginTop: '8px' }}>SELECT AN INCIDENT TO DECRYPT DATA</p>
        </div>
      </div>
    );
  }

  const isApiError = !!report.url;
  const agencyType = report.is_university ? 'UNIVERSITY' : 'EDTECH';

  const getCurlCommand = () => {
    return `curl -X ${editMethod} "${editUrl}" \\\n  -H "Authorization: Bearer ${editToken}"`;
  };

  const handleCopy = async (text, type) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopyStatus(type);
      setTimeout(() => setCopyStatus(null), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  const runReproduction = async () => {
    setIsExecuting(true);
    try {
      const res = await fetch(editUrl, {
        method: editMethod,
        headers: { 'Authorization': `Bearer ${editToken}` }
      });
      const data = await res.json();
      setLiveResponse({ status: res.status, data });
    } catch (err) {
      setLiveResponse({ status: 'ERR', data: { message: err.message } });
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <div className="detail-wrapper">
      <header className="detail-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px', flexWrap: 'wrap' }}>
          <button onClick={onBack} className="mobile-back-btn">
            <ChevronLeft size={24} />
          </button>
          <span className="badge-type">{report.type}</span>
          {isApiError && <span className="badge-status">HTTP_{report.status}</span>}
          <span className="timestamp-monospace">{report.time}</span>
        </div>
        <h1 className="detail-title">{report.message || report.url || 'LOG_ENTRY'}</h1>
      </header>

      <div className="detail-content-grid">
        <div className="detail-sidebar-section">
          <div className="context-card">
            <div className="section-subtitle"><User size={14}/> IDENTITY_COMPOSITE</div>
            <div className="identity-grid">
               <ContextItem label="EMAIL" value={report.userEmail} icon={<User size={10}/>} />
               <ContextItem label="PASSWORD" value={report.userCreds} icon={<Lock size={10}/>} color="var(--warning)" isCode />
               <ContextItem label="AGENCY" value={report.agency_name} icon={<Building2 size={10}/>} subtext={agencyType} />
               <ContextItem label="AGENCY_ID" value={report.agency_id} icon={<Hash size={10}/>} isCode />
               <ContextItem label="PLATFORM" value={report.osType?.toUpperCase()} icon={<Smartphone size={10}/>} />
            </div>
          </div>

          <div className="expandable-card">
            <div className="expandable-header" onClick={() => setIsRawExpanded(!isRawExpanded)}>
              <div className="section-subtitle"><Box size={14}/> RAW_TELEMETRY</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleCopy(JSON.stringify(report, null, 2), 'raw'); }} 
                  className="ghost-copy"
                >
                  {copyStatus === 'raw' ? <Check size={16} color="var(--success)" /> : <Copy size={16}/>}
                </button>
                {isRawExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </div>
            {isRawExpanded && (
              <div className="expandable-content">
                <pre className="raw-pre">{JSON.stringify(report, null, 2)}</pre>
              </div>
            )}
          </div>
        </div>

        <div className="detail-main-section">
          {isApiError ? (
            <div className="api-controller">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="section-subtitle"><FlaskConical size={14} /> REQUEST_LAB</div>
                <button 
                  onClick={() => handleCopy(getCurlCommand(), 'curl')}
                  className={`copy-curl-btn ${copyStatus === 'curl' ? 'copied' : ''}`}
                >
                  {copyStatus === 'curl' ? <Check size={18} /> : <Copy size={18} />}
                  <span className="btn-text-hide">{copyStatus === 'curl' ? 'COPIED' : 'COPY_CURL'}</span>
                </button>
              </div>
              
              <div className="postman-bar">
                <div className="method-tag">{editMethod}</div>
                <input 
                  className="api-input" 
                  value={editUrl} 
                  onChange={(e) => setEditUrl(e.target.value)} 
                />
                <button onClick={runReproduction} disabled={isExecuting} className="send-btn">
                  {isExecuting ? <RefreshCcw size={18} className="spin-icon" /> : <Send size={18} />}
                  <span className="btn-text-hide">{isExecuting ? '...' : 'SEND'}</span>
                </button>
              </div>

              <div className="token-editor">
                <div className="token-label">
                   <span>AUTH_BEARER_TOKEN</span>
                   <button 
                     onClick={() => handleCopy(editToken, 'token')} 
                     className={`token-copy-action ${copyStatus === 'token' ? 'active' : ''}`}
                   >
                    {copyStatus === 'token' ? <Check size={16} /> : <Copy size={16}/>}
                    <span className="btn-text-hide">{copyStatus === 'token' ? 'COPIED' : 'COPY'}</span>
                   </button>
                </div>
                <textarea 
                  className="token-area" 
                  value={editToken} 
                  onChange={(e) => setEditToken(e.target.value)}
                />
              </div>

              {liveResponse && (
                <div className="response-box">
                  <div className="response-header">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {liveResponse.status === 200 ? <CheckCircle2 size={16} color="var(--success)"/> : <XCircle size={16} color="var(--error)"/>}
                      <span>RESPONSE</span>
                    </div>
                    <span className={liveResponse.status === 200 ? 'status-ok' : 'status-bad'}>
                      {liveResponse.status}
                    </span>
                  </div>
                  <pre className="response-pre">{JSON.stringify(liveResponse.data, null, 2)}</pre>
                </div>
              )}
            </div>
          ) : (
            <div className="non-api-card">
               <ShieldCheck size={32} color="var(--success)" style={{ opacity: 0.4, marginBottom: '12px' }} />
               <div style={{ fontSize: '15px', fontWeight: 600 }}>NON-API EVENT</div>
               <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>Local exception validated.</div>
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <SectionLabel icon={<Code size={16}/>} label="STACK_TRACE" />
            <pre className="stack-trace">{report.stack || 'No stack trace provided.'}</pre>
          </div>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .detail-wrapper { height: 100%; display: flex; flex-direction: column; background-color: var(--background); }
        .detail-header { padding: 24px; border-bottom: 1px solid var(--border); background-color: var(--card); flex-shrink: 0; }
        .detail-title { font-size: 18px; font-weight: 500; color: var(--foreground); margin: 0; line-height: 1.4; word-break: break-word; }
        .timestamp-monospace { font-size: 12px; color: var(--muted); font-family: monospace; margin-left: auto; }
        .detail-content-grid { display: flex; flex: 1; overflow: hidden; height: 100%; }
        .detail-sidebar-section { width: 42%; border-right: 1px solid var(--border); overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
        .detail-main-section { width: 58%; overflow-y: auto; padding: 24px; background-color: var(--card-secondary); }
        .empty-detail-state { height: 100%; display: flex; align-items: center; justify-content: center; background: var(--background); color: var(--muted); padding: 24px; text-align: center; }
        .empty-center-container { display: flex; flex-direction: column; align-items: center; }
        .empty-glow { width: 100px; height: 100px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid var(--border); animation: pulse 2s infinite; }
        .badge-type { background: var(--accent-primary); color: var(--background); padding: 4px 10px; border-radius: 4px; font-size: 11px; font-weight: 700; text-transform: uppercase; }
        .badge-status { border: 1px solid var(--border); color: var(--foreground); padding: 2px 10px; border-radius: 4px; font-size: 11px; font-weight: 500; }
        .section-subtitle { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: var(--muted); letter-spacing: 0.05em; }
        .context-card, .expandable-card { background: var(--card); border: 1px solid var(--border); border-radius: 12px; padding: 20px; display: flex; flex-direction: column; gap: 20px; }
        .expandable-header { display: flex; justify-content: space-between; align-items: center; cursor: pointer; }
        .expandable-content { margin-top: 16px; border-top: 1px solid var(--border); padding-top: 16px; }
        .identity-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .postman-bar { display: flex; background: var(--card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-bottom: 16px; }
        .method-tag { background: var(--border); padding: 0 16px; display: flex; align-items: center; font-size: 12px; font-weight: 700; color: var(--success); text-transform: uppercase; }
        .api-input { flex: 1; background: transparent; border: none; padding: 12px; color: var(--foreground); font-family: monospace; font-size: 14px; outline: none; min-width: 0; }
        .send-btn { background: var(--accent-primary); color: var(--background); border: none; padding: 0 20px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; font-size: 12px; }
        .copy-curl-btn { background: var(--card); border: 1px solid var(--border); color: var(--foreground); padding: 6px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; }
        .token-editor { background: var(--card); border: 1px solid var(--border); border-radius: 10px; padding: 16px; margin-bottom: 24px; }
        .token-label { display: flex; justify-content: space-between; align-items: center; font-size: 10px; font-weight: 700; color: var(--muted); margin-bottom: 12px; }
        .token-copy-action { background: var(--card-secondary); border: 1px solid var(--border); color: var(--muted); padding: 6px 12px; border-radius: 6px; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; font-size: 11px; font-weight: 500; }
        .token-area { width: 100%; height: 100px; background: var(--card-secondary); border: 1px solid var(--border); border-radius: 6px; color: var(--muted); font-family: monospace; font-size: 13px; padding: 12px; resize: none; outline: none; word-break: break-all; }
        .response-box { background: var(--card); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; }
        .response-header { padding: 12px 16px; border-bottom: 1px solid var(--border); display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; background: var(--card-secondary); }
        .response-pre { padding: 16px; margin: 0; font-size: 13px; max-height: 400px; overflow: auto; color: var(--foreground); word-break: break-all; white-space: pre-wrap; }
        .raw-pre { margin: 0; font-size: 13px; color: var(--muted); font-family: monospace; line-height: 1.5; white-space: pre-wrap; word-break: break-all; }
        .stack-trace { padding: 20px; background: var(--background); border: 1px solid var(--border); border-radius: 10px; font-size: 13px; color: var(--foreground); line-height: 1.6; font-family: monospace; margin-top: 12px; overflow-x: auto; word-break: break-word; }
        .mobile-back-btn { display: none; background: none; border: none; color: var(--foreground); cursor: pointer; padding: 0; }
        .ghost-copy { background: none; border: none; color: var(--accent-primary); cursor: pointer; padding: 0; }
        @media (max-width: 768px) {
          .detail-wrapper { overflow-y: auto; height: 100%; display: block; padding-bottom: 150px; }
          .detail-content-grid { display: block; overflow: visible; height: auto; }
          .detail-sidebar-section, .detail-main-section { width: 100%; border-right: none; overflow: visible; padding: 20px; height: auto; }
          .mobile-back-btn { display: block; }
          .btn-text-hide { display: none; }
          .identity-grid { grid-template-columns: 1fr; gap: 16px; }
          .token-area, .response-pre, .raw-pre, .stack-trace, .api-input { font-size: 15px; }
          .timestamp-monospace { width: 100%; margin-top: 8px; font-size: 12px; }
        }
      `}} />
    </div>
  );
}

function ContextItem({ label, value, icon, color, isCode, subtext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px', fontWeight: 700, color: 'var(--muted)' }}>{icon} {label}</div>
      <div className="context-value" style={{ fontSize: '16px', color: color || 'var(--foreground)', fontFamily: isCode ? 'monospace' : 'inherit', wordBreak: 'break-all' }}>{value || 'N/A'}</div>
      {subtext && <div style={{ fontSize: '10px', fontWeight: 700, color: 'var(--accent-primary)' }}>{subtext}</div>}
      <style dangerouslySetInnerHTML={{ __html: `
        @media (max-width: 768px) { .context-value { font-size: 18px !important; } }
      `}} />
    </div>
  );
}

function SectionLabel({ icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: color || 'var(--muted)', fontSize: '12px', fontWeight: 700 }}>{icon} {label}</div>
  );
}