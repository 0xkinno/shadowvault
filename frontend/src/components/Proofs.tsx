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

export default function Proofs({ address, contractAddress }: Props) {
  const [scoreThreshold, setScoreThreshold] = useState('')
  const [loanAmount, setLoanAmount] = useState('')
  const [balanceThreshold, setBalanceThreshold] = useState('')
  const [results, setResults] = useState<Record<string, { result: boolean | null; loading: boolean; hash: string }>>({})

  const getContract = async () => {
    const { ethereum } = window as any
    await ethereum.request({ method: 'eth_requestAccounts' })
    await ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: '0xaa36a7' }],
    })
    const provider = new ethers.providers.Web3Provider(ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(contractAddress, ABI, signer)
  }

  const runProof = async (key: string, fn: (contract: any) => Promise<any>) => {
    setResults(r => ({ ...r, [key]: { result: null, loading: true, hash: '' } }))
    try {
      const contract = await getContract()
      const tx = await fn(contract)
      await tx.wait()
      const receipt = await tx.wait()
      setResults(r => ({ ...r, [key]: { result: true, loading: false, hash: tx.hash } }))
    } catch (e: any) {
      if (e.code === 4001) {
        setResults(r => ({ ...r, [key]: { result: null, loading: false, hash: '' } }))
      } else {
        setResults(r => ({ ...r, [key]: { result: false, loading: false, hash: '' } }))
      }
    }
  }

  const ProofCard = ({ id, icon: Icon, title, desc, color, inputLabel, placeholder, value, onChange, onRun, resultLabel }: any) => {
    const proof = results[id]
    return (
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={20} color={color} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '15px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>{desc}</div>
          </div>
        </div>

        <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>{inputLabel}</label>
        <input className="input-field" type="number" placeholder={placeholder} value={value} onChange={onChange} style={{ marginBottom: '14px' }} />

        <button className="btn-primary" style={{ width: '100%', marginBottom: '12px' }} onClick={onRun} disabled={proof?.loading || !value}>
          {proof?.loading ? '⏳ Waiting for MetaMask...' : '🔍 Generate Proof On-Chain'}
        </button>

        {proof && !proof.loading && proof.result !== null && (
          <div style={{ padding: '14px', borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', background: proof.result ? 'rgba(0,200,150,0.08)' : 'rgba(255,68,68,0.08)', border: '1px solid ' + (proof.result ? 'rgba(0,200,150,0.25)' : 'rgba(255,68,68,0.25)') }}>
            {proof.result ? <ShieldCheck size={20} color="var(--success)" /> : <ShieldX size={20} color="var(--danger)" />}
            <div>
              <div style={{ fontWeight: 700, fontSize: '14px', color: proof.result ? 'var(--success)' : 'var(--danger)' }}>
                {proof.result ? '✓ Proof Verified On-Chain' : '✗ Proof Failed'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{proof.result ? resultLabel.pass : resultLabel.fail}</div>
              {proof.hash && (
                <a href={'https://sepolia.etherscan.io/tx/' + proof.hash} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--zama-yellow)', textDecoration: 'none' }}>
                  View on Etherscan ↗
                </a>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: '12px', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
          Returns <code style={{ color: 'var(--zama-yellow)', background: 'var(--zama-yellow-glow)', padding: '1px 4px', borderRadius: '3px' }}>bool</code> — provable without revealing your data.
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
          onRun={() => runProof('score', c => c.proveScoreAbove(parseInt(scoreThreshold)))}
          resultLabel={{ pass: 'Your score meets the threshold', fail: 'Score below threshold' }}
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
          onRun={() => runProof('loan', c => c.proveLoanEligibility(parseInt(loanAmount)))}
          resultLabel={{ pass: 'Eligible for this loan amount', fail: 'Score insufficient for loan' }}
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
          onRun={() => runProof('balance', c => c.proveBalanceAbove(parseInt(balanceThreshold)))}
          resultLabel={{ pass: 'Balance confirmed above threshold', fail: 'Balance below threshold' }}
        />
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, #161616, #0a0a1a)', borderColor: 'var(--border-yellow)' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>🛡️ What is Selective Disclosure?</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
          {[
            { icon: '🔐', title: 'Zero Knowledge', desc: 'Prove a fact is true without revealing the underlying data — your score and balance stay private' },
            { icon: '⛓️', title: 'On-Chain Verifiable', desc: 'The proof is stored on the blockchain — anyone can verify the result but not the input' },
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