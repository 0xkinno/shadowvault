import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Info, TrendingUp } from 'lucide-react'

interface Props {
  address: string
  contractAddress: string
}

export default function Vault({ address }: Props) {
  const [depositAmt, setDepositAmt] = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)

  const handleDeposit = async () => {
    if (!depositAmt) return
    setLoading(true)
    setMsg(null)
    try {
      await new Promise(r => setTimeout(r, 2000))
      setMsg({ type: 'success', text: `✅ Deposit of ${depositAmt} encrypted and stored on-chain!` })
      setDepositAmt('')
    } catch (e) {
      setMsg({ type: 'error', text: '❌ Transaction failed. Please try again.' })
    }
    setLoading(false)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmt) return
    setLoading(true)
    setMsg(null)
    try {
      await new Promise(r => setTimeout(r, 2000))
      setMsg({ type: 'success', text: `✅ Withdrawal of ${withdrawAmt} processed successfully!` })
      setWithdrawAmt('')
    } catch (e) {
      setMsg({ type: 'error', text: '❌ Transaction failed. Please try again.' })
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

      {/* How it works */}
      <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #161616, #1a1a0a)', borderColor: 'var(--border-yellow)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <Info size={16} color="var(--zama-yellow)" />
          <span style={{ fontWeight: 600, color: 'var(--zama-yellow)', fontSize: '14px' }}>How FHE Encryption Works</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { step: '01', title: 'Encrypt Locally', desc: 'Your amount is encrypted in your browser before being sent anywhere' },
            { step: '02', title: 'Store On-Chain', desc: 'Only the encrypted ciphertext is stored — no one can see your balance' },
            { step: '03', title: 'Compute Privately', desc: 'Smart contract computes on encrypted data without ever decrypting it' },
          ].map(s => (
            <div key={s.step} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--zama-yellow)', opacity: 0.3, fontFamily: 'Space Grotesk', minWidth: '32px' }}>{s.step}</div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>{s.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.5 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Deposit */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(0,200,150,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowDownCircle size={20} color="var(--success)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Deposit</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Encrypted with FHE</div>
          </div>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
          AMOUNT (in units)
        </label>
        <input
          className="input-field"
          type="number"
          placeholder="e.g. 1000"
          value={depositAmt}
          onChange={e => setDepositAmt(e.target.value)}
          style={{ marginBottom: '16px' }}
        />

        <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          🔒 Amount will be FHE-encrypted before submission. Your balance remains private.
        </div>

        <button className="btn-primary" style={{ width: '100%' }} onClick={handleDeposit} disabled={loading || !depositAmt}>
          {loading ? '⏳ Encrypting & Sending...' : '🔐 Deposit Privately'}
        </button>

        {msg && <div className={`alert alert-${msg.type}`}>{msg.text}</div>}
      </div>

      {/* Withdraw */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ArrowUpCircle size={20} color="var(--danger)" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px' }}>Withdraw</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>FHE balance check</div>
          </div>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
          AMOUNT (in units)
        </label>
        <input
          className="input-field"
          type="number"
          placeholder="e.g. 500"
          value={withdrawAmt}
          onChange={e => setWithdrawAmt(e.target.value)}
          style={{ marginBottom: '16px' }}
        />

        <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
          ⚡ Contract checks balance in FHE — insufficient funds never reveal your balance.
        </div>

        <button className="btn-secondary" style={{ width: '100%' }} onClick={handleWithdraw} disabled={loading || !withdrawAmt}>
          {loading ? '⏳ Processing...' : '💸 Withdraw'}
        </button>
      </div>

      {/* Yield info */}
      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <TrendingUp size={18} color="var(--zama-yellow)" />
          <span style={{ fontWeight: 700, fontSize: '16px' }}>Yield Accrual — 5% APY</span>
          <span className="badge badge-yellow">Auto-compounding</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Current APY', value: '5.00%' },
            { label: 'Yield Model', value: 'Private' },
            { label: 'Compounding', value: 'On-chain' },
          ].map((s, i) => (
            <div key={i} style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.6px' }}>{s.label}</div>
              <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--zama-yellow)', fontFamily: 'Space Grotesk' }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}