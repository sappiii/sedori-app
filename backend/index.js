require('dotenv').config()
const express = require('express')
const cors = require('cors')
const searchRoutes = require('./routes/search')
const productsRoutes = require('./routes/products')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.use('/api/search', searchRoutes)
app.use('/api/products', productsRoutes)
app.get('/api/health', (_, res) => res.json({
  status: 'ok',
  rakuten: process.env.RAKUTEN_APP_ID ? '設定済み' : '未設定',
  yahoo: process.env.YAHOO_APP_ID ? '設定済み' : '未設定',
}))

app.get('/api/debug-yahoo', async (_, res) => {
  const { searchYahoo } = require('./services/yahoo')
  try {
    const results = await searchYahoo('Nintendo Switch', 55000)
    res.json({ count: results.length, results })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Backend: http://localhost:${PORT}`)
  console.log(`   楽天API: ${process.env.RAKUTEN_APP_ID ? '✅ 設定済み' : '⚠️  未設定（モックデータ使用）'}`)
  console.log(`   Yahoo API: ${process.env.YAHOO_APP_ID ? '✅ 設定済み' : '⚠️  未設定（モックデータ使用）'}`)
})
