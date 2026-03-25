import { useState } from 'react'
import { Star, ShoppingCart, Package, Smartphone, ExternalLink, TrendingUp } from 'lucide-react'
import { Product } from '../types'

interface Props {
  product: Product
  detailed: boolean
  onToggleSave: (product: Product) => void
}

const MP_CONFIG: Record<string, { label: string; color: string; glow: string }> = {
  rakuten: { label: '楽天', color: '#ff4757', glow: 'rgba(255,71,87,0.3)' },
  yahoo:   { label: 'Yahoo!', color: '#f97316', glow: 'rgba(249,115,22,0.3)' },
  amazon:  { label: 'Amazon', color: '#38bdf8', glow: 'rgba(56,189,248,0.3)' },
  aupay:   { label: 'au PAY', color: '#fbbf24', glow: 'rgba(251,191,36,0.3)' },
}

const PROFIT_CONFIG: Record<string, { label: string; bg: string; color: string }> = {
  high:   { label: '高利益', bg: 'rgba(249,115,22,0.15)', color: '#f97316' },
  medium: { label: '中利益', bg: 'rgba(251,191,36,0.15)', color: '#fbbf24' },
  low:    { label: '低利益', bg: 'rgba(100,116,139,0.15)', color: '#94a3b8' },
}

export function ProductCard({ product, detailed, onToggleSave }: Props) {
  const [hovered, setHovered] = useState(false)
  const mp = MP_CONFIG[product.marketplace ?? product.sourceMarketplace ?? 'amazon'] ?? MP_CONFIG.amazon
  const pl = PROFIT_CONFIG[product.profitLevel] ?? PROFIT_CONFIG.low

  const openLink = (type: 'source' | 'amazon' | 'mercari') => {
    const q = encodeURIComponent(product.name)
    const urls: Record<string, string> = {
      source: product.purchaseUrl || `https://search.rakuten.co.jp/search/mall/${q}`,
      amazon: `https://www.amazon.co.jp/s?k=${q}`,
      mercari: `https://jp.mercari.com/search?keyword=${q}`,
    }
    window.open(urls[type], '_blank')
  }

  return (
    <div
      className="glass-card fade-in mb-3 overflow-hidden"
      style={{
        borderColor: hovered ? 'rgba(56,189,248,0.3)' : 'rgba(56,189,248,0.1)',
        boxShadow: hovered ? '0 8px 32px rgba(0,0,0,0.5), 0 0 20px rgba(56,189,248,0.06)' : '0 4px 20px rgba(0,0,0,0.4)',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top accent line based on profit level */}
      <div
        style={{
          height: 2,
          background: product.profitLevel === 'high'
            ? 'linear-gradient(90deg, #f97316, #fbbf24)'
            : product.profitLevel === 'medium'
            ? 'linear-gradient(90deg, #fbbf24, #38bdf8)'
            : 'linear-gradient(90deg, #475569, #64748b)',
        }}
      />

      <div className="p-4">
        {/* Header row */}
        <div className="flex gap-3 mb-3">
          {/* Thumbnail */}
          <div
            className="flex-shrink-0 rounded-xl flex items-center justify-center text-2xl"
            style={{ width: 64, height: 64, background: 'rgba(56,189,248,0.06)', border: '1px solid rgba(56,189,248,0.1)' }}
          >
            {product.imageUrl
              ? <img src={product.imageUrl} alt="" className="w-full h-full object-cover rounded-xl" />
              : '📦'}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold leading-snug mb-2" style={{ color: '#e2e8f0', lineHeight: 1.4 }}>
              {product.name}
            </p>
            <div className="flex flex-wrap gap-1">
              {product.isNew && (
                <span className="badge" style={{ background: 'rgba(56,189,248,0.15)', color: '#38bdf8', border: '1px solid rgba(56,189,248,0.3)' }}>
                  NEW
                </span>
              )}
              <span className="badge" style={{ background: pl.bg, color: pl.color }}>
                {pl.label}
              </span>
              <span
                className="badge"
                style={{ background: `rgba(${mp.color.replace('#','').match(/.{2}/g)?.map((h: string)=>parseInt(h,16)).join(',')},0.15)`, color: mp.color, border: `1px solid ${mp.glow}` }}
              >
                {mp.label}
              </span>
              {product.shopName && (
                <span className="badge" style={{ background: 'rgba(71,85,105,0.3)', color: '#94a3b8' }}>
                  {product.shopName.length > 10 ? product.shopName.slice(0,10)+'…' : product.shopName}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Price row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 text-sm">
            <span style={{ color: '#64748b' }}>仕入</span>
            <span className="font-semibold" style={{ color: '#e2e8f0' }}>¥{product.purchasePrice.toLocaleString()}</span>
            <span style={{ color: '#334155' }}>→</span>
            <span className="font-semibold" style={{ color: '#38bdf8' }}>Amazon ¥{product.amazonPrice.toLocaleString()}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block w-1.5 h-1.5 rounded-full"
              style={{ background: product.inStock ? '#34d399' : '#f87171', boxShadow: `0 0 6px ${product.inStock ? '#34d399' : '#f87171'}` }}
            />
            <span className="text-xs" style={{ color: product.inStock ? '#34d399' : '#f87171' }}>
              {product.inStock ? '在庫あり' : '在庫なし'}
            </span>
          </div>
        </div>

        {/* Profit row */}
        <div className="flex items-end justify-between mb-3">
          <div>
            <span className="text-3xl font-black profit-text">
              +¥{product.profit.toLocaleString()}
            </span>
          </div>
          <div
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl"
            style={{
              background: product.profitRate >= 15
                ? 'linear-gradient(135deg, rgba(249,115,22,0.2), rgba(251,191,36,0.1))'
                : 'rgba(251,191,36,0.1)',
              border: `1px solid ${product.profitRate >= 15 ? 'rgba(249,115,22,0.4)' : 'rgba(251,191,36,0.2)'}`,
            }}
          >
            <TrendingUp size={13} style={{ color: '#fbbf24' }} />
            <span className="text-sm font-bold" style={{ color: '#fbbf24' }}>
              {product.profitRate}%
            </span>
          </div>
        </div>

        {/* Match / Confidence */}
        <div className="flex items-center gap-2 mb-3">
          <span className="badge" style={{ background: 'rgba(129,140,248,0.12)', color: '#818cf8' }}>
            照合 {product.matchScore}点
          </span>
          <span
            className="badge"
            style={{
              background: product.marketConfidence >= 85 ? 'rgba(52,211,153,0.1)' : 'rgba(251,191,36,0.1)',
              color: product.marketConfidence >= 85 ? '#34d399' : '#fbbf24',
            }}
          >
            {product.marketConfidence >= 85 ? '相場高信頼' : '相場普通'}
          </span>
          <div className="flex-1 rounded-full overflow-hidden" style={{ background: 'rgba(56,189,248,0.08)', height: 5 }}>
            <div className="progress-bar" style={{ width: `${product.marketConfidence}%` }} />
          </div>
        </div>

        {/* Detailed breakdown */}
        {detailed && (
          <div
            className="rounded-xl p-3 mb-3 text-xs grid grid-cols-2 gap-y-1.5"
            style={{ background: 'rgba(6,12,26,0.6)', border: '1px solid rgba(56,189,248,0.07)' }}
          >
            {[
              ['仕入れ価格', `¥${product.purchasePrice.toLocaleString()}`, '#e2e8f0'],
              ['Amazon価格', `¥${product.amazonPrice.toLocaleString()}`, '#38bdf8'],
              ['Amazon手数料', `¥${product.fees.toLocaleString()}`, '#f87171'],
              ['純利益', `¥${product.profit.toLocaleString()}`, '#fbbf24'],
            ].map(([label, val, color]) => (
              <div key={label as string}>
                <span style={{ color: '#64748b' }}>{label}: </span>
                <span style={{ color: color as string, fontWeight: 600 }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: '仕入れ先', icon: <ShoppingCart size={16} />, action: () => openLink('source'), color: '#94a3b8' },
            { label: 'Amazon', icon: <Package size={16} />, action: () => openLink('amazon'), color: '#f97316' },
            { label: 'メルカリ', icon: <Smartphone size={16} />, action: () => openLink('mercari'), color: '#38bdf8' },
            {
              label: product.saved ? '保存済' : '保存',
              icon: <Star size={16} fill={product.saved ? '#fbbf24' : 'none'} />,
              action: () => onToggleSave(product),
              color: product.saved ? '#fbbf24' : '#94a3b8',
            },
          ].map(btn => (
            <button
              key={btn.label}
              onClick={btn.action}
              className="flex flex-col items-center gap-1 py-2.5 rounded-xl text-xs font-medium transition-all"
              style={{
                background: 'rgba(14,30,58,0.6)',
                border: '1px solid rgba(56,189,248,0.1)',
                color: btn.color,
              }}
              onMouseEnter={e => {
                e.currentTarget.style.background = 'rgba(56,189,248,0.1)'
                e.currentTarget.style.borderColor = 'rgba(56,189,248,0.3)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.background = 'rgba(14,30,58,0.6)'
                e.currentTarget.style.borderColor = 'rgba(56,189,248,0.1)'
              }}
            >
              {btn.icon}
              <span>{btn.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
