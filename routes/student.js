const express = require('express')
const router = express.Router()
const {StudentLogin, StudentChangePassword} = require('../controllers/studentController')
const { verifyRole } = require('../middlewares/auth')
const { validateToken } = require('../services/authentication')

// Student Dashboard:
router.get('/dashboard', verifyRole('Student'),(req, res)=>{
    return res.render('studentDashboard', {Student: req.User})
})

// Student Login:
router.get('/login',(req, res)=>{
    const tokenValue = req.cookies['token'];
    try {
        const studentPayload = validateToken(tokenValue)
        if(studentPayload.role === 'Student'){
            req.Student = studentPayload
            return res.redirect('/student/dashboard')
        }
    } catch (error) {}
    return res.render('studentLogin')
})

router.post('/login', StudentLogin)

// Student Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/')
})

router.get('/changePassword', (req, res)=>{
    return res.render('studentPasswordChange')
})

router.post('/changePassword', verifyRole('Student'),StudentChangePassword)

module.exports = router