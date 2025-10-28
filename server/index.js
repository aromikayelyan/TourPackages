import cors from 'cors'
import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import sequelize from './utils/db.js'
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
import packageRoute from './routes/packagesRoute.js'
import rateSystem from './routes/rateSystem.js'
 

// const upload = multer({ dest: 'uploads/' })

const whitelist = new Set([
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://192.168.0.104:5500'
])


const PORT = process.env.PORT || 4400

const app = express()

app.use('/uploads', (req, res, next) => {
	res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
	next();
}, express.static(path.join(__dirname, 'uploads')))

app.use(cors({
	origin: '*', // временно разрешим всем (для теста)
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
	allowedHeaders: ['Content-Type', 'Authorization'],
}))


app.use(express.json())
app.use('/packages', packageRoute)
app.use('/rating', rateSystem)

app.use(express.urlencoded({ extended: true }))






// app.use('/uploads', express.static(path.join(__dirname, 'uploads')))             --------------do not work------------- 


  
async function start() {
	try {
		await sequelize.sync()
		app.listen(PORT, () => {
			console.log(`server run on port ${PORT}`)
		})
	} catch (e) {
		console.log(e)
	}
}

start()
