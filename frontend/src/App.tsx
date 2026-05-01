import { useState } from 'react'
import { Shield, Star, FileCheck, Activity, ChevronRight, Lock, Zap, LayoutDashboard } from 'lucide-react'
import Vault from './components/Vault'
import Score from './components/Score'
import Proofs from './components/Proofs'

const CONTRACT = '0xa31AAF62dCD1362D457BD02d3907Bf9958Ae027E'

export default function App() {
  const [tab, setTab] = useState('vault')
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState('')

  const connect = async () => {
    const { ethereum } = window as any
    if (!ethereum) { alert('Install MetaMask!'); return }
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' })
    setAddress(accounts[0])
    setConnected(true)
  }

  const short = (a: string) => a.slice(0, 6) + '...' + a.slice(-4)

  const titles: Record<string, string> = {
    vault: '🔐 Private Vault',
    score: '⭐ Shadow Score',
    proofs: '📋 Selective Proofs',
  }

  const subtitles: Record<string, string> = {
    vault: 'Your balance is fully encrypted on-chain using FHE',
    score: 'Privacy-preserving credit score computed in FHE',
    proofs: 'Prove facts about your data without revealing it',
  }

  const nav = [
    { id: 'vault', label: 'Private Vault', Icon: LayoutDashboard, desc: 'Deposit & Withdraw' },
    { id: 'score', label: 'Shadow Score', Icon: Star, desc: 'Credit Score' },
    { id: 'proofs', label: 'Proofs', Icon: FileCheck, desc: 'Selective Disclosure' },
  ]

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--bg-primary)' }}>

      <aside style={{ width: '260px', minHeight: '100vh', background: 'var(--bg-secondary)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100 }}>

        <div style={{ padding: '28px 24px 20px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--zama-yellow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Shield size={20} color="#000" strokeWidth={2.5} />
            </div>
            <div style={{ fontFamily: 'Space Grotesk', fontWeight: 700, fontSize: '18px', color: '#fff' }}>
              Shadow<span style={{ color: 'var(--zama-yellow)' }}>Vault</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <span className="tag">FHE Powered</span>
            <span className="tag">Sepolia</span>
          </div>
        </div>

        <nav style={{ padding: '16px 12px', flex: 1 }}>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', padding: '0 12px', marginBottom: '8px' }}>FEATURES</div>
          {nav.map(({ id, label, Icon, desc }) => {
            const active = tab === id
            return (
              <button key={id} onClick={() => setTab(id)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', borderRadius: '10px', border: 'none', background: active ? 'var(--zama-yellow-glow)' : 'transparent', cursor: 'pointer', marginBottom: '4px', borderLeft: active ? '2px solid var(--zama-yellow)' : '2px solid transparent', transition: 'all 0.2s' }}>
                <Icon size={18} color={active ? 'var(--zama-yellow)' : 'var(--text-secondary)'} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '14px', fontWeight: 600, color: active ? 'var(--zama-yellow)' : 'var(--text-primary)' }}>{label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{desc}</div>
                </div>
                {active && <ChevronRight size={14} color="var(--zama-yellow)" style={{ marginLeft: 'auto' }} />}
              </button>
            )
          })}

          <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.8px', padding: '0 12px', margin: '16px 0 8px' }}>CONTRACT</div>
          <div style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: '10px', border: '1px solid var(--border)' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>Address</div>
            <div style={{ fontSize: '11px', color: 'var(--zama-yellow)', fontFamily: 'monospace', wordBreak: 'break-all' }}>{CONTRACT.slice(0, 20)}...</div>
            <a href={'https://sepolia.etherscan.io/address/' + CONTRACT} target="_blank" rel="noreferrer" style={{ fontSize: '11px', color: 'var(--text-secondary)', textDecoration: 'none', marginTop: '6px', display: 'block' }}>View on Etherscan</a>
          </div>
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Live on Sepolia</span>
          </div>
          {connected ? (
            <div style={{ padding: '10px 12px', background: 'var(--zama-yellow-glow)', borderRadius: '10px', border: '1px solid var(--border-yellow)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' }}>Connected</div>
              <div style={{ fontSize: '13px', color: 'var(--zama-yellow)', fontFamily: 'monospace', fontWeight: 600 }}>{short(address)}</div>
            </div>
          ) : (
            <button className="btn-primary" style={{ width: '100%' }} onClick={connect}>Connect Wallet</button>
          )}
        </div>
      </aside>

      <main style={{ marginLeft: '260px', flex: 1, padding: '32px', minHeight: '100vh' }}>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '32px' }}>
          <div>
            <h1 style={{ fontSize: '26px', fontWeight: 700, color: '#fff', marginBottom: '4px' }}>{titles[tab]}</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{subtitles[tab]}</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="badge badge-yellow"><Lock size={11} /> FHE Encrypted</div>
            <div className="badge badge-green"><Zap size={11} /> Zama Protocol</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '32px' }}>
          {[
            { label: 'Encryption', value: 'FHE', sub: 'Fully Homomorphic' },
            { label: 'Network', value: 'Sepolia', sub: 'Ethereum Testnet' },
            { label: 'Privacy', value: '100%', sub: 'Zero Knowledge' },
          ].map((s, i) => (
            <div key={i} className="stat-card">
              <div className="label">{s.label}</div>
              <div className="value">{s.value}</div>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{s.sub}</div>
            </div>
          ))}
        </div>

        {!connected ? (
          <div className="card" style={{ textAlign: 'center', padding: '80px 40px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔐</div>
            <h2 style={{ fontSize: '22px', fontWeight: 700, marginBottom: '8px' }}>Connect Your Wallet</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '24px', maxWidth: '400px', margin: '0 auto 24px' }}>Connect MetaMask to access your private encrypted vault powered by Zama FHE</p>
            <button className="btn-primary" onClick={connect} style={{ padding: '14px 32px', fontSize: '15px' }}>Connect MetaMask</button>
          </div>
        ) : (
          <div>
            {tab === 'vault' && <Vault address={address} contractAddress={CONTRACT} />}
            {tab === 'score' && <Score address={address} contractAddress={CONTRACT} />}
            {tab === 'proofs' && <Proofs address={address} contractAddress={CONTRACT} />}
          </div>
        )}

        <div style={{ marginTop: '48px', paddingTop: '24px', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={14} color="var(--text-muted)" />
            <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Built with Zama FHEVM • Sepolia Testnet</span>
          </div>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>ShadowVault © 2025</span>
        </div>
      </main>
    </div>
  )
}