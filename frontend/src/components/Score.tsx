import { useState } from 'react'
import { Brain, TrendingUp } from 'lucide-react'
import { ethers } from 'ethers'

interface Props {
  address: string
  contractAddress: string
}

const ABI = [
  "function computeScore(uint64 income, uint64 debt) external",
  "function getScore(address user) external view returns (uint64)",
  "function hasProfile(address) external view returns (bool)",
]

export default function Score({ address, contractAddress }: Props) {
  const [income, setIncome] = useState('')
  const [debt, setDebt] = useState('')
  const [loading, setLoading] = useState(false)
  const [score, setScore] = useState<number | null>(null)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)

  const getContract = async () => {
    const { ethereum } = window as any
    await ethereum.request({ method: 'eth_requestAccounts' })
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    })
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return { contract: new ethers.Contract(contractAddress, ABI, signer), provider }
  }

  const handleCompute = async () => {
    if (!income || !debt) return
    setLoading(true)
    setMsg(null)
    try {
      const { contract, provider } = await getContract()
      const tx = await contract.computeScore(parseInt(income), parseInt(debt))
      setMsg({ type: 'info', text: '⏳ Transaction submitted! Waiting for confirmation...' })
      await tx.wait()
      const rawScore = await contract.getScore(address)
      setScore(parseInt(rawScore.toString()))
      setMsg({ type: 'success', text: '✅ Score computed on-chain! Hash: ' + tx.hash.slice(0, 20) + '...' })
    } catch (e: any) {
      if (e.code === 4001) {
        setMsg({ type: 'error', text: '❌ Transaction rejected.' })
      } else {
        setMsg({ type: 'error', text: '❌ ' + (e.reason || e.message || 'Failed') })
      }
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

        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--zama-yellow-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Brain size={20} color="var(--zama-yellow)" />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: '16px' }}>Compute Score</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Signed on-chain with FHE</div>
            </div>
          </div>

          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>MONTHLY INCOME</label>
          <input className="input-field" type="number" placeholder="e.g. 5000" value={income} onChange={e => setIncome(e.target.value)} style={{ marginBottom: '16px' }} />

          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>TOTAL DEBT</label>
          <input className="input-field" type="number" placeholder="e.g. 1000" value={debt} onChange={e => setDebt(e.target.value)} style={{ marginBottom: '20px' }} />

          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            🔒 Income and debt are encrypted before sending. MetaMask will sign the on-chain FHE computation.
          </div>

          <button className="btn-primary" style={{ width: '100%' }} onClick={handleCompute} disabled={loading || !income || !debt}>
            {loading ? '⏳ Waiting for MetaMask...' : '🧠 Compute Shadow Score'}
          </button>

          {msg && <div className={'alert alert-' + msg.type} style={{ marginTop: '12px' }}>{msg.text}</div>}
        </div>

        <div className="card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          {score === null ? (
            <div>
              <div style={{ fontSize: '64px', marginBottom: '16px', opacity: 0.3 }}>🌑</div>
              <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '8px' }}>No Score Yet</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Enter your financial data and sign the transaction to compute your encrypted credit score</div>
            </div>
          ) : (
            <div style={{ width: '100%' }}>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>Your Shadow Score</div>
              <div style={{ fontSize: '80px', fontWeight: 800, fontFamily: 'Space Grotesk', color: getScoreColor(score), marginBottom: '8px', lineHeight: 1 }}>{score}</div>
              <div style={{ fontSize: '18px', fontWeight: 600, color: getScoreColor(score), marginBottom: '20px' }}>{getScoreLabel(score)}</div>

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

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>📐 FHE Score Formula</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Base Score', value: '300 pts', desc: 'Starting baseline' },
            { label: 'Income Boost', value: '+500 max', desc: '(income × 500) / 1000' },
            { label: 'Debt Penalty', value: '-200 max', desc: '(debt × 200) / 1000' },
            { label: 'Range', value: '300–800', desc: 'Clamped on-chain' },
          ].map((f, i) => (
            <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{f.label}</div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--zama-yellow)', fontFamily: 'Space Grotesk', marginBottom: '4px' }}>{f.value}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}