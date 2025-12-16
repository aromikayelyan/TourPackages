import { Router } from 'express'
import rateModel from '../models/rate.js'
import tourModel from '../models/tourPackage.js'

const router = Router()

// Создать отзыв к туру (по uid тура)
router.post('/:id', async (req, res) => {
	try {
		const tour = await tourModel.findOne({ where: { uid: req.params.id } })
		if (!tour) {
			return res.status(404).json({ message: 'Tour not found' })
		}

		if (req.body.rate <= 0 || req.body.rate > 5) {
			return res
				.status(400)
				.json({ message: 'Оценка не может быть меньше 0 и больше 5' })
		}

		await rateModel.create({
			packageId: tour.uid,
			userName: req.body.userName,
			userId: req.body.userId || null,
			comment: req.body.comment,
			rate: req.body.rate,
		})

		return res.status(201).json({ message: 'отзыв оставлен' })
	} catch (error) {
		console.error('Error adding:', error)
		res.status(500).json({ error: 'Error adding' })
	}
})

// Получить все отзывы по туру
router.get('/package/:id', async (req, res) => {
	try {
		const comments = await rateModel.findAll({
			where: { packageId: req.params.id },
		})
		return res.status(200).json(comments)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error, try again' })
	}
})

// Получить все отзывы (админский / общий)
router.get('/', async (req, res) => {
	try {
		const comments = await rateModel.findAll()
		return res.status(200).json(comments)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error, try again' })
	}
})

// Удалить отзыв
router.delete('/:id', async (req, res) => {
	try {
		const comment = await rateModel.findOne({ where: { id: req.params.id } })
		if (!comment) {
			return res.status(404).json({ message: 'Отзыв не найден' })
		}

		await comment.destroy()
		return res.status(200).json({ message: 'Отзыв удалён' })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error, try again' })
	}
})

export default router

