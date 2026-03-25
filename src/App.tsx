import { useState, useMemo, useEffect, useCallback } from 'react'
import {
  Search, Star, Settings, X, RefreshCw, ChevronDown, TrendingUp,
  AlertCircle, Zap,
} from 'lucide-react'
import { Product, Marketplace, SortKey, Tab } from './types'
import { ProductCard } from './components/ProductCard'
import { searchProducts, getSavedProducts, saveProduct, deleteProduct } from './api/client'

const MARKETPLACES: { key: Marketplace; label: string; color: string }[] = [
  { key: 'rakuten', label: '楽天市場', color: '#ff4757' },
  { key: 'yahoo',   label: 'Yahoo!',  color: '#f97316' },
]

export default function App() {
  const [tab, setTab] = useState<Tab>('search')
  const [query, setQuery] = useState('')
  const [amazonPrice, setAmazonPrice] = useState('')
  const [feeRate, setFeeRate] = useState(() => parseFloat(localStorage.getItem('feeRate') ?? '0.15'))
  const [selectedMP, setSelectedMP] = useState<Marketplace[]>(['rakuten', 'yahoo'])
  const [sortKey, setSortKey] = useState<SortKey>('profit')
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple')
  const [minProfit, setMinProfit] = useState('')
  const [minRate, setMinRate] = useState('')

  const [results, setResults] = useState<Product[]>([])
  const [saved, setSaved] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [backendOk, setBackendOk] = useState<boolean | null>(null)

  // Check backend health on mount
  useEffect(() => {
    fetch('/api/health')
      .then(r => r.ok ? setBackendOk(true) : setBackendOk(false))
      .catch(() => setBackendOk(false))
  }, [])

  // Load saved products
  const loadSaved = useCallback(async () => {
    try {
      const data = await getSavedProducts()
      setSaved(data)
    } catch {
      // backend might not be running yet
    }
  }, [])
  useEffect(() => { loadSaved() }, [loadSaved])

  const handleSearch = async () => {
    if (!query.trim()) { setError('商品名を入力してください'); return }
    const ap = parseInt(amazonPrice)
    if (!ap || ap <= 0) { setError('Amazon販売価格を入力してください'); return }

    setLoading(true)
    setError('')
    try {
      const data = await searchProducts({
        query: query.trim(),
        amazonPrice: ap,
        marketplaces: selectedMP,
        feeRate,
      })
      setResults(data)
      setHasSearched(true)
      setTab('search')
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '検索に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  const handleToggleSave = async (product: Product) => {
    if (saved.some(s => s.id === product.id)) {
      await deleteProduct(product.id)
      setSaved(prev => prev.filter(s => s.id !== product.id))
      setResults(prev => prev.map(p => p.id === product.id ? { ...p, saved: false } : p))
    } else {
      await saveProduct({ ...product, saved: true })
      setSaved(prev => [{ ...product, saved: true }, ...prev])
      setResults(prev => prev.map(p => p.id === product.id ? { ...p, saved: true } : p))
    }
  }

  const filtered = useMemo(() => {
    const source = tab === 'saved' ? saved : results
    const minP = parseInt(minProfit) || 0
    const minR = parseInt(minRate) || 0
    const filtered = source.filter(p =>
      p.profit >= minP && p.profitRate >= minR &&
      (selectedMP.length === 0 || selectedMP.includes(p.marketplace))
    )
    return [...filtered].sort((a, b) => {
      if (sortKey === 'profit') return b.profit - a.profit
      if (sortKey === 'profitRate') return b.profitRate - a.profitRate
      return new Date(b.savedAt).getTime() - new Date(a.savedAt).getTime()
    })
  }, [tab, results, saved, minProfit, minRate, selectedMP, sortKey])

  const totalProfit = filtered.reduce((s, p) => s + p.profit, 0)
  const highCount = filtered.filter(p => p.profitLevel === 'high').length

  const saveFeeRate = (v: number) => {
    setFeeRate(v)
    localStorage.setItem('feeRate', String(v))
  }

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', maxWidth: 500, margin: '0 auto' }}>

      {/* ── HEADER ── */}
      <div
        style={{
          position: 'sticky', top: 0, zIndex: 20,
          background: 'rgba(6,12,26,0.92)', backdropFilter: 'blur(16px)',
          borderBottom: '1px solid rgba(56,189,248,0.1)',
          padding: '16px 16px 12px',
        }}
      >
        {/* Title row */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              width: 32, height: 32, borderRadius: 10,
              background: 'linear-gradient(135deg, #0ea5e9, #818cf8)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(56,189,248,0.3)',
            }}>
              <Zap size={16} color="#fff" fill="#fff" />
            </div>
            <span style={{ fontSize: 17, fontWeight: 800, letterSpacing: -0.3 }} className="gradient-text">
              利益商品リサーチ
            </span>
          </div>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['simple','detailed'] as const).map(m => (
              <button
                key={m}
                onClick={() => setViewMode(m)}
                className={viewMode === m ? 'tab-active' : 'tab-inactive'}
                style={{ padding: '5px 12px', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}
              >
                {m === 'simple' ? '簡単' : '詳細'}
              </button>
            ))}
            <button
              onClick={() => setShowSettings(true)}
              className="btn-ghost"
              style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Settings size={15} />
            </button>
          </div>
        </div>

        {/* Search form */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          <div style={{ flex: 1, position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)', pointerEvents: 'none' }} />
            <input
              className="input-field"
              style={{ width: '100%', padding: '10px 10px 10px 32px', fontSize: 13 }}
              placeholder="商品名 / JANコード"
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, color: 'var(--text-3)' }}>¥</span>
            <input
              className="input-field"
              style={{ width: 110, padding: '10px 10px 10px 22px', fontSize: 13 }}
              placeholder="Amazon価格"
              type="number"
              value={amazonPrice}
              onChange={e => setAmazonPrice(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: '10px 16px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {loading ? <RefreshCw size={14} className="spin" /> : <Search size={14} />}
            {loading ? '検索中' : '検索'}
          </button>
        </div>

        {/* Marketplace toggles */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {MARKETPLACES.map(mp => {
            const active = selectedMP.includes(mp.key)
            return (
              <button
                key={mp.key}
                onClick={() => setSelectedMP(prev =>
                  prev.includes(mp.key) ? prev.filter(m => m !== mp.key) : [...prev, mp.key]
                )}
                style={{
                  padding: '6px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700,
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: active ? `${mp.color}22` : 'rgba(56,189,248,0.04)',
                  border: `1px solid ${active ? mp.color + '66' : 'rgba(56,189,248,0.1)'}`,
                  color: active ? mp.color : 'var(--text-3)',
                  boxShadow: active ? `0 0 12px ${mp.color}22` : 'none',
                }}
              >
                {mp.label}
              </button>
            )
          })}
        </div>

        {/* Filter + Sort row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>利益</span>
            <input
              className="input-field"
              style={{ width: 72, padding: '5px 8px', fontSize: 12, textAlign: 'center' }}
              placeholder="1000"
              value={minProfit}
              onChange={e => setMinProfit(e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>円〜</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>利益率</span>
            <input
              className="input-field"
              style={{ width: 56, padding: '5px 8px', fontSize: 12, textAlign: 'center' }}
              placeholder="10"
              value={minRate}
              onChange={e => setMinRate(e.target.value)}
            />
            <span style={{ fontSize: 11, color: 'var(--text-3)' }}>%〜</span>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 4, alignItems: 'center' }}>
            {([
              { key: 'newest', label: '新着' },
              { key: 'profit', label: '利益額' },
              { key: 'profitRate', label: '利益率' },
            ] as { key: SortKey; label: string }[]).map(s => (
              <button
                key={s.key}
                onClick={() => setSortKey(s.key)}
                className={sortKey === s.key ? 'tab-active' : 'tab-inactive'}
                style={{ padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
              >
                {s.label}
              </button>
            ))}
            <span
              style={{
                padding: '4px 10px', borderRadius: 8, fontSize: 11, fontWeight: 700,
                background: 'rgba(52,211,153,0.12)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)',
              }}
            >
              {filtered.length}件
            </span>
          </div>
        </div>
      </div>

      {/* ── TAB BAR ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid rgba(56,189,248,0.1)', background: 'rgba(6,12,26,0.7)' }}>
        {([
          { key: 'search', label: '検索結果', count: results.length },
          { key: 'saved', label: '保存済み', count: saved.length },
        ] as { key: Tab; label: string; count: number }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              flex: 1, padding: '11px 0', fontSize: 13, fontWeight: 600,
              cursor: 'pointer', border: 'none',
              background: 'transparent',
              color: tab === t.key ? 'var(--primary)' : 'var(--text-3)',
              borderBottom: tab === t.key ? '2px solid var(--primary)' : '2px solid transparent',
              transition: 'color 0.2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            {t.key === 'saved' && <Star size={13} fill={tab === t.key ? 'var(--primary)' : 'none'} />}
            {t.label}
            {t.count > 0 && (
              <span style={{
                background: tab === t.key ? 'rgba(56,189,248,0.15)' : 'rgba(71,85,105,0.3)',
                color: tab === t.key ? 'var(--primary)' : 'var(--text-3)',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── CONTENT ── */}
      <div style={{ padding: '14px 14px 96px' }}>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 14px', borderRadius: 10, marginBottom: 12,
            background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', color: '#f87171',
            fontSize: 13,
          }}>
            <AlertCircle size={15} />
            <span>{error}</span>
            <button onClick={() => setError('')} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#f87171', cursor: 'pointer' }}>
              <X size={14} />
            </button>
          </div>
        )}

        {/* Backend warning */}
        {backendOk === false && (
          <div style={{
            padding: '10px 14px', borderRadius: 10, marginBottom: 12,
            background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.2)', color: '#fbbf24',
            fontSize: 12,
          }}>
            ⚠️ バックエンドが起動していません。<code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 6px', borderRadius: 4 }}>cd backend && npm start</code> で起動してください。
          </div>
        )}

        {/* Empty state */}
        {tab === 'search' && !hasSearched && !loading && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
              background: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(129,140,248,0.15))',
              border: '1px solid rgba(56,189,248,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Search size={28} style={{ color: 'var(--primary)' }} />
            </div>
            <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>商品を検索してください</p>
            <p style={{ color: 'var(--text-3)', fontSize: 12 }}>商品名とAmazon販売価格を入力して検索</p>
          </div>
        )}

        {tab === 'saved' && saved.length === 0 && (
          <div style={{ textAlign: 'center', padding: '48px 24px' }}>
            <div style={{
              width: 64, height: 64, borderRadius: 20, margin: '0 auto 16px',
              background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Star size={28} style={{ color: '#fbbf24' }} />
            </div>
            <p style={{ color: '#e2e8f0', fontWeight: 700, fontSize: 15, marginBottom: 6 }}>保存済み商品はありません</p>
            <p style={{ color: 'var(--text-3)', fontSize: 12 }}>気になる商品の「保存」ボタンを押してください</p>
          </div>
        )}

        {filtered.length === 0 && (hasSearched || tab === 'saved') && saved.length > 0 || (filtered.length === 0 && hasSearched && tab === 'search') ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: 'var(--text-3)', fontSize: 13 }}>
            <ChevronDown size={20} style={{ margin: '0 auto 8px' }} />
            <p>条件に一致する商品がありません</p>
          </div>
        ) : null}

        {filtered.map(p => (
          <ProductCard
            key={p.id}
            product={p}
            detailed={viewMode === 'detailed'}
            onToggleSave={handleToggleSave}
          />
        ))}
      </div>

      {/* ── BOTTOM BAR ── */}
      <div style={{
        position: 'fixed', bottom: 0, left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 500,
        padding: '12px 16px',
        background: 'rgba(6,12,26,0.95)', backdropFilter: 'blur(16px)',
        borderTop: '1px solid rgba(56,189,248,0.1)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }}>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10, marginBottom: 1 }}>利益合計</div>
            <div style={{ fontWeight: 800, fontSize: 15 }} className="profit-text">
              ¥{totalProfit.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10, marginBottom: 1 }}>高利益</div>
            <div style={{ fontWeight: 700, color: '#34d399', fontSize: 15 }}>{highCount}件</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-3)', fontSize: 10, marginBottom: 1 }}>表示中</div>
            <div style={{ fontWeight: 700, color: '#e2e8f0', fontSize: 15 }}>{filtered.length}件</div>
          </div>
        </div>
        {tab === 'search' && hasSearched && (
          <button
            className="btn-primary"
            onClick={handleSearch}
            disabled={loading}
            style={{ padding: '8px 16px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
          >
            {loading ? <RefreshCw size={13} className="spin" /> : <TrendingUp size={13} />}
            {loading ? '検索中' : '再検索'}
          </button>
        )}
      </div>

      {/* ── SETTINGS MODAL ── */}
      {showSettings && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'flex-end',
            background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
          }}
          onClick={e => e.target === e.currentTarget && setShowSettings(false)}
        >
          <div style={{
            width: '100%', maxWidth: 500, margin: '0 auto',
            background: '#0c1829', borderRadius: '20px 20px 0 0',
            border: '1px solid rgba(56,189,248,0.15)',
            padding: '20px 20px 32px',
            boxShadow: '0 -20px 60px rgba(0,0,0,0.5)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <span style={{ fontWeight: 700, fontSize: 16, color: '#e2e8f0' }}>設定</span>
              <button onClick={() => setShowSettings(false)} className="btn-ghost" style={{ width: 30, height: 30, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <X size={15} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 12, color: 'var(--text-2)', display: 'block', marginBottom: 6 }}>
                  Amazon手数料率（FBA含む）
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    className="input-field"
                    type="number"
                    step="0.01"
                    min="0.05"
                    max="0.5"
                    style={{ width: 90, padding: '8px 12px', fontSize: 14 }}
                    value={Math.round(feeRate * 100)}
                    onChange={e => saveFeeRate(parseInt(e.target.value) / 100)}
                  />
                  <span style={{ color: 'var(--text-2)', fontSize: 14 }}>%</span>
                  <span style={{ fontSize: 11, color: 'var(--text-3)' }}>（デフォルト: 15%）</span>
                </div>
              </div>

              <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(56,189,248,0.05)', border: '1px solid rgba(56,189,248,0.1)', fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
                <p style={{ fontWeight: 600, color: 'var(--primary)', marginBottom: 6 }}>APIキーの設定方法</p>
                <p>① 楽天: <a href="https://webservice.rakuten.co.jp/" target="_blank" rel="noreferrer" style={{ color: '#ff4757' }}>webservice.rakuten.co.jp</a> でアプリ作成</p>
                <p>② Yahoo!: <a href="https://developer.yahoo.co.jp/" target="_blank" rel="noreferrer" style={{ color: '#f97316' }}>developer.yahoo.co.jp</a> でアプリ登録</p>
                <p style={{ marginTop: 6 }}>取得したキーを <code style={{ background: 'rgba(0,0,0,0.3)', padding: '1px 5px', borderRadius: 3 }}>backend/.env</code> に設定してください</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
