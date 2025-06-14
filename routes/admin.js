const express = require('express')
const router = express.Router()
const Admin = require('../models/Admin')
const Student = require('../models/Student')
const { validateToken } = require('../services/authentication')
const { verifyRole } = require('../middlewares/auth')
const { sendMail } = require('../services/mail')
const { registerStudent, searchStudent, deleteStudent, studentImageUpload,
    submit_ataglance, submitDcaResult, updateReg, studentInfoUpdate,
    submit_activities,
 } = require('../controllers/adminController')
const { log } = require('console')
const { verify } = require('crypto')


// Admin Control Panel
router.get('/dashboard',verifyRole('Admin'), (req, res) => {
    res.render('adminControllPanel', { Admin: req.User })
});


router.get('/login', (req, res) => {
    const tokenValue = req.cookies['token'];
    try {
        const adminPayload = validateToken(tokenValue)
        if(adminPayload.role === 'Admin'){
            req.Admin = adminPayload
            return res.redirect('/admin/dashboard')
        }
    } catch (error) {}
    return res.render('adminLogin');
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body

    try {
        const { token, name } = await Admin.checkPasswordandCreateToken(email, password)
        return res.cookie("token", token).redirect('/admin/dashboard') // Redirect to /admin/dashboard
    } catch (err) {
        let error = 'An unexpected error occurred'
        if (err.message === 'Admin not found') {
            error = 'Incorrect Admin ID'
        } else if (err.message === 'Incorrect password') {
            error = 'Incorrect Password'
        }
        console.error('Login error:', err)
        return res.render('adminLogin', { error })
    }
})

router.get('/logout', (req, res) => {
    res.clearCookie('token').redirect('/')
})

// ------------------------
// Password Change Route:

router.get('/changePassword', verifyRole('Admin'),(req, res) => {
    console.log(req.User);
    
    res.render('adminPasswordChange', { Admin: req.User })
})


router.post('/changePassword', verifyRole('Admin'), async (req, res) => {
    const { oldPassword, newPassword } = req.body;

    if (!req.User) {
        return res.redirect('/admin/login'); // Redirect to login if not authenticated
    }

    try {
        // Fetch the admin's current record using their email from the token
        const admin = await Admin.findOne({ email: req.User.email });
        if (!admin) {
            return res.status(404).send('Admin not found');
        }

        // Verify the old password
        const userPasswordHash = require('crypto') // hashing the old password
            .createHmac('sha256', admin.salt)
            .update(oldPassword)
            .digest('hex');

        if (admin.password !== userPasswordHash) {
            return res.status(400).send('Incorrect old password');
        }

        // Update the password (set the new password, `pre('save')` will handle hashing)
        admin.password = newPassword; // Fixed typo

        await admin.save(); // Triggers the pre-save middleware
        res.clearCookie('token').send('Password changed successfully, <a href="/">Login</a>');

        const sub = 'Password Updated Successfully';
        const message = `
Dear ${admin.name},  

Your password has been successfully updated on the Computronics Web Portal.  

Here are your updated login credentials:  
ID: ${admin.email}  
New Password: ${newPassword}

Please keep this information confidential.  

Thank You,  
Computronics  
`;
        sendMail(admin.email, sub, message);
    } catch (err) {
        console.error('Error changing password:', err);
        res.status(500).send('An error occurred while changing the password');
    }
});



// ------------------------------------------------------

// Student Registering Route: 
router.get('/registerStudent', verifyRole('Admin'),(req, res)=>{
    res.render('registerStudent', { Admin: req.User })
})

router.post('/registerStudent', registerStudent)

// Student login Details Update:
router.get('/searchStudent',verifyRole('Admin'),(req, res)=>{
    return res.render('studentLoginEdit', { Admin: req.User })
})

// Student Information Update:
router.get('/student_info_update',verifyRole('Admin'),(req, res)=>{
    return res.render('student_info_update', { Admin: req.User })
})

router.post('/student_info_update', verifyRole('Admin'), studentInfoUpdate)

// for searhcing student
router.post('/searchStudent', verifyRole('Admin'), searchStudent)

// for student image upload:
router.get('/imageUpload', verifyRole('Admin'), (req, res)=>{
    return res.render('imageUpload', { Admin: req.User })
})
// post route for student image upload:
router.post('/submit', verifyRole('Admin'), studentImageUpload)

// Student delete route
router.get('/admin/deleteStudent/:id', (req, res)=>{
    console.log(req.params.id);
});

// Student Registration and Roll Number Update:
router.get('/updateRegistrationandRoll', verifyRole('Admin'), (req, res)=>{
    return res.render('RegUpdate', { Admin: req.User })
})

router.post('/updateRegistrationandRoll', verifyRole('Admin'), updateReg)

// ------------------------------------------------------------

// Student at a glance update route:
router.get('/at_a_glance_update', verifyRole('Admin'), (req, res)=>{
    return res.render('at_a_glance_update', { Admin: req.User })
})

router.post('/at_a_glance_update', verifyRole('Admin'), submit_ataglance)

// student Activities and academics and Other details update:
router.get('/other_activities_update', verifyRole('Admin'), (req, res)=>{
    return res.render('other_activities_update', {Admin: req.User})
})
// activities update POST route :
router.post('/other_activities_update', verifyRole('Admin'), submit_activities)

// DCA result Update 
router.get('/dca_result_search', verifyRole('Admin'), (req, res)=>{
    res.render('dcaResultSearch', { Admin: req.User })
})

router.post('/dca_result_search', verifyRole('Admin'), async(req, res)=>{
    const {id} = req.body
    try {
        const student = await Student.findOne({ studentID: id })

            const studentData = {
                studentID : student.studentID,
                name : student.name,
                email : student.email
            }
            res.render('dcaResultSearch', { Admin: req.User, studentData })
        
    } catch (error) {   
        res.render('dcaResultSearch', { Admin: req.User })
    }
})

router.get('/dca_result_update', verifyRole('Admin'), (req, res) => {
    const { studentID, name, email } = req.query  // Send the extracted ID as a response
    const student = {
        id : studentID,
        name : name,
        email : email
    }
    res.render('dca_result_update', { Admin: req.User, student: student})
})
// for update student result:
router.post('/dca_result_update', verifyRole('Admin'), submitDcaResult)





module.exports = router
