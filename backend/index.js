require('dotenv').config()
const express = require('express')
const cors = require('cors')
const searchRoutes = require('./routes/search')
const productsRoutes = require('./routes/products')
const scanRouter = require('./routes/scan')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/search', searchRoutes)
app.use('/api/products', productsRoutes)
app.use('/api/scan', scanRouter)
app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  rakuten: process.env.RAKUTEN_APP_ID ? '設定済み' : '未設定',
  yahoo: process.env.YAHOO_APP_ID ? '設定済み' : '未設定',
}))

app.get('/api/debug-yahoo', async (_, res) => {
  const axios = require('axios')
  const appId = process.env.YAHOO_APP_ID
  const appIdInfo = {
    length: appId ? appId.length : 0,
    first20: appId ? appId.slice(0,20) : 'なし',
    last10: appId ? appId.slice(-10) : 'なし',
  }
  try {
    const { data } = await axios.get('https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch', {
      params: { appid: appId, query: 'Nintendo Switch', results: 3 },
      timeout: 15000
    })
    res.json({ appIdInfo, total: data.totalResultsAvailable, hits: (data.hits||[]).map(h=>({name:h.name.slice(0,30), price:h.price})) })
  } catch (err) {
    res.status(500).json({ error: err.message, appIdInfo })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend: http://localhost:${PORT}`)
  console.log(`   楽天API: ${process.env.RAKUTEN_APP_ID ? '✅ 設定済み' : '⚠️  未設定（モックデータ使用）'}`)
  console.log(`   Yahoo API: ${process.env.YAHOO_APP_ID ? '✅ 設定済み' : '⚠️  未設定（モックデータ使用）'}`)
})
