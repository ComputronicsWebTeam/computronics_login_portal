const Student = require('../models/Student')
const { sendMail } = require('../services/mail')

async function StudentLogin(req, res) {
    const {studentID, password} = req.body
    
    try {
        const {token, name} = await Student.checkPasswordandCreateToken(studentID, password)
        return res.cookie("token", token).redirect('/student/dashboard') // Redirect to /admin/dashboard
    } catch (err) {
        let error = 'An unexpected error occurred'
        if (err.message === 'Student not found') {
            error = 'Incorrect Student ID'
        } else if (err.message === 'Incorrect password') {
            error = 'Incorrect Password'
        }
        return res.render('StudentLogin', { error })
    }
}

async function StudentChangePassword(req, res){
    const { oldPassword, newPassword } = req.body;

    if (!req.User) {
        return res.redirect('/student/login') // Redirect to login if not authenticated
    }

    try {
        // Fetch the Student's current record using their studentID from the token
        const student = await Student.findOne({ studentID: req.User.id })
        if (!student) {
            return res.status(404).send('Student not found')
        }

        // Verify the old password
        const userPasswordHash = require('crypto') // hashing the old password
            .createHmac('sha256', student.salt)
            .update(oldPassword)
            .digest('hex')

        if (student.password !== userPasswordHash) {
            return res.status(400).send('Incorrect old password');
        }

        // Update the password (set the new password, `pre('save')` will handle hashing)
        student.password = newPassword; // Fixed typo

        await student.save(); // Triggers the pre-save middleware
        res.clearCookie('token').send('Password changed successfully, <a href="/">Login</a>');

        const sub = 'Password Updated Successfully';
        const message = `
Dear ${student.name},  

Your password has been successfully updated on the Computronics Web Portal.  

Here are your updated login credentials:  
ID: ${student.studentID}  
New Password: ${newPassword}

Please keep this information confidential.  

Thank You,  
Computronics  
`;
        sendMail(student.email, sub, message);
    } catch (err) {
        res.status(500).send('An error occurred while changing the password');
    }

}

module.exports = {StudentLogin, StudentChangePassword}