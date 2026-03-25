const axios = require('axios')

const YAHOO_API_URL = 'https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch'

async function searchYahoo(query, maxPrice) {
  const appId = process.env.YAHOO_APP_ID
  if (!appId) {
    console.warn('[Yahoo] APP_ID未設定 → モックデータを返します')
    return getMockData(query)
  }

  const params = {
    appid: appId,
    query,
    results: 15,
    sort: 'priceAsc',
    in_stock: 1,
  }
  if (maxPrice) params.price_to = maxPrice

  const { data } = await axios.get(YAHOO_API_URL, { params, timeout: 15000 })
  return (data.hits || []).map(item => ({
    id: `yahoo_${item.code || item.externalId}`,
    name: item.name,
    imageUrl: item.image?.medium || '',
    shopName: item.seller?.name || '',
    purchasePrice: item.price,
    purchaseUrl: item.url,
    marketplace: 'yahoo',
    inStock: item.inStock !== false,
  }))
}

function getMockData(query) {
  return [
    {
      id: `yahoo_mock_${Date.now()}_1`,
      name: `${query}`,
      imageUrl: '',
      shopName: 'Yahoo!モックストア',
      purchasePrice: 7900,
      purchaseUrl: 'https://shopping.yahoo.co.jp',
      marketplace: 'yahoo',
      inStock: true,
    },
    {
      id: `yahoo_mock_${Date.now()}_2`,
      name: `${query} セット`,
      imageUrl: '',
      shopName: 'ヤフオク倉庫',
      purchasePrice: 8200,
      purchaseUrl: 'https://shopping.yahoo.co.jp',
      marketplace: 'yahoo',
      inStock: true,
    },
  ]
}

module.exports = { searchYahoo }
