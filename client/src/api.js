import axios from 'axios'

const api = axios.create({
  baseURL: 'http://localhost:4400',
})

export const fetchTours = () => api.get('/packages')
export const fetchTourByUid = (uid) => api.get(`/packages/${uid}`)
export const fetchToursByUser = (userUId) => api.get(`/packages/user/${userUId}`)
export const createTour = (formData) =>
  api.post('/packages', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const createRating = (uid, data) => api.post(`/rating/${uid}`, data)

export const registerUser = (data) => api.post('/users/register', data)
export const loginUser = (data) => api.post('/users/login', data)

export const fetchCart = (useruid) => api.get(`/carts/user/${useruid}`)
export const updateCart = (useruid, products) => {
  console.log('Updating cart for user:', useruid, 'with products:', products)
  return api.put(`/carts/user/${useruid}`, { products })
}
export const addToCart = async (useruid, tourUid) => {
  try {
    // получаем текущую корзину (теперь всегда возвращает массив products)
    const cartRes = await fetchCart(useruid)
    let currentProducts = []
    
    // обрабатываем products - может быть массивом или строкой
    if (cartRes.data?.products) {
      if (Array.isArray(cartRes.data.products)) {
        currentProducts = cartRes.data.products
      } else if (typeof cartRes.data.products === 'string') {
        try {
          currentProducts = JSON.parse(cartRes.data.products)
        } catch (e) {
          currentProducts = []
        }
      }
    }
    
    // проверяем, нет ли уже этого тура в корзине
    if (currentProducts.includes(tourUid)) {
      throw new Error('Tour already in cart')
    }
    
    // добавляем новый тур в массив
    const updatedProducts = [...currentProducts, tourUid]
    
    // обновляем корзину (сервер создаст её если нет)
    const updateRes = await updateCart(useruid, updatedProducts)
    return updateRes
  } catch (error) {
    console.error('Error adding to cart:', error)
    // если это наша ошибка про дубликат, пробрасываем дальше
    if (error.message === 'Tour already in cart') {
      throw error
    }
    // для остальных ошибок пробрасываем с понятным сообщением
    throw new Error(error.response?.data?.message || error.message || 'Failed to add to cart')
  }
}

export const fetchChats = () => api.get('/chats')
export const fetchUserChats = (userUId) => api.get(`/chats/user/${userUId}`)
export const createChat = (user1id, user2id) => api.post('/chats', { user1id, uuser2id: user2id })

export default api


