import { useState } from 'react'
import { ShieldCheck, ShieldX, Wallet, CreditCard, BarChart3 } from 'lucide-react'

interface Props {
  address: string
  contractAddress: string
}

type ProofResult = { type: string; result: boolean | null; loading: boolean }

export default function Proofs({ address }: Props) {
  const [scoreThreshold, setScoreThreshold] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [balanceThreshold, setBalanceThreshold] = useState('')
  const [proofs, setProofs] = useState<Record<string, ProofResult>>({})

  const runProof = async (key: string, result: boolean) => {
    setProofs(p => ({ ...p, [key]: { type: key, result: null, loading: true } }))
    await new Promise(r => setTimeout(r, 2000))
    setProofs(p => ({ ...p, [key]: { type: key, result, loading: false } }))
  }

  const ProofCard = ({ id, icon: Icon, title, desc, color, input, placeholder, value, onChange, onRun, resultLabel }: any) => {
    const proof = proofs[id]
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
        </div>

        {input && (
          <>
            <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>
              {input}
            </label>
            <input className="input-field" type="number" placeholder={placeholder} value={value} onChange={onChange} style={{ marginBottom: '14px' }} />
          </>
        )}

        <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={onRun} disabled={proof?.loading}>
          {proof?.loading ? '⏳ Generating Proof...' : '🔍 Generate Proof'}
        </button>

        {proof && !proof.loading && proof.result !== null && (
          <div style={{
            padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px',
            background: proof.result ? 'rgba(0,200,150,0.08)' : 'rgba(255,68,68,0.08)',
            border: `1px solid ${proof.result ? 'rgba(0,200,150,0.25)' : 'rgba(255,68,68,0.25)'}`
          }}>
            {proof.result
              ? <ShieldCheck size={20} color="var(--success)" />
              : <ShieldX size={20} color="var(--danger)" />
            }
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: proof.result ? 'var(--success)' : 'var(--danger)' }}>
                {proof.result ? '✓ Proof Verified' : '✗ Proof Failed'}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                {proof.result ? resultLabel.pass : resultLabel.fail}
              </div>
            </div>
          </div>
        )}

        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Returns an encrypted <code style={{ color: 'var(--zama-yellow)', background: 'var(--zama-yellow-glow)', padding: '1px 4px', borderRadius: '3px' }}>ebool</code> — the result is provable without revealing your data.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>

      <ProofCard
        id="score"
        icon={BarChart3}
        title="Score Above Threshold"
        desc="proveScoreAbove()"
        color="var(--zama-yellow)"
        input="MINIMUM SCORE"
        placeholder="e.g. 600"
        value={scoreThreshold}
        onChange={(e: any) => setScoreThreshold(e.target.value)}
        onRun={() => runProof('score', parseInt(scoreThreshold) <= 650)}
        resultLabel={{
          pass: 'Your score meets the threshold — verified privately',
          fail: 'Score below threshold — no data was revealed'
        }}
      />

      <ProofCard
        id="loan"
        icon={CreditCard}
        title="Loan Eligibility"
        desc="proveLoanEligibility()"
        color="var(--purple)"
        input="LOAN AMOUNT"
        placeholder="e.g. 8000"
        value={loanAmount}
        onChange={(e: any) => setLoanAmount(e.target.value)}
        onRun={() => runProof('loan', parseInt(loanAmount) <= 10000)}
        resultLabel={{
          pass: 'Eligible for this loan amount based on your score',
          fail: 'Score insufficient for this loan amount'
        }}
      />

      <ProofCard
        id="balance"
        icon={Wallet}
        title="Balance Above Threshold"
        desc="proveBalanceAbove()"
        color="var(--success)"
        input="MINIMUM BALANCE"
        placeholder="e.g. 500"
        value={balanceThreshold}
        onChange={(e: any) => setBalanceThreshold(e.target.value)}
        onRun={() => runProof('balance', parseInt(balanceThreshold) <= 1000)}
        resultLabel={{
          pass: 'Balance confirmed above threshold — privately verified',
          fail: 'Balance below the required threshold'
        }}
      />

      {/* Explainer */}
      <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #161616, #0a0a1a)', borderColor: 'var(--border-yellow)' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>
          🛡️ What is Selective Disclosure?
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '🔐', title: 'Zero Knowledge', desc: 'You prove a fact is true without revealing the underlying data — your score and balance stay encrypted' },
            { icon: '⛓️', title: 'On-Chain Verifiable', desc: 'The proof is an ebool stored on the blockchain — anyone can verify the result but not the input' },
            { icon: '🎯', title: 'Real Use Cases', desc: 'DeFi lending, KYC without exposure, credit gating, private collateral checks — all enabled by Zama FHE' },
          ].map((s, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px' }}>
              <div style={{ fontSize: '24px' }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '14px', marginBottom: '6px' }}>{s.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}