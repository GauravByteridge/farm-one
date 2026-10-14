/**
 * ETL Copilot — full-page console
 * Left: pipeline source list | Center: 5-screen tab flow | Right: copilot log
 */
import { useState, useEffect, useRef } from 'react'
import { CheckCircle2, Circle, Loader2, ChevronRight, Play, RefreshCw, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

const SOURCES = [
  { id: 'herd',     label: 'Herd DB',   status: 'done' },
  { id: 'feed',     label: 'Feed DB',   status: 'running' },
  { id: 'genetics', label: 'Genetics',  status: 'pending' },
  { id: 'unify',    label: 'Unify',     status: 'pending' },
]

const SCREENS = ['Understand', 'Generate', 'Run', 'Anomalies', 'Output']

const SCHEMA_FIELDS = [
  { field: 'cow_id', type: 'VARCHAR(20)', null_pct: 0, distinct: 3835, sample: 'C-0421' },
  { field: 'farm_id', type: 'VARCHAR(20)', null_pct: 0, distinct: 5, sample: 'FARM-00101' },
  { field: 'record_date', type: 'DATE', null_pct: 0.2, distinct: 365, sample: '2024-06-15' },
  { field: 'milk_kg', type: 'FLOAT', null_pct: 1.4, distinct: 8241, sample: '28.42' },
  { field: 'fat_pct', type: 'FLOAT', null_pct: 3.1, distinct: 412, sample: '4.12' },
  { field: 'scc', type: 'INT', null_pct: 5.8, distinct: 2841, sample: '142000' },
]

const PYSPARK_SCRIPT = `# === Read ===
df = spark.read.format("jdbc") \\
    .option("url", "jdbc:postgresql://***:5432/herddb") \\
    .option("dbtable", "cow_daily_records") \\
    .load()
# AI: Loaded 1.2M rows from herd database.

# === Standardize ===
from pyspark.sql.functions import col, to_date, when
df = df.withColumn("record_date", to_date("record_date", "MM/dd/yyyy")) \\
    .withColumn("milk_kg", when(col("milk_unit")=="lbs",
        col("milk_volume")*0.453592).otherwise(col("milk_volume"))) \\
    .drop("milk_volume", "milk_unit")
# AI: Standardised date format and milk units (lbs→kg for 31 records).

# === Quality checks ===
from pyspark.sql.functions import current_date
df_clean = df.filter(
    (col("milk_kg").between(0, 60)) &  # QR-PLAUS-002
    (col("record_date") <= current_date()) &  # QR-DATE-003
    (col("cow_id").isNotNull())  # QR-ID-002
)
df_quarantine = df.subtract(df_clean)
# AI: Quarantined 127 records (0.86%). Top issues: future dates (3), implausible values (11).

# === Write ===
df_clean.write.format("delta").mode("overwrite") \\
    .option("path", "./data/delta/silver/herd_records") \\
    .saveAsTable("silver.herd_records")
df_quarantine.write.format("delta").mode("overwrite") \\
    .option("path", "./data/delta/quarantine/herd_records") \\
    .saveAsTable("quarantine.herd_records")`

const LOG_LINES = [
  { text: 'Orchestrator: Starting Herd DB pipeline run...', type: 'info' },
  { text: 'Schema Profiler: Connecting to herd database...', type: 'info' },
  { text: 'Schema Profiler: Found 6 tables, 24 columns, ~1.2M rows', type: 'info' },
  { text: 'Schema Profiler: Sampling 500 rows per table (masked)', type: 'info' },
  { text: 'Schema Profiler: ✓ Understanding complete', type: 'success' },
  { text: 'Orchestrator: Awaiting human approval to proceed', type: 'warn' },
  { text: '✓ Human approved: "Looks right, proceed"', type: 'success' },
  { text: 'Script Writer: Generating ETL script v1...', type: 'info' },
  { text: 'Script Writer: Applied unit conversion rule QR-UNIT-001', type: 'info' },
  { text: 'Script Writer: ✓ Script generated (312 tokens, 1.2s)', type: 'success' },
  { text: 'Orchestrator: Awaiting human approval to run', type: 'warn' },
  { text: '✓ Human approved: "Run it"', type: 'success' },
  { text: 'Spark: Starting job... 1,247,832 rows read', type: 'info' },
  { text: 'Verifier: Running 14 quality checks...', type: 'info' },
  { text: 'Verifier: Found 3 anomalies — see Anomalies tab', type: 'warn' },
  { text: '✓ Run complete: 1,236,721 written, 11,111 quarantined', type: 'success' },
]

const ANOMALIES = [
  { id: 'AN-001', desc: 'milk_kg > 60 kg/day (implausible)', severity: 'P2', rows: 11, fix: 'Quarantine records', status: 'Fixed' },
  { id: 'AN-002', desc: 'record_date in future', severity: 'P1', rows: 3, fix: 'Quarantine + flag source', status: 'Fixed' },
  { id: 'AN-003', desc: 'scc values negative (−1 sentinel)', severity: 'P3', rows: 841, fix: 'Replace with NULL', status: 'Fixed' },
]

const OUTPUT_ROWS = [
  { cow_id: 'C-0421', farm_id: 'FARM-00101', record_date: '2024-06-15', milk_kg: 28.42, fat_pct: 4.12, scc: 142000 },
  { cow_id: 'C-0421', farm_id: 'FARM-00101', record_date: '2024-06-14', milk_kg: 29.10, fat_pct: 4.08, scc: 138000 },
  { cow_id: 'C-0832', farm_id: 'FARM-00142', record_date: '2024-06-15', milk_kg: 31.20, fat_pct: 3.98, scc: 89000 },
]

export default function EtlCopilot() {
  const [activeSource, setActiveSource] = useState('herd')
  const [activeScreen, setActiveScreen] = useState(0)
  const [logVisible, setLogVisible] = useState<number>(0)
  const [runProgress, setRunProgress] = useState(0)
  const [approved, setApproved] = useState(false)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (logVisible < LOG_LINES.length) {
      const t = setTimeout(() => setLogVisible(l => l + 1), 600)
      return () => clearTimeout(t)
    }
  }, [logVisible])

  useEffect(() => {
    if (activeScreen === 2 && approved && runProgress < 100) {
      const t = setTimeout(() => setRunProgress(p => Math.min(100, p + 4)), 120)
      return () => clearTimeout(t)
    }
  }, [activeScreen, approved, runProgress])

  useEffect(() => {
    logRef.current?.scrollTo({ top: 9999, behavior: 'smooth' })
  }, [logVisible])

  return (
    <div className="flex flex-col h-full bg-[#F7F8FA]">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#006837]" />
          <span className="text-base font-bold text-gray-900">Farm One ETL Copilot</span>
        </div>
        <span className="text-xs bg-[#E8F5EE] text-[#006837] border border-[#D0EBD9] px-2.5 py-0.5 rounded-full font-medium">
          Replay Mode
        </span>
        <span className="text-xs text-gray-400 ml-auto">Run 1 of 2 · Profile: Local</span>
      </div>

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left sidebar — pipeline */}
        <div className="w-[200px] shrink-0 bg-white border-r border-gray-200 flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3 border-b border-gray-100">
            Pipeline
          </p>
          <div className="flex-1 overflow-y-auto py-2">
            {SOURCES.map((s, i) => (
              <button key={s.id} onClick={() => setActiveSource(s.id)}
                className={cn('w-full flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors',
                  activeSource === s.id ? 'bg-[#E8F5EE] text-[#006837] font-medium' : 'text-gray-600 hover:bg-gray-50')}>
                {s.status === 'done'    ? <CheckCircle2 className="h-4 w-4 text-[#006837] shrink-0" />
                 : s.status === 'running' ? <Loader2 className="h-4 w-4 text-amber-500 animate-spin shrink-0" />
                 : <Circle className="h-4 w-4 text-gray-300 shrink-0" />}
                ({i + 1}) {s.label}
              </button>
            ))}
          </div>
          {/* Status bar */}
          <div className="border-t border-gray-100 px-3 py-3 space-y-1 text-[10px] text-gray-500">
            <div className="flex justify-between"><span>Rows read</span><span className="font-mono">1,247,832</span></div>
            <div className="flex justify-between"><span>Written</span><span className="font-mono text-[#006837]">1,236,721</span></div>
            <div className="flex justify-between"><span>Rejected</span><span className="font-mono text-amber-600">11,111</span></div>
            <div className="flex justify-between"><span>DQ score</span><span className="font-mono text-[#006837]">97.8</span></div>
          </div>
        </div>

        {/* Center — main panel */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Screen tabs */}
          <div className="flex items-center gap-0 border-b border-gray-200 bg-white px-4 shrink-0">
            {SCREENS.map((s, i) => (
              <button key={s} onClick={() => setActiveScreen(i)}
                className={cn('flex items-center gap-1.5 px-3.5 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px',
                  activeScreen === i ? 'border-[#006837] text-[#006837]' : 'border-transparent text-gray-500 hover:text-gray-700')}>
                <span className={cn('h-4 w-4 rounded-full flex items-center justify-center text-[9px] font-bold',
                  activeScreen === i ? 'bg-[#006837] text-white' : 'bg-gray-200 text-gray-500')}>{i + 1}</span>
                {s}
              </button>
            ))}
          </div>

          {/* Screen content */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Screen 1 — Understand */}
            {activeScreen === 0 && (
              <div className="space-y-4 max-w-2xl">
                <div className="bg-white rounded-xl border border-gray-200 p-4">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Connection</p>
                  <code className="text-xs font-mono text-gray-600">jdbc:postgresql://***:5432/herddb (read-only)</code>
                </div>
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide px-4 py-2.5 bg-gray-50 border-b border-gray-100">
                    Schema Profile — cow_daily_records
                  </p>
                  <table className="w-full text-xs">
                    <thead><tr className="border-b border-gray-100 text-gray-400">
                      {['Field','Type','Null%','Distinct','Sample'].map(h => <th key={h} className="text-left py-2 px-3 font-medium">{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {SCHEMA_FIELDS.map(f => (
                        <tr key={f.field} className="border-b border-gray-50">
                          <td className="py-2 px-3 font-mono text-gray-800">{f.field}</td>
                          <td className="py-2 px-3 text-gray-500">{f.type}</td>
                          <td className={cn('py-2 px-3 tabular-nums', f.null_pct > 3 ? 'text-amber-600' : 'text-gray-600')}>{f.null_pct}%</td>
                          <td className="py-2 px-3 tabular-nums text-gray-600">{f.distinct.toLocaleString()}</td>
                          <td className="py-2 px-3 font-mono text-gray-400">{f.sample}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="bg-[#E8F5EE] border border-[#D0EBD9] rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="h-4 w-4 text-[#006837]" />
                    <p className="text-sm font-bold text-[#006837]">AI Understanding</p>
                    <span className="text-[10px] text-[#008a43] ml-auto">Generated from verified schema + 500-row sample</span>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    This table contains one row per cow per day. Primary entity is <code className="bg-white px-1 rounded text-xs">cow_id</code> joined to <code className="bg-white px-1 rounded text-xs">farm_id</code>. Key issues: (1) milk is in lbs for ~2.5% of rows — conversion needed; (2) <code>scc</code> uses −1 as null sentinel; (3) 3 rows have future dates. Data spans Jan 2022 – Jun 2024. Recommend standardising units, replacing −1 with NULL, and quarantining future dates.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <button onClick={() => setActiveScreen(1)} className="text-xs bg-[#006837] text-white px-3 py-1.5 rounded-lg font-medium hover:bg-[#004D28] transition-colors">
                      Accept understanding →
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Screen 2 — Generate */}
            {activeScreen === 1 && (
              <div className="space-y-4 max-w-2xl">
                <div className="flex items-center gap-3">
                  <span className="text-xs bg-[#E8F5EE] text-[#006837] px-2.5 py-1 rounded-full font-medium">AI Generated · Script v1</span>
                  <span className="text-xs text-gray-400">llama-3.3-70b · 312 tokens · 1.2s</span>
                  <button className="ml-auto text-xs flex items-center gap-1 text-gray-500 hover:text-gray-800">
                    <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                  </button>
                </div>
                <div className="bg-gray-900 rounded-xl p-5 overflow-x-auto">
                  <pre className="text-xs text-green-400 font-mono leading-relaxed whitespace-pre-wrap">{PYSPARK_SCRIPT}</pre>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setApproved(true); setActiveScreen(2) }}
                    className="text-sm bg-[#006837] text-white px-4 py-2 rounded-lg font-semibold hover:bg-[#004D28] transition-colors flex items-center gap-1.5">
                    <Play className="h-4 w-4" /> Approve & Run
                  </button>
                </div>
              </div>
            )}

            {/* Screen 3 — Run */}
            {activeScreen === 2 && (
              <div className="space-y-4 max-w-2xl">
                <div className="space-y-2">
                  {['Read source data', 'Transform & join', 'Quality checks', 'Write to Delta'].map((step, i) => {
                    const stepPct = (i + 1) * 25
                    const done = runProgress >= stepPct
                    const active = runProgress >= (i * 25) && !done
                    return (
                      <div key={step} className="flex items-center gap-3">
                        {done ? <CheckCircle2 className="h-5 w-5 text-[#006837] shrink-0" />
                          : active ? <Loader2 className="h-5 w-5 text-amber-500 animate-spin shrink-0" />
                          : <Circle className="h-5 w-5 text-gray-300 shrink-0" />}
                        <span className={cn('text-sm', done ? 'text-gray-900 font-medium' : 'text-gray-400')}>{step}</span>
                        {done && <span className="text-xs text-[#006837] ml-auto">✓ done</span>}
                      </div>
                    )
                  })}
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#006837] rounded-full transition-all duration-300" style={{ width: `${runProgress}%` }} />
                </div>
                <div className="grid grid-cols-3 gap-3 text-center text-xs">
                  {[['Rows read', Math.round(1247832 * runProgress / 100).toLocaleString()],
                    ['Written', Math.round(1236721 * runProgress / 100).toLocaleString()],
                    ['Rejected', Math.round(11111 * runProgress / 100).toLocaleString()]].map(([l, v]) => (
                    <div key={l} className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-gray-400">{l}</p>
                      <p className="font-bold tabular-nums text-gray-900 text-base mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                {!approved && (
                  <button onClick={() => { setApproved(true) }}
                    className="text-sm bg-[#006837] text-white px-4 py-2 rounded-lg font-semibold">
                    Approve & Start
                  </button>
                )}
              </div>
            )}

            {/* Screen 4 — Anomalies */}
            {activeScreen === 3 && (
              <div className="max-w-2xl space-y-3">
                <p className="text-sm text-gray-500">3 anomalies detected and resolved automatically</p>
                {ANOMALIES.map(a => (
                  <div key={a.id} className="bg-white rounded-xl border border-gray-200 p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs text-gray-400">{a.id}</span>
                      <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded-full',
                        a.severity === 'P1' ? 'bg-rose-100 text-rose-700' : a.severity === 'P2' ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-gray-600')}>
                        {a.severity}
                      </span>
                      <span className="text-xs bg-green-100 text-[#006837] px-2 py-0.5 rounded-full font-medium ml-auto">{a.status}</span>
                    </div>
                    <p className="text-sm text-gray-800">{a.desc}</p>
                    <div className="flex gap-4 text-xs text-gray-500">
                      <span>Rows affected: <b className="text-gray-800">{a.rows.toLocaleString()}</b></span>
                      <span>Fix: <b className="text-gray-800">{a.fix}</b></span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Screen 5 — Output */}
            {activeScreen === 4 && (
              <div className="max-w-2xl space-y-4">
                <div className="grid grid-cols-3 gap-3 text-xs text-center">
                  {[['Table', 'silver.herd_records'], ['Rows', '1,236,721'], ['DQ Score', '97.8 / 100']].map(([l, v]) => (
                    <div key={l} className="bg-white rounded-lg border border-gray-200 p-3">
                      <p className="text-gray-400">{l}</p>
                      <p className="font-bold text-gray-900 text-sm mt-0.5">{v}</p>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500">Sample rows (masked PII):</p>
                <div className="overflow-x-auto bg-white rounded-xl border border-gray-200">
                  <table className="w-full text-xs">
                    <thead><tr className="bg-gray-50 border-b border-gray-100">
                      {Object.keys(OUTPUT_ROWS[0]).map(k => <th key={k} className="text-left py-2 px-3 text-gray-500 font-medium">{k}</th>)}
                    </tr></thead>
                    <tbody>
                      {OUTPUT_ROWS.map((r, i) => (
                        <tr key={i} className="border-b border-gray-50">
                          {Object.values(r).map((v, j) => <td key={j} className="py-2 px-3 font-mono text-gray-700">{String(v)}</td>)}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right — Copilot log */}
        <div className="w-[260px] shrink-0 bg-white border-l border-gray-200 flex flex-col">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 py-3 border-b border-gray-100 flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#006837]" /> Copilot Log
          </p>
          <div ref={logRef} className="flex-1 overflow-y-auto p-3 space-y-1.5">
            {LOG_LINES.slice(0, logVisible).map((l, i) => (
              <div key={i} className={cn('text-xs leading-relaxed rounded px-2 py-1',
                l.type === 'success' ? 'text-[#006837] bg-[#E8F5EE]'
                  : l.type === 'warn' ? 'text-amber-700 bg-amber-50'
                  : 'text-gray-600')}>
                {l.text}
              </div>
            ))}
            {logVisible < LOG_LINES.length && (
              <div className="flex items-center gap-1 text-xs text-gray-400">
                <Loader2 className="h-3 w-3 animate-spin" /> thinking…
              </div>
            )}
          </div>
          <div className="border-t border-gray-100 p-3 space-y-2">
            <button className="w-full py-2 rounded-lg bg-[#006837] text-white text-xs font-semibold hover:bg-[#004D28] transition-colors">
              ✓ Approve
            </button>
            <button className="w-full py-2 rounded-lg border border-gray-200 text-gray-600 text-xs font-medium hover:bg-gray-50 transition-colors">
              ✗ Reject
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
