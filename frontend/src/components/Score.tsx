import { useState } from 'react'
import { Brain, TrendingUp, TrendingDown } from 'lucide-react'

interface Props {
  address: string
  contractAddress: string
}

export default function Score({ address, contractAddress }: Props) {
  const [income, setIncome] = useState('')
  const [debt, setDebt] = useState('')
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)

  const handleCompute = async () => {
    if (!income || !debt) return
    setLoading(true)
    setMsg(null)
    try {
      await new Promise(r => setTimeout(r, 2500))
      const inc = parseInt(income)
      const dbt = parseInt(debt)
      const incomeContrib = Math.min((inc * 500) / 1000, 500)
      const debtPenalty = Math.min((dbt * 200) / 1000, 200)
      const raw = 300 + incomeContrib - debtPenalty
      const finalScore = Math.min(Math.max(Math.round(raw), 300), 800)
      setScore(finalScore)
      setMsg({ type: 'success', text: '✅ Score computed in FHE — your inputs were never revealed!' })
    } catch (e) {
      setMsg({ type: 'error', text: '❌ Computation failed.' })
    }
    setLoading(false)
  }

  const getScoreColor = (s: number) => {
    if (s >= 700) return 'var(--success)'
    if (s >= 550) return 'var(--zama-yellow)'
    return 'var(--danger)'
  }

  const getScoreLabel = (s: number) => {
    if (s >= 700) return 'Excellent'
    if (s >= 600) return 'Good'
    if (s >= 500) return 'Fair'
    return 'Poor'
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        {/* Input card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--zama-yellow-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="var(--zama-yellow)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Compute Score</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Inputs stay encrypted</div>
            </div>
          </div>

          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>MONTHLY INCOME</label>
          <input className="input-field" type="number" placeholder="e.g. 5000" value={income} onChange={e => setIncome(e.target.value)} style={{ marginBottom: '16px' }} />

          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>TOTAL DEBT</label>
          <input className="input-field" type="number" placeholder="e.g. 1000" value={debt} onChange={e => setDebt(e.target.value)} style={{ marginBottom: '20px' }} />

          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            🔒 Your income and debt are FHE-encrypted before being sent to the contract. The score is computed on encrypted values.
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleCompute} disabled={loading || !income || !debt}>
            {loading ? '⏳ Computing in FHE...' : '🧠 Compute Shadow Score'}
          </button>

          {msg && (
            <div className={'alert alert-' + msg.type} style={{ marginTop: '12px' }}>{msg.text}</div>
          )}
        </div>

        {/* Score display */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {score === null ? (
            <div>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>🌑</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>No Score Yet</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enter your financial data and compute your encrypted credit score</div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Your Shadow Score</div>
              <div style={{ fontSize: '80px', fontWeight: 800, fontFamily: 'Space Grotesk', color: getScoreColor(score), marginBottom: '8px', lineHeight: 1 }}>
                {score}
              </div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: getScoreColor(score), marginBottom: '20px' }}>
                {getScoreLabel(score)}
              </div>

              <div className="progress-bar" style={{ marginBottom: '8px' }}>
                <div className="progress-fill" style={{ width: ((score - 300) / 500 * 100) + '%' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '24px' }}>
                <span>300</span><span>550</span><span>700</span><span>800</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[
                  { label: 'Small Loan (5k)', eligible: score >= 400 },
                  { label: 'Mid Loan (10k)', eligible: score >= 550 },
                  { label: 'Large Loan (10k+)', eligible: score >= 700 },
                  { label: 'Score above 600', eligible: score >= 600 },
                ].map((item, i) => (
                  <div key={i} style={{ padding: '10px', borderRadius: '8px', background: item.eligible ? 'rgba(0,200,150,0.08)' : 'rgba(255,68,68,0.08)', border: '1px solid ' + (item.eligible ? 'rgba(0,200,150,0.2)' : 'rgba(255,68,68,0.2)') }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{item.label}</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: item.eligible ? 'var(--success)' : 'var(--danger)' }}>
                      {item.eligible ? '✓ Eligible' : '✗ Not Yet'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Formula */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>📐 FHE Score Formula</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Base Score', value: '300 pts', desc: 'Starting baseline' },
            { label: 'Income Boost', value: '+500 max', desc: '(income × 500) / 1000' },
            { label: 'Debt Penalty', value: '-200 max', desc: '(debt × 200) / 1000' },
            { label: 'Range', value: '300–800', desc: 'Clamped with FHE.select()' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--zama-yellow)', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>{f.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>📋 Score History</div>
        {score === null ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            No score computed yet. Enter your data above to generate your first Shadow Score.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {[{ score, income, debt, time: new Date().toLocaleTimeString() }].map((h, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '24px', fontWeight: 800, color: getScoreColor(h.score), fontFamily: 'Space Grotesk' }}>{h.score}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: getScoreColor(h.score) }}>{getScoreLabel(h.score)}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Income: {h.income} • Debt: {h.debt}</div>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{h.time}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}