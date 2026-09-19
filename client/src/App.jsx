import { useState, useEffect } from 'react'
import './App.css'

const API = 'http://localhost:5000/api/expenses'
const CATEGORIES = ['food', 'travel', 'bills', 'shopping', 'other']

function App() {
  const [expenses, setExpenses] = useState([])
  const [summary, setSummary] = useState([])
  const [filter, setFilter] = useState('') 
  const [form, setForm] = useState({ title: '', amount: '', category: 'food' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('') 
  const [formError, setFormError] = useState('') 

  async function loadExpenses() {
    setLoading(true)
    setError('')
    try {
      const url = filter ? `${API}?category=${filter}` : API
      const res = await fetch(url)
      if (!res.ok) throw new Error('Failed to load expenses')
      setExpenses(await res.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function loadSummary() {
    try {
      const res = await fetch(`${API}/summary`)
      if (!res.ok) throw new Error('Failed to load summary')
      setSummary(await res.json())
    } catch (err) {
      setError(err.message)
    }
  }

  useEffect(() => {
    loadExpenses()
  }, [filter])

  useEffect(() => {
    loadSummary()
  }, [])

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setFormError('')
    try {
      const res = await fetch(API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, amount: Number(form.amount) }),
      })
      const data = await res.json()
      if (!res.ok) {
        setFormError(data.error || 'Something went wrong')
        return
      }
      setForm({ title: '', amount: '', category: 'food' }) 
      loadExpenses()
      loadSummary()
    } catch (err) {
      setFormError('Could not reach the server')
    }
  }

  async function handleDelete(id) {
    try {
      const res = await fetch(`${API}/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      loadExpenses()
      loadSummary()
    } catch (err) {
      setError(err.message)
    }
  }

  const grandTotal = summary.reduce((sum, item) => sum + item.total, 0)

  return (
    <div className="container">
      <h1>Expense Tracker</h1>

      <form onSubmit={handleSubmit}>
        <h2>Add Expense</h2>
        <input
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
        />
        <input
          name="amount"
          type="number"
          placeholder="Amount"
          value={form.amount}
          onChange={handleChange}
        />
        <select name="category" value={form.category} onChange={handleChange}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <button type="submit">Add</button>
        {formError && <p className="error">{formError}</p>}
      </form>

      <section>
        <h2>Summary</h2>
        {summary.length === 0 ? (
          <p>No data</p>
        ) : (
          <ul>
            {summary.map((s) => (
              <li key={s.category}>{s.category}: {s.total}</li>
            ))}
          </ul>
        )}
        <strong>Grand Total: {grandTotal}</strong>
      </section>

      <section>
        <h2>Expenses</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {loading && <p>Loading...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && !error && expenses.length === 0 && <p>No expenses yet</p>}

        {!loading && expenses.length > 0 && (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Amount</th>
                <th>Category</th>
                <th>Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((e) => (
                <tr key={e._id}>
                  <td>{e.title}</td>
                  <td>{e.amount}</td>
                  <td>{e.category}</td>
                  <td>{new Date(e.createdAt).toLocaleDateString()}</td>
                  <td><button onClick={() => handleDelete(e._id)}>Delete</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}

export default App
