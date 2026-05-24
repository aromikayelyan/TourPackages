import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchTours } from '../api.js'

function HomePage() {
  const [tours, setTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchTours()
        setTours(res.data)
      } catch (e) {
        console.error(e)
        setError('Failed to load tours')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  return (
    <div className="page">
      <section className="hero">
        <div className="hero-content">
          <h1>Find your next stay</h1>
          <p>Search deals on tours, trips and experiences around the world.</p>
        </div>
        <div className="hero-search">
          <input placeholder="Where are you going?" />
          <input type="date" />
          <input type="date" />
          <button className="btn primary">Search</button>
        </div>
      </section>

      {loading && <div className="loading">Loading tours...</div>}
      {error && !loading && <div className="error">{error}</div>}

      {!loading && !error && (
        <div className="grid">
          {tours.map((tour) => (
            <Link
              key={tour.uid}
              to={`/tours/${tour.uid}`}
              className="card card-link"
            >
              {Array.isArray(tour.images) && tour.images[0] && (
                <img src={tour.images[0]} alt={tour.name} className="card-image" />
              )}
              <h2>{tour.name}</h2>
              <p className="price">{tour.price} $</p>
              <p>{tour.description}</p>
              <p>
                Duration: <strong>{tour.duration}</strong>
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default HomePage


