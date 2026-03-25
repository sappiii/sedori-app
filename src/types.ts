export type Marketplace = 'rakuten' | 'yahoo' | 'amazon' | 'aupay'
export type ProfitLevel = 'high' | 'medium' | 'low'
export type SortKey = 'newest' | 'profit' | 'profitRate'
export type Tab = 'search' | 'saved'

export interface Product {
  id: string
  name: string
  imageUrl: string
  shopName: string
  isNew: boolean
  profitLevel: ProfitLevel
  marketplace: Marketplace
  purchasePrice: number
  purchaseUrl: string
  amazonPrice: number
  profit: number
  profitRate: number
  inStock: boolean
  matchScore: number
  marketConfidence: number
  savedAt: string
  saved: boolean
  fees: number
  notes?: string
}
