import { Router } from 'express'
import rateModel from '../models/rate.js'
import tourModel from '../models/tourPackage.js'
import { v4 as uuidv4 } from 'uuid'


const router = Router()




router.post('/:id', async (req, res) => {
    try {
        const tour = await tourModel.findOne({ where: { uid: req.params.id } })
        if (!tour) {
            return res.status(404).json({ message: 'Tour not found' })
        }
        if(req.body.rate <= 0 || req.body.rate > 5){
            return res.status(404).json({ message: 'Оценка не может быть меньше 0 и больше 5' })
        }

        const rating = await rateModel.create({
			packageId: tour.uid,
			userName: req.body.userName,
			comment: req.body.comment,
            rate: req.body.rate
		})

        return res.status(201).json({message:"отзыв оставлен"})

    } catch (error) {
        console.error('Error adding:', error)
        res.status(500).json({ error: 'Error adding' })
    }
})

router.get('/:id', async (req, res) => {
    try {

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Error, try again' })
    }
})

router.get('/', async (req, res) => {
    try {

    } catch (e) {
        console.error(e)
        res.status(500).json({ message: 'Error, try again' })
    }
})





export default router
