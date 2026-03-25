import { Product } from '../types'

const BASE = '/api'

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
