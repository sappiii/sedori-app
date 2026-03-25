const axios = require('axios')

const RAKUTEN_API_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706'

async function searchRakuten(keyword, maxPrice) {
  const appId = process.env.RAKUTEN_APP_ID
  if (!appId) {
    console.warn('[Rakuten] APP_ID未設定 → モックデータを返します')
    return getMockData(keyword)
  }

  const params = {
    format: 'json',
    keyword,
    applicationId: appId,
    hits: 15,
    sort: '+itemPrice',
    availability: 1,
  }
  if (maxPrice) params.maxPrice = maxPrice

  const { data } = await axios.get(RAKUTEN_API_URL, { params, timeout: 15000 })
  return (data.Items || []).map(({ Item }) => ({
    id: `rakuten_${Item.itemCode}`,
    name: Item.itemName,
    imageUrl: Item.mediumImageUrls?.[0]?.imageUrl || '',
    shopName: Item.shopName,
    purchasePrice: Item.itemPrice,
    purchaseUrl: Item.itemUrl,
    marketplace: 'rakuten',
    inStock: true,
  }))
}

function getMockData(keyword) {
  return [
    {
      id: `rakuten_mock_${Date.now()}_1`,
      name: `${keyword}`,
      imageUrl: '',
      shopName: '楽天モックショップ',
      purchasePrice: 8500,
      purchaseUrl: 'https://www.rakuten.co.jp',
      marketplace: 'rakuten',
      inStock: true,
    },
    {
      id: `rakuten_mock_${Date.now()}_2`,
      name: `${keyword} 新品`,
      imageUrl: '',
      shopName: '楽天アウトレット',
      purchasePrice: 9200,
      purchaseUrl: 'https://www.rakuten.co.jp',
      marketplace: 'rakuten',
      inStock: true,
    },
  ]
}

module.exports = { searchRakuten }
