const express = require('express')
const router = express.Router()
const { randomUUID } = require('crypto')
const db = require('../db/database')

router.get('/', (req, res) => {
  const products = db.get('products').sortBy(p => -new Date(p.savedAt).getTime()).value()
  res.json(products)
})

router.post('/', (req, res) => {
  const p = req.body
  const id = p.id || randomUUID()
  const existing = db.get('products').find({ id }).value()

  if (existing) {
    db.get('products').find({ id }).assign({ ...p, savedAt: new Date().toISOString() }).write()
  } else {
    db.get('products').push({ ...p, id, saved: true, savedAt: new Date().toISOString() }).write()
  }
  res.json({ success: true, id })
})

router.delete('/:id', (req, res) => {
  db.get('products').remove({ id: req.params.id }).write()
  res.json({ success: true })
})

module.exports = router
