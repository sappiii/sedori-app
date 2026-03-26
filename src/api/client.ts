import { Product } from '../types'

const BASE = 'https://sedori-backend-ufzf.onrender.com/api'

export async function autoScan(params: {
  minProfit?: number
  minProfitRate?: number
  feeRate?: number
  categories?: string
}): Promise<{ results: Product[], total: number, scannedCount: number, hitCount: number }> {
  const query = new URLSearchParams()
  if (params.minProfit !== undefined) query.set('minProfit', String(params.minProfit))
  if (params.minProfitRate !== undefined) query.set('minProfitRate', String(params.minProfitRate))
  if (params.feeRate !== undefined) query.set('feeRate', String(params.feeRate))
  if (params.categories) query.set('categories', params.categories)
  const res = await fetch(`${BASE}/scan?${query.toString()}`)
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { error?: string }).error || 'スキャンに失敗しました')
  }
  const data = await res.json() as { results: Record<string, unknown>[], total: number, scannedCount: number, hitCount: number }
  return {
    ...data,
    results: (data.results || []).map((r: Record<string, unknown>) => ({
      ...r,
      sourceMarketplace: r.marketplace,
    })) as Product[],
  }
}

export async function searchProducts(params: {
  query: string
  amazonPrice: number
  marketplaces: string[]
  feeRate?: number
}): Promise<Product[]> {
  const res = await fetch(`${BASE}/search`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || '検索に失敗しました')
  }
  const data = await res.json()
  return (data.results || []).map((r: Record<string, unknown>) => ({
    ...r,
    // backend uses 'marketplace', frontend also uses 'marketplace'
    sourceMarketplace: r.marketplace,
  })) as Product[]
}

export async function getSavedProducts(): Promise<Product[]> {
  const res = await fetch(`${BASE}/products`)
  if (!res.ok) throw new Error('保存済み商品の取得に失敗しました')
  return res.json()
}

export async function saveProduct(product: Product): Promise<void> {
  const res = await fetch(`${BASE}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(product),
  })
  if (!res.ok) throw new Error('保存に失敗しました')
}

export async function deleteProduct(id: string): Promise<void> {
  await fetch(`${BASE}/products/${id}`, { method: 'DELETE' })
}
