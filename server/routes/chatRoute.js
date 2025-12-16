import { Router } from 'express'
import { Op } from 'sequelize'
import chatModel from '../models/chat.js'

const router = Router()

// Создать чат между двумя пользователями (user1id, uuser2id - userUId из users)
router.post('/', async (req, res) => {
	try {
		const { user1id, uuser2id } = req.body

		if (!user1id || !uuser2id) {
			return res.status(400).json({ message: 'Need user1id and uuser2id' })
		}

		if (user1id === uuser2id) {
			return res.status(400).json({ message: 'Cannot create chat with yourself' })
		}

		// проверяем, нет ли уже такого чата (в любом порядке)
		const existingChat = await chatModel.findOne({
			where: {
				[Op.or]: [
					{ user1id, uuser2id },
					{ user1id: uuser2id, uuser2id: user1id }
				]
			}
		})

		if (existingChat) {
			return res.status(200).json({ message: 'Chat already exists', chat: existingChat })
		}

		const chat = await chatModel.create({
			user1id,
			uuser2id,
		})

		return res.status(201).json({ message: 'Chat created', chat })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error creating chat', error: e.message })
	}
})

// Получить все чаты пользователя (по userUId)
router.get('/user/:uid', async (req, res) => {
	try {
		const uid = req.params.uid

		const chats = await chatModel.findAll({
			where: {
				[Op.or]: [
					{ user1id: uid },
					{ uuser2id: uid }
				]
			},
			order: [['created_at', 'DESC']]
		})

		return res.status(200).json(chats)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error fetching chats', error: e.message })
	}
})

// Получить все чаты
router.get('/', async (req, res) => {
	try {
		const chats = await chatModel.findAll()
		return res.status(200).json(chats)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при получении чатов' })
	}
})

// Удалить чат
router.delete('/:id', async (req, res) => {
	try {
		const chat = await chatModel.findOne({ where: { id: req.params.id } })
		if (!chat) {
			return res.status(404).json({ message: 'Чат не найден' })
		}

		await chat.destroy()
		return res.status(200).json({ message: 'Чат удалён' })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при удалении чата' })
	}
})

export default router


