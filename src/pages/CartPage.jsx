import { useEffect, useState } from 'react'
import { fetchCart, updateCart, fetchTourByUid } from '../api.js'
import { useAuth } from '../AuthContext.jsx'
import { Link } from 'react-router-dom'

function CartPage() {
  const { user } = useAuth()
  const [cart, setCart] = useState(null)
  const [cartTours, setCartTours] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user?.userUId) {
      setLoading(false)
      return
    }
    loadCart()
  }, [user])

  const loadCart = async () => {
    if (!user?.userUId) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchCart(user.userUId)
      setCart(res.data)
      // загружаем информацию о турах
      const tourUids = Array.isArray(res.data.products) ? res.data.products : []
      const toursData = await Promise.all(
        tourUids.map(async (uid) => {
          try {
            const tourRes = await fetchTourByUid(uid)
            return tourRes.data[0] // первый элемент - данные тура
          } catch (e) {
            console.error(`Failed to load tour ${uid}`, e)
            return null
          }
        })
      )
      setCartTours(toursData.filter(Boolean))
    } catch (e) {
      console.error(e)
      setError(e.response?.data?.message || 'Failed to load cart')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async (tourUid) => {
    if (!user?.userUId || !cart) return
    try {
      const updatedProducts = cart.products.filter((uid) => uid !== tourUid)
      await updateCart(user.userUId, updatedProducts)
      await loadCart() // перезагружаем корзину
    } catch (e) {
      console.error(e)
      setError('Failed to remove item')
    }
  }

  if (!user) {
    return (
      <div className="page">
        <h1>Cart</h1>
        <p>Please sign in to view your cart.</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="page">
        <h1>Cart</h1>
        <p>Loading your cart...</p>
      </div>
    )
  }

  return (
    <div className="page">
      <h1>Cart</h1>
      {error && <p className="error">{error}</p>}
      
      {cartTours.length === 0 ? (
        <div className="cart-empty">
          <p>Your cart is empty.</p>
          <Link to="/tours" className="btn primary">
            Browse Tours
          </Link>
        </div>
      ) : (
        <>
          <div className="cart-items">
            {cartTours.map((tour) => (
              <div key={tour.uid} className="cart-item">
                {Array.isArray(tour.images) && tour.images[0] && (
                  <img src={tour.images[0]} alt={tour.name} className="cart-item-image" />
                )}
                <div className="cart-item-info">
                  <h3>{tour.name}</h3>
                  <p className="price">{tour.price} $</p>
                  <p className="cart-item-desc">{tour.description}</p>
                  <div className="cart-item-actions">
                    <Link to={`/tours/${tour.uid}`} className="btn">
                      View Details
                    </Link>
                    <button
                      className="btn btn-remove"
                      onClick={() => handleRemove(tour.uid)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h2>Cart Summary</h2>
            <p>
              <strong>Total items:</strong> {cartTours.length}
            </p>
            <p>
              <strong>Total price:</strong>{' '}
              {cartTours.reduce((sum, tour) => sum + (tour.price || 0), 0)} $
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage


