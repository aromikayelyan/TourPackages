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

  // Получаем UID универсально, чтобы поддерживать и старых, и новых юзеров
  const currentUid = user?.userUId || user?.uid;

  useEffect(() => {
    if (!currentUid) {
      setLoading(false)
      return
    }
    loadCart()
  }, [currentUid]) // Следим за изменением вычисленного UID

  const loadCart = async () => {
    if (!currentUid) return
    setLoading(true)
    setError('')
    try {
      const res = await fetchCart(currentUid)
      setCart(res.data)
      
      // Загружаем информацию о турах
      const tourUids = Array.isArray(res.data?.products) ? res.data.products : []
      const toursData = await Promise.all(
        tourUids.map(async (uid) => {
          try {
            const tourRes = await fetchTourByUid(uid)
            
            // Защита: наш гибридный ответ из api.js поддерживает и tourRes.data[0],
            // и прямую отдачу tourRes.data. Но на случай, если прилетел чистый объект,
            // подстрахуемся оператором `|| tourRes.data`
            return tourRes.data[0] || tourRes.data
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
    if (!currentUid || !cart) return
    try {
      const productsList = Array.isArray(cart.products) ? cart.products : []
      const updatedProducts = productsList.filter((uid) => uid !== tourUid)
      
      await updateCart(currentUid, updatedProducts)
      await loadCart() // Перезагружаем корзину для обновления стейта
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
            {cartTours.map((tour) => {
              // Безопасно вытаскиваем первую картинку, даже если это массив или строка
              let displayImage = "";
              if (Array.isArray(tour.images) && tour.images.length > 0) {
                displayImage = tour.images[0];
              } else if (typeof tour.images === 'string') {
                displayImage = tour.images;
              } else {
                displayImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e";
              }

              return (
                <div key={tour.uid} className="cart-item">
                  {displayImage && (
                    <img src={displayImage} alt={tour.name} className="cart-item-image" />
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
              );
            })}
          </div>
          <div className="cart-summary">
            <h2>Cart Summary</h2>
            <p>
              <strong>Total items:</strong> {cartTours.length}
            </p>
            <p>
              <strong>Total price:</strong>{' '}
              {cartTours.reduce((sum, tour) => sum + (Number(tour.price) || 0), 0)} $
            </p>
          </div>
        </>
      )}
    </div>
  )
}

export default CartPage
