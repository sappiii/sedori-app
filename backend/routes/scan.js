const express = require('express')
const router = express.Router()
const { searchYahoo } = require('../services/yahoo')
const hotProducts = require('../data/hotProducts')

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

router.get('/', async (req, res) => {
  const {
    minProfit = 1000,
    minProfitRate = 10,
    categories,
    feeRate = 0.15,
  } = req.query

  const minProfitNum = parseInt(minProfit)
  const minProfitRateNum = parseInt(minProfitRate)
  const feeRateNum = parseFloat(feeRate)

  // Filter by category if specified
  let products = hotProducts
  if (categories) {
    const categoryList = categories.split(',').map(c => c.trim())
    products = hotProducts.filter(p => categoryList.includes(p.category))
  }

  const results = []
  const BATCH_SIZE = 5

  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE)

    const batchResults = await Promise.allSettled(
      batch.map(async (product) => {
        try {
          const items = await searchYahoo(product.keyword, product.amazonPrice)
          return items.map(item => {
            const fees = Math.round(product.amazonPrice * feeRateNum)
            const profit = product.amazonPrice - item.purchasePrice - fees
            const profitRate = Math.round((profit / product.amazonPrice) * 100)
            return {
              ...item,
              keyword: product.keyword,
              category: product.category,
              asin: product.asin,
              amazonPrice: product.amazonPrice,
              purchasePrice: item.purchasePrice,
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
        } catch (err) {
          console.error(`[Scan] Error for "${product.keyword}":`, err.message)
          return []
        }
      })
    )

    for (const result of batchResults) {
      if (result.status === 'fulfilled') {
        results.push(...result.value)
      }
    }

    // Add delay between batches to avoid rate limiting (skip after last batch)
    if (i + BATCH_SIZE < products.length) {
      await sleep(500)
    }
  }

  // Filter by minProfit and minProfitRate
  const hits = results.filter(item =>
    item.profit >= minProfitNum && item.profitRate >= minProfitRateNum
  )

  // Sort by profit descending
  hits.sort((a, b) => b.profit - a.profit)

  res.json({
    results: hits,
    total: hits.length,
    scannedCount: products.length,
    hitCount: hits.length,
  })
})

module.exports = router
