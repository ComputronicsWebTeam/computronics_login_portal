const express = require('express')
const router = express.Router()
const Admin = require('../models/Admin')
const { validateToken } = require('../services/authentication')
const { checkForAuth, verifyRole } = require('../middlewares/auth')
const { sendMail } = require('../services/mail')
const { registerStudent, searchStudent, deleteStudent, studentImageUpload,
    dcaResultUpdate
 } = require('../controllers/adminController')


// -------------------------------------------------------------------------------
// Only for offline USE not for Production

router.get('/register', (req, res) => {
    res.render('adminRegister')
})


router.post('/register', async (req, res) => {
    const { name, email, password } = req.body

    try {
        // Check if the email already exists
        const existingAdmin = await Admin.findOne({ email })
        if (existingAdmin) {
            return res.status(400).send(`This email : ${email} is already exist`)
        }

            await Admin.create({ name, email, password })
            res.send('Admin Registration Successfull')

        // Sending suceesfull email:
        const sub = 'Welcome to Computronics Web Portal | Admin Login Credential'
        const message = 
`Dear ${name},

Congratulations on successfully registering as an Admin on the Computronics Web Portal.

Here are your login credentials:
ID: ${email}
Password: ${password}

Please keep this information confidential.

Thank You,
Computronics`
        
        sendMail(email, sub, message)

    } catch (err) {
        console.error('Error during registration:', err)
        res.status(500).send('An error occurred during registration')
    }
})
//  not for production 
// ------------------------------------------------------------------------------------------


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



// ------------------------------------------------------------
// Result and Other Links:

router.get('/dca_result_update',(req, res)=>{
    res.render('dcaResult')
})

module.exports = router
