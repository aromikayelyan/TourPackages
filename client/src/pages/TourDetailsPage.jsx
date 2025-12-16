import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { createRating, fetchTourByUid, addToCart, createChat } from '../api.js'
import { useAuth } from '../AuthContext.jsx'

function TourDetailsPage() {
  const { uid } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [tour, setTour] = useState(null)
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [form, setForm] = useState({ userName: '', comment: '', rate: 5 })
  const [submitting, setSubmitting] = useState(false)
  const [imageIndex, setImageIndex] = useState(0)
  const [addingToCart, setAddingToCart] = useState(false)
  const [cartMessage, setCartMessage] = useState('')
  const [chatMessage, setChatMessage] = useState('')
  const [creatingChat, setCreatingChat] = useState(false)

  useEffect(() => {
    async function load() {
      try {
        const res = await fetchTourByUid(uid)
        const [tourData, commentsData] = res.data
        setTour(tourData)
        setComments(commentsData || [])
        setImageIndex(0)
      } catch (e) {
        console.error(e)
        setError('Failed to load tour')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [uid])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createRating(uid, {
        userName: form.userName,
        comment: form.comment,
        rate: Number(form.rate),
      })
      // simple reload comments
      const res = await fetchTourByUid(uid)
      const [, commentsData] = res.data
      setComments(commentsData || [])
      setForm({ userName: '', comment: '', rate: 5 })
    } catch (err) {
      console.error(err)
      alert('Failed to submit review')
    } finally {
      setSubmitting(false)
    }
  }

  const hasImages = Array.isArray(tour?.images) && tour.images.length > 0

  const handlePrevImage = () => {
    if (!hasImages) return
    setImageIndex((prev) =>
      prev === 0 ? tour.images.length - 1 : prev - 1,
    )
  }

  const handleNextImage = () => {
    if (!hasImages) return
    setImageIndex((prev) =>
      prev === tour.images.length - 1 ? 0 : prev + 1,
    )
  }

  const handleAddToCart = async () => {
    if (!user) {
      alert('Please sign in to add items to cart')
      return
    }
    if (!user.userUId) {
      alert('User ID is missing. Please sign in again.')
      return
    }
    setAddingToCart(true)
    setCartMessage('')
    try {
      await addToCart(user.userUId, uid)
      setCartMessage('✓ Added to cart successfully!')
      setTimeout(() => setCartMessage(''), 3000)
    } catch (err) {
      console.error('Add to cart error:', err)
      const errorMsg = err.message || err.response?.data?.message || 'Failed to add to cart'
      if (errorMsg.includes('already in cart')) {
        setCartMessage('⚠ This tour is already in your cart')
      } else {
        setCartMessage(`✗ ${errorMsg}`)
      }
      setTimeout(() => setCartMessage(''), 5000)
    } finally {
      setAddingToCart(false)
    }
  }

  const handleStartChat = async (otherUserId) => {
    if (!user) {
      alert('Please sign in to start a chat')
      return
    }
    if (!user.userUId) {
      alert('User ID is missing. Please sign in again.')
      return
    }
    if (user.userUId === otherUserId) {
      alert('Cannot start chat with yourself')
      return
    }
    setCreatingChat(true)
    setChatMessage('')
    try {
      const res = await createChat(user.userUId, otherUserId)
      setChatMessage('✓ Chat created! Redirecting...')
      setTimeout(() => {
        navigate('/chats')
      }, 1000)
    } catch (err) {
      console.error('Create chat error:', err)
      const errorMsg = err.response?.data?.message || err.message || 'Failed to create chat'
      if (errorMsg.includes('already exists')) {
        setChatMessage('✓ Chat already exists! Redirecting...')
        setTimeout(() => {
          navigate('/chats')
        }, 1000)
      } else {
        setChatMessage(`✗ ${errorMsg}`)
        setTimeout(() => setChatMessage(''), 3000)
      }
    } finally {
      setCreatingChat(false)
    }
  }

  if (loading) return <div>Loading tour...</div>
  if (error) return <div>{error}</div>
  if (!tour) return <div>Tour not found</div>

  return (
    <div className="page">
      <div className="tour-details">
        <div className="tour-images">
          {hasImages ? (
            <>
              <div className="tour-main-image-wrapper">
                <img
                  src={tour.images[imageIndex]}
                  alt={tour.name}
                  className="tour-main-image"
                />
                {tour.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="carousel-btn prev"
                      onClick={handlePrevImage}
                    >
                      ‹
                    </button>
                    <button
                      type="button"
                      className="carousel-btn next"
                      onClick={handleNextImage}
                    >
                      ›
                    </button>
                  </>
                )}
              </div>
              {tour.images.length > 1 && (
                <div className="tour-thumbs">
                  {tour.images.map((img, idx) => (
                    <button
                      key={img}
                      type="button"
                      className={
                        'tour-thumb' + (idx === imageIndex ? ' active' : '')
                      }
                      onClick={() => setImageIndex(idx)}
                    >
                      <img src={img} alt={tour.name} />
                    </button>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="tour-no-image">No photos available</div>
          )}
        </div>
        <div className="tour-info">
          <div className="tour-info-header">
            <h2 className="tour-title">{tour.name}</h2>
            <p className="tour-price-big">{tour.price} $</p>
          </div>
          <div className="tour-info-card">
            <p className="tour-description">{tour.description}</p>
            <div className="tour-meta">
              <div className="tour-meta-item">
                <span className="meta-label">Duration:</span>
                <span className="meta-value">{tour.duration}</span>
              </div>
              <div className="tour-meta-item">
                <span className="meta-label">Available seats:</span>
                <span className="meta-value">{tour.availableSeats}</span>
              </div>
              <div className="tour-meta-item">
                <span className="meta-label">Dates:</span>
                <span className="meta-value">{tour.startDate} – {tour.endDate}</span>
              </div>
            </div>
            <div className="tour-actions">
              <button
                className="btn btn-add-to-cart"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Adding...' : '🛒 Add to Cart'}
              </button>
              {cartMessage && (
                <p className={`cart-message ${cartMessage.includes('✓') ? 'success' : 'error'}`}>
                  {cartMessage}
                </p>
              )}
              
              {user && (
                <>
                  {tour.creatorUserUId && tour.creatorUserUId !== user.userUId && (
                    <button
                      className="btn btn-chat-organizer"
                      onClick={() => handleStartChat(tour.creatorUserUId)}
                      disabled={creatingChat}
                    >
                      {creatingChat ? 'Creating...' : '💬 Chat with Organizer'}
                    </button>
                  )}
                  {chatMessage && (
                    <p className={`chat-message ${chatMessage.includes('✓') ? 'success' : 'error'}`}>
                      {chatMessage}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <section className="section">
        <h2>Reviews</h2>
        {comments.length === 0 && <p>No reviews yet.</p>}
        <ul className="reviews">
          {comments.map((c) => (
            <li key={c.id} className="review">
              <div className="review-header">
                <strong>{c.userName}</strong>
                <span>Rate: {c.rate}/5</span>
              </div>
              <p>{c.comment}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="section">
        <h2>Leave a review</h2>
        <form className="form" onSubmit={handleSubmit}>
          <label>
            Name
            <input
              name="userName"
              value={form.userName}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Comment
            <textarea
              name="comment"
              value={form.comment}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            Rate (1-5)
            <input
              type="number"
              min="1"
              max="5"
              name="rate"
              value={form.rate}
              onChange={handleChange}
              required
            />
          </label>
          <button className="btn" type="submit" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit review'}
          </button>
        </form>
      </section>
    </div>
  )
}

export default TourDetailsPage


