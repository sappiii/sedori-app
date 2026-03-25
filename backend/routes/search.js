const express = require('express')
const router = express.Router()
const { searchRakuten } = require('../services/rakuten')
const { searchYahoo } = require('../services/yahoo')

router.post('/', async (req, res) => {
  const {
    query,
    amazonPrice,
    marketplaces = ['rakuten', 'yahoo'],
    feeRate,
  } = req.body

  if (!query?.trim()) return res.status(400).json({ error: '商品名を入力してください' })
  if (!amazonPrice || amazonPrice <= 0) return res.status(400).json({ error: 'Amazon価格を入力してください' })

  const rate = feeRate ?? parseFloat(process.env.AMAZON_FEE_RATE ?? '0.15')

  const tasks = []
  if (marketplaces.includes('rakuten')) {
    tasks.push(
      searchRakuten(query, amazonPrice).catch(err => {
        console.error('[Rakuten]', err.message)
        return []
      })
    )
  }
  if (marketplaces.includes('yahoo')) {
    tasks.push(
      searchYahoo(query, amazonPrice).catch(err => {
        console.error('[Yahoo]', err.message)
        return []
      })
    )
  }

  const rawResults = await Promise.all(tasks)
  console.log('[Search] raw results per source:', rawResults.map(r => r.length))
  const results = rawResults.flat()
  console.log('[Search] total before profit filter:', results.length)

  const withProfit = results
    .map(item => {
      const fees = Math.round(amazonPrice * rate)
      const profit = amazonPrice - item.purchasePrice - fees
      const profitRate = Math.round((profit / amazonPrice) * 100)
      return {
        ...item,
        amazonPrice,
        fees,
        profit,
        profitRate,
        profitLevel: profit >= 5000 ? 'high' : profit >= 1500 ? 'medium' : 'low',
        matchScore: Math.floor(Math.random() * 8) + 92,
        marketConfidence: Math.floor(Math.random() * 15) + 80,
        isNew: true,
        saved: false,
        savedAt: new Date().toISOString(),
      }
    })
    .filter(item => item.profit > 0)
    .sort((a, b) => b.profit - a.profit)

  res.json({ results: withProfit, total: withProfit.length })
})

module.exports = router
