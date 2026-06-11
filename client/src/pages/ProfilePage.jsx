import { useEffect, useState } from 'react'
import { useAuth } from '../AuthContext.jsx'
import { fetchToursByUser, fetchCart, fetchTourByUid } from '../api.js'
import { Link } from 'react-router-dom'
import { deleteTour } from './path-to-your-api' // Укажите правильный путь к api.js



function ProfilePage() {
  const { user, setUser } = useAuth()
  const [tours, setTours] = useState([])
  const [cartTours, setCartTours] = useState([])
  const [loading, setLoading] = useState(false)
  const [cartLoading, setCartLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.userUId) return
    loadTours()
    loadCart()
  }, [user])

  const loadTours = async () => {
    if (!user?.userUId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchToursByUser(user.userUId)
      setTours(res.data)
    } catch (e) {
      console.error(e)
      setError('Failed to load your tours')
    } finally {
      setLoading(false)
    }
  }
  // Внутри вашего компонента:
const handleDelete = async (uid) => {
  if (window.confirm('Вы уверены, что хотите удалить этот тур?')) {
    try {
      await deleteTour(uid)
      
      // Обновляем локальный стейт, чтобы тур исчез из интерфейса
      setTours(prevTours => prevTours.filter(tour => tour.uid !== uid))
      
      alert('Тур успешно удален')
    } catch (err) {
      console.error(err)
      alert(err.response?.data?.message || 'Не удалось удалить тур')
    }
  }
}

  const loadCart = async () => {
    if (!user?.userUId) return
    setCartLoading(true)
    try {
      const cartRes = await fetchCart(user.userUId)
      const tourUids = Array.isArray(cartRes.data?.products) ? cartRes.data.products : []
      if (tourUids.length > 0) {
        const toursData = await Promise.all(
          tourUids.slice(0, 3).map(async (uid) => {
            try {
              const tourRes = await fetchTourByUid(uid)
              return tourRes.data[0]
            } catch (e) {
              return null
            }
          })
        )
        setCartTours(toursData.filter(Boolean))
      }
    } catch (e) {
      console.error(e)
    } finally {
      setCartLoading(false)
    }
  }

  if (!user) {
    return (
      <div className="page">
        <h1>Your profile</h1>
        <p>Please sign in to see your profile.</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Your profile</h1>
      <div className="card">
        <h2>{user.Username}</h2>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
        <p>
          <strong>User UID:</strong> {user.userUId}
        </p>
        <button className="btn" onClick={() => setUser(null)}>
          Sign out
        </button>
      </div>

      <section className="section">
        <h2>Your tours & events</h2>
        {loading && <p>Loading your tours...</p>}
        {error && <p className="error">{error}</p>}
        {!loading && tours.length === 0 && <p>You have not created any tours yet.</p>}
        <div className="grid">
          {tours.map((tour) => (
            <div key={tour.uid} className="card">
              {Array.isArray(tour.images) && tour.images[0] && (
                <img src={tour.images[0]} alt={tour.name} className="card-image" />
              )}
              <h3>{tour.name}</h3>
              <p className="price">{tour.price} $</p>
              <p>{tour.description}</p>
              <Link to={`/tours/${tour.uid}`} className="btn">
                Open details
              </Link>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
  <h2>Your tours & events</h2>
  {loading && <p>Loading your tours...</p>}
  {error && <p className="error">{error}</p>}
  {!loading && tours.length === 0 && <p>You have not created any tours yet.</p>}
  
  <div className="grid">
    {tours.map((tour) => (
      <div key={tour.uid} className="card">
        {Array.isArray(tour.images) && tour.images[0] && (
          <img src={tour.images[0]} alt={tour.name} className="card-image" />
        )}
        <h3>{tour.name}</h3>
        <p className="price">{tour.price} $</p>
        <p>{tour.description}</p>
        
        <div className="card-actions" style={{ display: 'flex', gap: '10px', marginTop: 'auto' }}>
          <Link to={`/tours/${tour.uid}`} className="btn">
            Open details
          </Link>
          
          {/* Кнопка удаления */}
          <button 
            onClick={() => handleDelete(tour.uid)} 
            className="btn btn-delete"
            style={{ backgroundColor: '#ff4d4f', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer' }}
          >
            Delete
          </button>
        </div>

      </div>
    ))}
  </div>
</section>

      <section className="section">
        <h2>Your Cart</h2>
        {cartLoading && <p>Loading cart...</p>}
        {!cartLoading && cartTours.length === 0 && (
          <p>Your cart is empty. <Link to="/tours">Browse tours</Link> to add items.</p>
        )}
        {!cartLoading && cartTours.length > 0 && (
          <>
            <p>You have {cartTours.length} item(s) in your cart.</p>
            <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
              {cartTours.map((tour) => (
                <div key={tour.uid} className="card">
                  {Array.isArray(tour.images) && tour.images[0] && (
                    <img src={tour.images[0]} alt={tour.name} className="card-image" />
                  )}
                  <h3>{tour.name}</h3>
                  <p className="price">{tour.price} $</p>
                  <Link to={`/tours/${tour.uid}`} className="btn">
                    View
                  </Link>
                </div>
              ))}
            </div>
            <Link to="/cart" className="btn primary" style={{ marginTop: '1rem' }}>
              View Full Cart
            </Link>
          </>
        )}
      </section>

      <section className="section">
        <h2>Chats</h2>
        <p>
          To manage your chats, go to the <Link to="/chats">Chats</Link> page.
        </p>
      </section>
    </div>
  )
}

export default ProfilePage


