import { Marketplace } from '../types'

interface Props {
  marketplace: Marketplace
  size?: 'sm' | 'md'
}

const config: Record<Marketplace, { label: string; icon: string; color: string; bg: string }> = {
  rakuten: {
    label: '楽天市場',
    icon: '🛍️',
    color: '#ffffff',
    bg: 'linear-gradient(135deg, #bf0000, #e00)',
  },
  yahoo: {
    label: 'Yahoo!',
    icon: '🟡',
    color: '#ffffff',
    bg: 'linear-gradient(135deg, #ff0033, #cc0022)',
  },
  amazon: {
    label: 'Amazon JP',
    icon: '🔵',
    color: '#ffffff',
    bg: 'linear-gradient(135deg, #1a73e8, #1557b0)',
  },
  aupay: {
    label: 'au PAY',
    icon: '🟠',
    color: '#ffffff',
    bg: 'linear-gradient(135deg, #f97316, #ea6c00)',
  },
}

export function MarketplaceBadge({ marketplace, size = 'md' }: Props) {
  const c = config[marketplace]
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-semibold ${
        size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1'
      }`}
      style={{ background: c.bg, color: c.color }}
    >
      {marketplace === 'yahoo' && <span style={{ fontSize: size === 'sm' ? 10 : 14 }}>🔆</span>}
      {marketplace === 'rakuten' && <span style={{ fontSize: size === 'sm' ? 10 : 14 }}>🛍️</span>}
      {marketplace === 'amazon' && <span style={{ fontSize: size === 'sm' ? 10 : 14, filter: 'brightness(2)' }}>●</span>}
      {marketplace === 'aupay' && <span style={{ fontSize: size === 'sm' ? 10 : 14 }}>●</span>}
      {c.label}
    </span>
  )
}

export function MarketplaceIcon({ marketplace }: { marketplace: Marketplace }) {
  const icons: Record<Marketplace, string> = {
    rakuten: '🛍️',
    yahoo: '🟡',
    amazon: '📦',
    aupay: '🟠',
  }
  return <span>{icons[marketplace]}</span>
}
