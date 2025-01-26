const express = require('express');
const app = express();

const cors = require('cors');
const corsOptions = { origin: ['http://localhost:5173'], }

app.use(cors(corsOptions));

app.get('/api', (req, res) => {
    res.status(200).json({ "team": ['Joel', 'Sai', 'Harshitha', 'Manisha'] })
})


app.listen(8080, () => {
    console.log('SERVER UP AND RUNNING IN 8080')
})