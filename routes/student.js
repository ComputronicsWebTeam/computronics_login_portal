const express = require('express')
const router = express.Router()
const {StudentLogin, StudentChangePassword, P_info,
    Student_result, Student_ataglance, activities_render,
} = require('../controllers/studentController')
const { verifyRole } = require('../middlewares/auth')
const { validateToken } = require('../services/authentication')
const StudentImage = require('../models/studentImage')
const Student = require('../models/Student')

// Student Dashboard:
router.get('/dashboard', verifyRole('Student'), async(req, res)=>{
    // getting the student profile image:
    const studentImage = await StudentImage.findOne({ studentId: req.User.id });
    let imageSrc = null;  // Default to null if no image is found
    if (studentImage) {
        // Convert the buffer to base64 encoding to make the image data renderable
        const imageData = studentImage.image.data.toString('base64');
        imageSrc = `data:${studentImage.image.contentType};base64,${imageData}`;
    } else {
        console.log('No profile image found for student.');
    }

    // Rendering the student dashboard
    return res.render('studentDashboard', {Student: req.User, imageSrc})
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

// Route to render student Personal Information:
router.get('/p_info', verifyRole('Student'), P_info);

// Route to render Details Page:
router.get('/activities', verifyRole('Student'), activities_render)

// Route to render At a Glance;
router.get('/at_a_glance', verifyRole('Student'), Student_ataglance)

// Route to render Result Details:
router.get('/student_result', verifyRole('Student'), Student_result);

// Student Logout
router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/')
})

router.get('/changePassword', (req, res)=>{
    return res.render('studentPasswordChange')
})

router.post('/changePassword', verifyRole('Student'),StudentChangePassword)

module.exports = router