import { useState } from 'react'
import { ShieldCheck, ShieldX, Wallet, CreditCard, BarChart3 } from 'lucide-react'
import { ethers } from 'ethers'

interface Props {
  address: string
  contractAddress: string
}

const ABI = [
  "function proveScoreAbove(uint64 threshold) external returns (bool)",
  "function proveLoanEligibility(uint64 loanAmount) external returns (bool)",
  "function proveBalanceAbove(uint64 threshold) external returns (bool)",
]

interface ProofResult {
  result: boolean
  hash: string
  loading: boolean
}

export default function Proofs({ address, contractAddress }: Props) {
  const [scoreThreshold, setScoreThreshold] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [balanceThreshold, setBalanceThreshold] = useState('')
  const [proofs, setProofs] = useState<Record<string, ProofResult>>({})
  const [msgs, setMsgs] = useState<Record<string, { type: string; text: string }>>({})

  const getContract = async () => {
    const { ethereum } = window as any
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(contractAddress, ABI, signer)
  }

  const runProof = async (id: string, method: string, arg: string) => {
    if (!arg) return
    setProofs(p => ({ ...p, [id]: { result: false, hash: '', loading: true } }))
    setMsgs(m => ({ ...m, [id]: { type: 'info', text: '⏳ MetaMask opening — please sign...' } }))
    try {
      const contract = await getContract()
      const tx = await contract[method](parseInt(arg))
      setMsgs(m => ({ ...m, [id]: { type: 'info', text: '⏳ Waiting for confirmation...' } }))
      const receipt = await tx.wait()
      setProofs(p => ({ ...p, [id]: { result: true, hash: tx.hash, loading: false } }))
      setMsgs(m => ({ ...m, [id]: { type: 'success', text: '✅ Proof generated on-chain!' } }))
    } catch (e: any) {
      setProofs(p => ({ ...p, [id]: { result: false, hash: '', loading: false } }))
      if (e.code === 4001) {
        setMsgs(m => ({ ...m, [id]: { type: 'error', text: '❌ Rejected by user.' } }))
      } else {
        setMsgs(m => ({ ...m, [id]: { type: 'error', text: '❌ Failed: ' + (e.reason || e.message || 'Unknown') } }))
      }
    }
  }

  const ProofCard = ({ id, icon: Icon, title, desc, color, inputLabel, placeholder, value, onChange, method }: any) => {
    const proof = proofs[id]
    const msg = msgs[id]
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{desc}</div>
          </div>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>{inputLabel}</label>
        <input className="input-field" type="number" placeholder={placeholder} value={value} onChange={onChange} style={{ marginBottom: '14px' }} />

        <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={() => runProof(id, method, value)} disabled={proof?.loading || !value}>
          {proof?.loading ? '⏳ Waiting for MetaMask...' : '🔍 Generate Proof On-Chain'}
        </button>

        {msg && <div className={'alert alert-' + msg.type} style={{ marginBottom: '10px' }}>{msg.text}</div>}

        {proof && !proof.loading && proof.hash && (
          <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(0,200,150,0.08)', border: '1px solid rgba(0,200,150,0.25)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <ShieldCheck size={18} color="var(--success)" />
              <span style={{ fontWeight: 700, fontSize: '14px', color: 'var(--success)' }}>✓ Proof Generated On-Chain</span>
            </div>
            <a href={'https://sepolia.etherscan.io/tx/' + proof.hash} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--zama-yellow)', textDecoration: 'none' }}>
              View on Etherscan ↗
            </a>
          </div>
        )}

        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Returns encrypted <code style={{ color: 'var(--zama-yellow)', background: 'var(--zama-yellow-glow)', padding: '1px 4px', borderRadius: '3px' }}>ebool</code> — provable without revealing your data.
        </div>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
        <ProofCard
          id="score"
          icon={BarChart3}
          title="Score Above Threshold"
          desc="proveScoreAbove()"
          color="var(--zama-yellow)"
          inputLabel="MINIMUM SCORE"
          placeholder="e.g. 600"
          value={scoreThreshold}
          onChange={(e: any) => setScoreThreshold(e.target.value)}
          method="proveScoreAbove"
        />
        <ProofCard
          id="loan"
          icon={CreditCard}
          title="Loan Eligibility"
          desc="proveLoanEligibility()"
          color="#8B5CF6"
          inputLabel="LOAN AMOUNT"
          placeholder="e.g. 8000"
          value={loanAmount}
          onChange={(e: any) => setLoanAmount(e.target.value)}
          method="proveLoanEligibility"
        />
        <ProofCard
          id="balance"
          icon={Wallet}
          title="Balance Above Threshold"
          desc="proveBalanceAbove()"
          color="var(--success)"
          inputLabel="MINIMUM BALANCE"
          placeholder="e.g. 500"
          value={balanceThreshold}
          onChange={(e: any) => setBalanceThreshold(e.target.value)}
          method="proveBalanceAbove"
        />
      </div>

      {/* Explainer */}
      <div className="card" style={{ background: 'linear-gradient(135deg, #161616, #0a0a1a)', borderColor: 'var(--border-yellow)' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>🛡️ What is Selective Disclosure?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '🔐', title: 'Zero Knowledge', desc: 'Prove a fact is true without revealing underlying data — score and balance stay encrypted' },
            { icon: '⛓️', title: 'On-Chain Verifiable', desc: 'The proof is an ebool stored on Sepolia — anyone can verify the result but not the input' },
            { icon: '🎯', title: 'Real Use Cases', desc: 'DeFi lending, KYC, credit gating, private collateral checks — all enabled by Zama FHE' },
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