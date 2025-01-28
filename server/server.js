const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes')


const cors = require('cors');
const corsOptions = { origin: ['http://localhost:5173'], }
const connectDB = require('./config/db')
const PORT = process.env.PORT || 8080;

require('dotenv').config() // LOAD ENV

app.use(cors(corsOptions));
app.use(express.json())
connectDB()

app.use('/api/auth', authRoutes)


app.listen(8080, () => {
    console.log('SERVER UP AND RUNNING IN 8080')
})