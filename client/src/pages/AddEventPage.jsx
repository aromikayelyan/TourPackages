import { useState } from 'react'
import { createTour } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

function AddEventPage() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    availableSeats: '',
    duration: '',
    startDate: '',
    endDate: '',
  })
  const [files, setFiles] = useState([])
  const [status, setStatus] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleFiles = (e) => {
    setFiles(Array.from(e.target.files || []))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('')
    try {
      const fd = new FormData()
      Object.entries(form).forEach(([k, v]) => fd.append(k, v))
      if (user?.userUId) {
        fd.append('creatorUserUId', user.userUId)
      }
      files.forEach((file) => fd.append('images', file))

      await createTour(fd)
      setStatus('Event has been created successfully.')
      setForm({
        name: '',
        price: '',
        description: '',
        availableSeats: '',
        duration: '',
        startDate: '',
        endDate: '',
      })
      setFiles([])
    } catch (e) {
      console.error(e)
      setStatus('Failed to create event.')
    }
  }

  return (
    <div className="page">
      <h1>Add new event</h1>
      <p>
        Fill in the information below to publish a new tour or event. Any user can
        create events.
      </p>
      {!user && (
        <p className="error">
          You are not signed in. Event will be created without owner information.
        </p>
      )}
      <form className="form" onSubmit={handleSubmit}>
        <label>
          Title
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Price (USD)
          <input
            name="price"
            type="number"
            min="0"
            value={form.price}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Description
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Available seats
          <input
            name="availableSeats"
            type="number"
            min="0"
            value={form.availableSeats}
            onChange={handleChange}
          />
        </label>
        <label>
          Duration (e.g. 3 days / 2 nights)
          <input
            name="duration"
            value={form.duration}
            onChange={handleChange}
          />
        </label>
        <label>
          Start date
          <input
            type="date"
            name="startDate"
            value={form.startDate}
            onChange={handleChange}
          />
        </label>
        <label>
          End date
          <input
            type="date"
            name="endDate"
            value={form.endDate}
            onChange={handleChange}
          />
        </label>
        <label>
          Photos (up to 3)
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFiles}
          />
        </label>
        <button className="btn primary" type="submit">
          Publish event
        </button>
      </form>
      {status && <p>{status}</p>}
    </div>
  )
}

export default AddEventPage


