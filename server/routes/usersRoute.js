import { Router } from 'express'
import { v4 as uuidv4 } from 'uuid'
import bcrypt from 'bcryptjs'
import userModel from '../models/user.js'

const router = Router()

// Регистрация
router.post('/register', async (req, res) => {
	try {
		const { Username, email, password } = req.body

		if (!Username || !email || !password) {
			return res.status(400).json({ message: 'Заполните все поля' })
		}

		const existing = await userModel.findOne({ where: { email } })
		if (existing) {
			return res.status(400).json({ message: 'Пользователь с таким email уже существует' })
		}

		const hash = await bcrypt.hash(password, 10)

		const user = await userModel.create({
			Username,
			email,
			password: hash,
			userUId: uuidv4(),
		})

		return res.status(201).json({
			message: 'Пользователь зарегистрирован',
			user: {
				id: user.id,
				Username: user.Username,
				email: user.email,
				userUId: user.userUId,
			},
		})
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка регистрации' })
	}
})

// Логин (без JWT — просто проверка)
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body

		if (!email || !password) {
			return res.status(400).json({ message: 'Введите email и пароль' })
		}

		const user = await userModel.findOne({ where: { email } })
		if (!user) {
			return res.status(400).json({ message: 'Неверный email или пароль' })
		}

		const isMatch = await bcrypt.compare(password, user.password)
		if (!isMatch) {
			return res.status(400).json({ message: 'Неверный email или пароль' })
		}

		return res.status(200).json({
			message: 'Успешный вход',
			user: {
				id: user.id,
				Username: user.Username,
				email: user.email,
				userUId: user.userUId,
			},
		})
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка входа' })
	}
})

// Получить всех пользователей
router.get('/', async (req, res) => {
	try {
		const users = await userModel.findAll()
		return res.status(200).json(users)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при получении пользователей' })
	}
})

// Получить пользователя по userUId
router.get('/:uid', async (req, res) => {
	try {
		const user = await userModel.findOne({ where: { userUId: req.params.uid } })
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' })
		}
		return res.status(200).json(user)
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при получении пользователя' })
	}
})

// Обновить пользователя (Username / email)
router.put('/:uid', async (req, res) => {
	try {
		const user = await userModel.findOne({ where: { userUId: req.params.uid } })
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' })
		}

		if (req.body.Username !== undefined) user.Username = req.body.Username
		if (req.body.email !== undefined) user.email = req.body.email

		await user.save()
		return res.status(200).json({ message: 'Пользователь обновлён', user })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при обновлении пользователя' })
	}
})

// Удалить пользователя
router.delete('/:uid', async (req, res) => {
	try {
		const user = await userModel.findOne({ where: { userUId: req.params.uid } })
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' })
		}

		await user.destroy()
		return res.status(200).json({ message: 'Пользователь удалён' })
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Ошибка при удалении пользователя' })
	}
})

export default router


