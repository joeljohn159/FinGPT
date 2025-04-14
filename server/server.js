const express = require('express');
const app = express();
const authRoutes = require('./routes/authRoutes')
const financialRoutes = require('./routes/financialRoutes.js');
const feedbackRoutes = require('./routes/feedbackRoutes.js');
const financialGlossaryRoutes = require('./routes/financialGlossaryRoutes');
const newsRoutes = require('./routes/newsRoutes');



require('dotenv').config();
const cors = require('cors');

//below was commented
// const corsOptions = { origin: ['http://localhost:5173'], }
const connectDB = require('./config/db.js')
const PORT = process.env.PORT || 8080;



app.use(cors());
app.use(express.json())
connectDB()

app.use('/api/auth', authRoutes);
app.use('/api/financial', financialRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/financial-glossary', financialGlossaryRoutes);
app.use('/api', newsRoutes);

app.listen(8080, () => {
    console.log('SERVER UP AND RUNNING IN 8080')
})