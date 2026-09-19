const express = require('express')
const mongoose = require('mongoose')
const Expense = require('../models/Expense')

const router = express.Router()

router.get('/summary', async (req, res) => {
  try {
    const data = await Expense.aggregate([
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $project: { _id: 0, category: '$_id', total: 1 } },
    ])
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.get('/', async (req, res) => {
  try {
    const filter = req.query.category ? { category: req.query.category } : {}
    const expenses = await Expense.find(filter).sort({ createdAt: -1 })
    res.json(expenses)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/', async (req, res) => {
  try {
    const expense = await Expense.create(req.body)
    res.status(201).json(expense)
  } catch (err) {
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
})

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ error: 'Invalid ID' })
    }
    const deleted = await Expense.findByIdAndDelete(req.params.id)
    if (!deleted) {
      return res.status(404).json({ error: 'Expense not found' })
    }
    res.json({ message: 'Deleted' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router
