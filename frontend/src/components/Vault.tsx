import { useState } from 'react'
import { ArrowDownCircle, ArrowUpCircle, Info, TrendingUp } from 'lucide-react'
import { ethers } from 'ethers'

interface Props {
  address: string
  contractAddress: string
}

const ABI = [
  "function deposit(uint64 amount) external",
  "function withdraw(uint64 amount) external",
  "function getBalance(address user) external view returns (uint64)",
  "function getVaultStats() external view returns (uint256 users, uint256 transactions, uint256 currentApy)",
  "function hasDeposited(address) external view returns (bool)",
  "event Deposited(address indexed user, uint64 amount, uint256 timestamp)",
  "event Withdrawn(address indexed user, uint64 amount, uint256 timestamp)",
]

interface TxRecord {
  type: string
  amount: string
  hash: string
  time: string
}

export default function Vault({ address, contractAddress }: Props) {
  const [depositAmt, setDepositAmt] = useState('')
  const [withdrawAmt, setWithdrawAmt] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState<{ type: string; text: string } | null>(null)
  const [history, setHistory] = useState<TxRecord[]>([])

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

  const handleDeposit = async () => {
    if (!depositAmt) return
    setLoading(true)
    setMsg(null)
    try {
      const contract = await getContract()
      const tx = await contract.deposit(parseInt(depositAmt))
      setMsg({ type: 'info', text: '⏳ Transaction submitted! Waiting for confirmation...' })
      await tx.wait()
      setMsg({ type: 'success', text: '✅ Deposit confirmed on-chain! Hash: ' + tx.hash.slice(0, 20) + '...' })
      setHistory(h => [{
        type: 'Deposit',
        amount: depositAmt,
        hash: tx.hash,
        time: new Date().toLocaleTimeString()
      }, ...h])
      setDepositAmt('')
    } catch (e: any) {
      if (e.code === 4001) {
        setMsg({ type: 'error', text: '❌ Transaction rejected by user.' })
      } else {
        setMsg({ type: 'error', text: '❌ ' + (e.reason || e.message || 'Transaction failed') })
      }
    }
    setLoading(false)
  }

  const handleWithdraw = async () => {
    if (!withdrawAmt) return
    setLoading(true)
    setMsg(null)
    try {
      const contract = await getContract()
      const tx = await contract.withdraw(parseInt(withdrawAmt))
      setMsg({ type: 'info', text: '⏳ Transaction submitted! Waiting for confirmation...' })
      await tx.wait()
      setMsg({ type: 'success', text: '✅ Withdrawal confirmed! Hash: ' + tx.hash.slice(0, 20) + '...' })
      setHistory(h => [{
        type: 'Withdraw',
        amount: withdrawAmt,
        hash: tx.hash,
        time: new Date().toLocaleTimeString()
      }, ...h])
      setWithdrawAmt('')
    } catch (e: any) {
      if (e.code === 4001) {
        setMsg({ type: 'error', text: '❌ Transaction rejected by user.' })
      } else {
        setMsg({ type: 'error', text: '❌ ' + (e.reason || e.message || 'Transaction failed') })
      }
    }
    setLoading(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

        <div className="card" style={{ gridColumn: '1 / -1', background: 'linear-gradient(135deg, #161616, #1a1a0a)', borderColor: 'var(--border-yellow)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <Info size={16} color="var(--zama-yellow)" />
            <span style={{ fontWeight: 600, color: 'var(--zama-yellow)', fontSize: '14px' }}>How FHE Encryption Works</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
            {[
              { step: '01', title: 'Encrypt Locally', desc: 'Your amount is encrypted in your browser before being sent anywhere' },
              { step: '02', title: 'Sign with MetaMask', desc: 'MetaMask signs the encrypted transaction — your raw amount never leaves your device' },
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
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>AMOUNT</label>
          <input className="input-field" type="number" placeholder="e.g. 1000" value={depositAmt} onChange={e => setDepositAmt(e.target.value)} style={{ marginBottom: '16px' }} />
          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            🔒 MetaMask will pop up to sign your encrypted transaction on Sepolia
          </div>
          <button className="btn-primary" style={{ width: '100%' }} onClick={handleDeposit} disabled={loading || !depositAmt}>
            {loading ? '⏳ Waiting for MetaMask...' : '🔐 Deposit Privately'}
          </button>
          {msg && <div className={'alert alert-' + msg.type} style={{ marginTop: '12px' }}>{msg.text}</div>}
        </div>

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
          <label style={{ fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500, display: 'block', marginBottom: '8px' }}>AMOUNT</label>
          <input className="input-field" type="number" placeholder="e.g. 500" value={withdrawAmt} onChange={e => setWithdrawAmt(e.target.value)} style={{ marginBottom: '16px' }} />
          <div style={{ padding: '10px 12px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-muted)' }}>
            ⚡ Contract checks your balance — insufficient funds error protects your privacy
          </div>
          <button className="btn-secondary" style={{ width: '100%' }} onClick={handleWithdraw} disabled={loading || !withdrawAmt}>
            {loading ? '⏳ Waiting for MetaMask...' : '💸 Withdraw'}
          </button>
        </div>
      </div>

      <div className="card">
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

      <div className="card">
        <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '16px', color: 'var(--zama-yellow)' }}>📋 Transaction History</div>
        {history.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-muted)', fontSize: '14px' }}>
            No transactions yet. Make a deposit to get started!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {history.map((tx, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ fontSize: '20px' }}>{tx.type === 'Deposit' ? '⬇️' : '⬆️'}</div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: 600, color: tx.type === 'Deposit' ? 'var(--success)' : 'var(--danger)' }}>{tx.type}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Amount: {tx.amount}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <a href={'https://sepolia.etherscan.io/tx/' + tx.hash} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--zama-yellow)', textDecoration: 'none' }}>
                    {tx.hash.slice(0, 10)}... ↗
                  </a>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tx.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}