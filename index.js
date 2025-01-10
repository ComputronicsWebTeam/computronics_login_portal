const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const path = require('path')
const cookieParser = require('cookie-parser')
const adminRouter = require('./routes/admin')
const studentRouter = require('./routes/student')


const app = express()   

const PORT = process.env.PORT || 3000

// Middlewares and Important Variables:
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
app.use(express.static('public'));
app.use('/public', express.static(path.join(__dirname, 'public')));


app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views')); // Set views folder



// Making Connection to MongoDB:
mongoose.connect(process.env.MONGO_URI).then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Error connecting to MongoDB:', err));


// Routes:
app.get('/',(req, res)=>{   // Home route
    res.render('home')
})

app.use('/student', studentRouter)

app.use('/admin', adminRouter)  // for admin Register and Login






app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
