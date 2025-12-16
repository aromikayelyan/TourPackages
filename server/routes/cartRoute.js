import { Router } from 'express'
import cartModel from '../models/cart.js'

const router = Router()

// Создать корзину для пользователя
router.post('/', async (req, res) => {
	try {
		const { useruid, products } = req.body

		if (!useruid) {
			return res.status(400).json({ message: 'Не указан useruid' })
		}

		const cart = await cartModel.create({
			useruid,
			products: products ? JSON.stringify(products) : null,
		})

		return res.status(201).json({ message: 'Корзина создана', cart })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при создании корзины' })
	}
})

// Получить корзину по useruid (возвращает пустую корзину если её нет)
router.get('/user/:uid', async (req, res) => {
	try {
		let cart = await cartModel.findOne({ where: { useruid: req.params.uid } })
		
		if (!cart) {
			// возвращаем пустую корзину вместо 404
			return res.status(200).json({ 
				useruid: req.params.uid,
				products: [],
				id: null
			})
		}

		let products = []
		try {
			products = cart.products ? JSON.parse(cart.products) : []
		} catch (e) {
			products = []
		}

		return res.status(200).json({ ...cart.dataValues, products })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при получении корзины' })
	}
})

// Обновить товары в корзине (создает корзину если её нет)
router.put('/user/:uid', async (req, res) => {
	try {
		const useruid = req.params.uid
		const products = req.body.products
		
		console.log('Updating cart for user:', useruid, 'Products:', products)
		
		if (!useruid) {
			return res.status(400).json({ message: 'User UID is required' })
		}
		
		let cart = await cartModel.findOne({ where: { useruid } })
		
		if (!cart) {
			// создаем корзину если её нет
			console.log('Creating new cart for user:', useruid)
			cart = await cartModel.create({
				useruid,
				products: products ? JSON.stringify(products) : JSON.stringify([]),
			})
		} else {
			// обновляем существующую корзину
			if (products !== undefined) {
				console.log('Updating existing cart, products:', products)
				cart.products = JSON.stringify(products)
				await cart.save()
			}
		}

		// парсим products для ответа
		let parsedProducts = []
		try {
			parsedProducts = cart.products ? JSON.parse(cart.products) : []
		} catch (e) {
			console.error('Error parsing products:', e)
			parsedProducts = []
		}

		console.log('Cart updated successfully, products:', parsedProducts)
		return res.status(200).json({ message: 'Cart updated', cart: { ...cart.dataValues, products: parsedProducts } })
	} catch (e) {
		console.error('Error updating cart:', e)
		res.status(500).json({ message: 'Error updating cart', error: e.message })
	}
})

// Удалить корзину
router.delete('/user/:uid', async (req, res) => {
	try {
		const cart = await cartModel.findOne({ where: { useruid: req.params.uid } })
		if (!cart) {
			return res.status(404).json({ message: 'Корзина не найдена' })
		}

		await cart.destroy()
		return res.status(200).json({ message: 'Корзина удалена' })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при удалении корзины' })
	}
})

export default router


