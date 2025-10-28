import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import tourModel from '../models/tourPackage.js'
import { v4 as uuidv4 } from 'uuid'
import { deleteImages } from '../utils/utilsFunctions.js'
import rate from '../models/rate.js'
import { where } from 'sequelize'


const router = Router()


var storage = multer.diskStorage({
	destination: function (req, file, cb) {
		cb(null, 'uploads/')
	},
	filename: function (req, file, cb) {
		cb(null, Date.now() + path.extname(file.originalname))
	},
})

const upload = multer({ storage })

router.get('/:id', async (req, res) => {
	try {
		const response = await tourModel.findOne({ where: { uid: req.params.id } })
		if (!response) {
			return res.status(404).json({ message: 'Tour not found' })
		}
		const comments = await rate.findAll({where:{packageId:req.params.id}})
		const images = JSON.parse(response.images).map(
			image => `${req.protocol}://${req.get('host')}/uploads/${image}`
		)
		response.dataValues.images = images

		res.status(200).json([response.dataValues, comments])
	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error, try again' })
	}
})

router.get('/', async (req, res) => {
	try {
		const packages = await tourModel.findAll()

		const packs = packages.map(pack => {
			const images = JSON.parse(pack.dataValues.images).map(
				image => `${req.protocol}://${req.get('host')}/uploads/${image}`
			)
			pack.dataValues.images = images
			return pack.dataValues
		})

		return res.status(200).json(packs)

	} catch (e) {
		console.error(e)
		res.status(500).json({ message: 'Error, try again' })
	}
})

router.post('/', upload.array('images', 3), async (req, res) => {
	try {

		const images = req.files.map(file => file.filename)

		const tourPackage = await tourModel.create({
			uid: uuidv4(),
			name: req.body.name,
			price: req.body.price,
			description: req.body.description,
			availableSeats: req.body.availableSeats,
			duration: req.body.duration,
			forSlide: req.body.forSlide,
			images: JSON.stringify(images),
			startDate: req.body.startDate,
			endDate: req.body.endDate
		})

		res.status(201).json({ message: 'Package added successfully', tourPackage })


	} catch (error) {
		console.error('Error adding Tour:', error)
		res.status(500).json({ error: 'Error adding Tour' })
	}
})

router.delete('/:id', async (req, res) => {
	try {
		const tour = await tourModel.findAll({ where: { uid: req.params.id } })

		await Promise.all(JSON.parse(tour[0].images).map(async (name) => {
			try {
				await deleteImages(name)
			} catch (error) {
				console.log('no such')
			}
		}))

		await tour[0].destroy()

		res.status(200).json({ message: 'Удалено' })
	} catch (e) {
		console.log(e)
		res.status(404).json({ message: 'не найдено такого тура' })
	}
})


router.put('/:id',  upload.array('images', 3), async (req, res) => {
	try {
		
	} catch (e) {
		console.log(e)
		res.status(400).json({ message: 'error' })
	}
})

export default router




// router.put('/:id',  upload.array('images', 3), async (req, res) => {
// 	try {
		
// 		const product = await prodmodel.findOne({ where: { uid: req.params.id } })
	
// 		if (!product) {
// 			return res.status(404).json({ message: 'Product not found' });
// 		}
// 		if (req.body.deletedImg && typeof req.body.deletedImg == 'string') {
// 			const name = req.body.deletedImg.slice(29)
// 			await deleteImages(name)
// 		}
// 		if (Array.isArray(req.body.deletedImg)) {
// 			req.body.deletedImg.forEach(async (element) => {
// 				const name = element.slice(29)
// 				await deleteImages(name)
// 			});
// 		}
// 		let newImages = []
// 		if (req.body.images) {
// 			const bodyImages =
// 				typeof req.body.images === 'string'
// 					? [req.body.images]
// 					: [...req.body.images]

// 			newImages = bodyImages.map(image => {
// 				// const imagess = bodyImages.map(image => path.basename(image))
// 				// return image.slice(30, image.length)
// 				return image.split('/').pop()
// 			})
// 		}
// 		if (req.files) {
// 			Promise.all(req.files.map(file => newImages.push(file.filename)))
// 			product.images = JSON.stringify(newImages)
// 		}
		

// 		product.name = req.body.name
// 		product.price = req.body.price
// 		product.description = req.body.description
// 		product.count = req.body.count
// 		product.sizes = req.body.sizes
// 		product.colorus = req.body.colorus
// 		product.weight = req.body.weight
// 		product.material = req.body.material
// 		product.categoryname = req.body.categoryname
// 		product.forSlide = req.body.forSlide

// 		await product.save()

// 		res.status(200).json({ message: 'Изменено' })
// 	} catch (e) {
// 		console.log(e)
// 		res.status(400).json({ message: 'error' })
// 	}
// })

// export default router
