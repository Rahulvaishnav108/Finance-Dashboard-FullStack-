import { useReducer, useRef, useState } from 'react';
import { reducer, initial } from './state/reducer';
import { fmt } from './core/money';
import { banner, canComplete } from './core/status';
import { buildReport, reportName } from './core/export';
import { MAX_BYTES } from './core/csv';
import { DEMO } from './demo/demo';
import NotesWorkspace from './notes/NotesWorkspace';
import type { Decision, ExType, Exception, FileKind, ParseResult, SourceRow } from './core/types';

const LABEL: Record<ExType, string> = { DUPLICATE: 'Duplicate reference', AMOUNT_MISMATCH: 'Amount mismatch', UNMATCHED_SALE: 'Sale without settlement', UNMATCHED_SETTLEMENT: 'Settlement without sale' };
const STEPS = ['Upload', 'Review', 'Confirm', 'Export'];

function FileSlot({ kind, label, result, onFile }: { kind: FileKind; label: string; result: ParseResult | null; onFile: (k: FileKind, f: File) => void }) {
  return (
    <fieldset className="slot">
      <legend>{label}</legend>
      <label className="dropzone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const file = event.dataTransfer.files[0]; if (file) onFile(kind, file); }}>
        <input type="file" accept=".csv,text/csv" aria-label={`${label} CSV`} onChange={(event) => { const file = event.currentTarget.files?.[0]; if (file) onFile(kind, file); event.currentTarget.value = ''; }} />
        <span className="upload-mark" aria-hidden="true">+</span>
        <span className="upload-copy"><strong>Choose a CSV</strong><span>or drag it here</span></span>
      </label>
      <a href={`${import.meta.env.BASE_URL}samples/${kind}.csv`} download>Download sample {kind} CSV</a>
      {result?.fatal && <p className="msg err" role="alert">{result.fatal}</p>}
      {result && !result.fatal && <p className="msg ok">{result.fileName}: {result.rows.length} valid rows, {result.errors.length} invalid{result.warnings.length ? `, ${result.warnings.length} warnings` : ''}</p>}
      {result && result.errors.length > 0 && (
        <details open><summary>Invalid rows ({result.errors.length})</summary>
          <table><thead><tr><th>Row</th><th>Field</th><th>Problem</th></tr></thead>
            <tbody>{result.errors.map((e, i) => <tr key={i}><td>{e.rowNumber}</td><td>{e.field}</td><td>{e.reason}</td></tr>)}</tbody></table>
        </details>)}
      {result && result.warnings.length > 0 && <details><summary>Warnings ({result.warnings.length})</summary><ul>{result.warnings.map((w, i) => <li key={i}>Row {w.rowNumber}: {w.reason}</li>)}</ul></details>}
    </fieldset>
  );
}

const Rows = ({ rows, title }: { rows: SourceRow[]; title: string }) => (
  <div><h4>{title}</h4>{rows.length === 0 ? <p className="muted">No matching row</p> :
    <table><thead><tr><th>Row</th><th>Method</th><th>Amount</th><th>Time</th></tr></thead>
      <tbody>{rows.map((r) => <tr key={r.rowNumber}><td>{r.rowNumber}</td><td>{r.method}</td><td className="num">{r.raw.amount}</td><td>{r.time}</td></tr>)}</tbody></table>}</div>
);

function ExceptionCard({ e, locked, onDecide }: { e: Exception; locked: boolean; onDecide: (id: string, d: Exclude<Decision, 'OPEN'>, note: string) => void }) {
  const [note, setNote] = useState(e.note);
  const id = `note-${e.id}`;
  return (
    <li className={`ex ${e.decision.toLowerCase()}`}>
      <header><h3>{LABEL[e.type]}: {e.orderId}</h3><span className="tag">{e.decision === 'OPEN' ? 'Open' : e.decision === 'RESOLVED' ? 'Resolved' : 'Acknowledged'}</span></header>
      {e.type === 'AMOUNT_MISMATCH' && <p>Sales {fmt(e.salesCents!)} vs settlement {fmt(e.settlementCents!)}. Difference <b className="num">{fmt(e.diffCents)}</b>.</p>}
      <div className="cols"><Rows rows={e.sales} title="Sales file" /><Rows rows={e.settlements} title="Settlement file" /></div>
      <label htmlFor={id}>Note (required)</label>
      <textarea id={id} value={note} disabled={locked} onChange={(ev) => setNote(ev.target.value)} rows={2} />
      {!locked && <div className="row">
        <button disabled={!note.trim()} onClick={() => onDecide(e.id, 'RESOLVED', note)}>Mark resolved</button>
        <button className="ghost" disabled={!note.trim()} onClick={() => onDecide(e.id, 'ACKNOWLEDGED', note)}>Acknowledge</button>
      </div>}
      {e.decidedAt && <p className="muted">Decided {new Date(e.decidedAt).toLocaleString()}</p>}
    </li>
  );
}

export default function App() {
  const [s, d] = useReducer(reducer, initial);
  const [view, setView] = useState<'closeout' | 'notes'>('closeout');
  const [filter, setFilter] = useState<'ALL' | ExType>('ALL');
  const [decisionFilter, setDecisionFilter] = useState<'ALL' | Decision>('ALL');
  const [name, setName] = useState('');
  const dlg = useRef<HTMLDialogElement>(null);

  const onFile = async (kind: FileKind, f: File) => {
    const text = f.size > MAX_BYTES ? '' : await f.text();
    d({ t: 'LOAD', kind, name: f.name, text, bytes: f.size });
  };
  const exceptions = s.exceptions;
  const unresolved = exceptions.filter((e) => e.decision === 'OPEN').length;
  const status = s.totals ? banner(s.totals, exceptions) : null;
  const confirmed = s.status === 'CONFIRMED';
  const step = confirmed ? 3 : s.totals ? (canComplete(exceptions) ? 2 : 1) : 0;
  const shown = exceptions.filter((e) => (filter === 'ALL' || e.type === filter) && (decisionFilter === 'ALL' || e.decision === decisionFilter));

  const download = () => {
    if (!s.totals || !s.confirmedAt || !status) return;
    const blob = new Blob([buildReport({ businessDate: s.businessDate, totals: s.totals, exceptions, banner: status, reviewer: s.reviewer, confirmedAt: s.confirmedAt })], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = reportName(s.businessDate); a.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };
  const startNew = () => {
    if (!confirm('Discard this closeout and start over?')) return;
    d({ t: 'RESET' }); setName(''); setFilter('ALL'); setDecisionFilter('ALL');
  };

  return (
    <>
      <header className="top">
        <div className="brand"><span className="brand-mark" aria-hidden="true">D</span><div><p className="eyebrow">RESTAURANT OPERATIONS</p><h1>Daily closeout</h1></div></div>
        <div className="top-tools">
          <nav className="workspace-tabs" aria-label="Workspace">
            <button type="button" className={view === 'closeout' ? 'workspace-tab active' : 'workspace-tab'} aria-current={view === 'closeout' ? 'page' : undefined} onClick={() => setView('closeout')}>Closeout</button>
            <button type="button" className={view === 'notes' ? 'workspace-tab active' : 'workspace-tab'} aria-current={view === 'notes' ? 'page' : undefined} onClick={() => setView('notes')}>Shift notes</button>
          </nav>
          {view === 'closeout' && <ol className="steps" aria-label="Progress">{STEPS.map((x, i) => <li key={x} aria-current={i === step ? 'step' : undefined} className={i < step ? 'done' : ''}><span>{String(i + 1).padStart(2, '0')}</span>{x}</li>)}</ol>}
        </div>
      </header>
      {view === 'notes' ? <NotesWorkspace /> : <main>
        {!s.totals && (
          <section aria-labelledby="up">
            <div className="section-heading"><div><p className="eyebrow">01 / IMPORT</p><h2 id="up">Import the day's files</h2></div><span className="section-mark" aria-hidden="true">01</span></div>
            <p className="muted">Choose the business date, then upload your sales export and your payment settlement export.</p>
            <div className="row">
              <label>Business date <input type="date" value={s.businessDate} onChange={(e) => d({ t: 'DATE', date: e.target.value })} /></label>
              <button className="ghost" onClick={() => d({ t: 'DEMO', date: DEMO.date, sales: DEMO.sales, settlements: DEMO.settlements })}>Load demo scenario</button>
            </div>
            {s.inputs.sales?.name.startsWith('demo_') && <p className="msg warn">Demo mode: synthetic data, no real customers.</p>}
            <div className="cols">
              <FileSlot kind="sales" label="Sales file" result={s.sales} onFile={onFile} />
              <FileSlot kind="settlements" label="Settlement file" result={s.settlements} onFile={onFile} />
            </div>
            <p className="format-hint">CSV format: order ID, date and time, payment method, amount. Maximum 5 MB per file.</p>
            {((s.sales?.errors.length ?? 0) > 0 || (s.settlements?.errors.length ?? 0) > 0) && <p className="msg err" role="alert">Fix invalid rows and upload clean files before reconciling. Invalid rows are not included in totals.</p>}
            <button disabled={s.status !== 'IMPORTED'} onClick={() => d({ t: 'RUN' })}>Run reconciliation</button>
          </section>
        )}

        {s.totals && status && (
          <>
            <section className="summary" aria-label="Summary">
              <div className={`banner b-${status.split(' ')[0].toLowerCase()}`} role="status"><b>{status}</b>{confirmed && ` · confirmed by ${s.reviewer}`}</div>
              <dl>
                <div><dt>Sales total</dt><dd className="num">{fmt(s.totals.salesCents)}</dd></div>
                <div><dt>Cash (not expected to settle)</dt><dd className="num">{fmt(s.totals.byMethod.cash?.sales ?? 0)}</dd></div>
                <div><dt>Expected settlement</dt><dd className="num">{fmt(s.totals.expectedSettlementCents)}</dd></div>
                <div><dt>Settlement total</dt><dd className="num">{fmt(s.totals.settlementCents)}</dd></div>
                <div><dt>Difference</dt><dd className="num">{fmt(s.totals.diffCents)}</dd></div>
                <div><dt>Unresolved</dt><dd className="num">{unresolved}</dd></div>
              </dl>
            </section>

            <section aria-labelledby="mm"><div className="section-heading"><div><p className="eyebrow">02 / RECONCILE</p><h2 id="mm">Totals by payment method</h2></div><span className="section-mark" aria-hidden="true">02</span></div>
              <table><thead><tr><th>Method</th><th>Sales</th><th>Settled</th></tr></thead>
                <tbody>{Object.entries(s.totals.byMethod).sort().map(([m, v]) => <tr key={m}><td>{m}</td><td className="num">{fmt(v.sales)}</td><td className="num">{fmt(v.settled)}</td></tr>)}</tbody></table>
            </section>

            <section aria-labelledby="ex"><div className="section-heading"><div><p className="eyebrow">03 / REVIEW</p><h2 id="ex">Exceptions <span className="count">{exceptions.length}</span></h2></div><span className="section-mark" aria-hidden="true">03</span></div>
              {exceptions.length === 0 ? <p className="empty">All sales and settlements match for this closeout.</p> : <>
                <div className="row">
                  <label>Type <select value={filter} onChange={(e) => setFilter(e.target.value as 'ALL' | ExType)}><option value="ALL">All</option>{(Object.keys(LABEL) as ExType[]).map((t) => <option key={t} value={t}>{LABEL[t]}</option>)}</select></label>
                  <label>State <select value={decisionFilter} onChange={(e) => setDecisionFilter(e.target.value as 'ALL' | Decision)}><option value="ALL">All</option><option value="OPEN">Open</option><option value="RESOLVED">Resolved</option><option value="ACKNOWLEDGED">Acknowledged</option></select></label>
                </div>
                <ul className="list">{shown.map((e) => <ExceptionCard key={e.id + e.decidedAt} e={e} locked={confirmed} onDecide={(id, dec, n) => d({ t: 'DECIDE', id, decision: dec, note: n })} />)}</ul>
                {shown.length === 0 && <p className="muted">No exceptions match these filters.</p>}</>}
            </section>

            <section className="row actions">
              {!confirmed && <button disabled={!canComplete(exceptions)} onClick={() => dlg.current?.showModal()}>Complete closeout</button>}
              {!confirmed && !canComplete(exceptions) && <span className="muted">Action every exception to enable closeout.</span>}
              <button disabled={!confirmed} onClick={download}>Download report ({reportName(s.businessDate)})</button>
              <button className="ghost" onClick={startNew}>Start new closeout</button>
            </section>
          </>
        )}
      </main>}

      {view === 'closeout' && <dialog ref={dlg} aria-labelledby="cd">
        <h2 id="cd">Complete closeout?</h2>
        <p>Status: <b>{status}</b>. Difference: <b className="num">{fmt(s.totals?.diffCents ?? 0)}</b>. The closeout becomes read-only.</p>
        <label>Reviewer name <input value={name} onChange={(e) => setName(e.target.value)} autoFocus /></label>
        <div className="row">
          <button disabled={!name.trim()} onClick={() => { d({ t: 'CONFIRM', reviewer: name, at: new Date().toISOString() }); dlg.current?.close(); }}>Confirm closeout</button>
          <button className="ghost" onClick={() => dlg.current?.close()}>Cancel</button>
        </div>
      </dialog>}
    </>
  );
}
