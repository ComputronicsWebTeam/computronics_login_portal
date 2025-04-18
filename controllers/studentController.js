const mongoose = require('mongoose')
const moment = require('moment')
const Student = require('../models/Student')
const DCA_Result = require('../models/DCA_result')
const student_info = require('../models/student_info')
const StudentImage = require('../models/studentImage')
const RegandRoll = require('../models/Registration')
const { sendMail } = require('../services/mail')

async function StudentLogin(req, res) {
    const { studentID, password } = req.body

    try {
        const { token, name } = await Student.checkPasswordandCreateToken(studentID, password)
        return res.cookie("token", token).redirect('/student/dashboard') // Redirect to /admin/dashboard
    } catch (err) {
        let error = 'An unexpected error occurred'
        if (err.message === 'Student not found') {
            error = 'Incorrect Student ID'
        } else if (err.message === 'Incorrect password') {
            error = 'Incorrect Password'
        }
        console.error('Login error:', err)
        return res.render('StudentLogin', { error })
    }
}

async function P_info(req, res) {
    try {
        const student_id = req.User.id;  // Getting the student id from the request parameter
        const s_info = await student_info.findOne({ studentID: student_id });

        if (!s_info) {
            return res.status(404).send('Student information not found');
        }

        // getting the student profile image:
        const studentImage = await StudentImage.findOne({ studentId: student_id });

        let imageSrc = null;  // Default to null if no image is found

        if (studentImage) {
            // Convert the buffer to base64 encoding to make the image data renderable
            const imageData = studentImage.image.data.toString('base64');
            imageSrc = `data:${studentImage.image.contentType};base64,${imageData}`;
        } else {
            console.log('No profile image found for student.');
        }

        res.render('personal_info', { s_info, imageSrc });
    } catch (err) {
        console.error('Error fetching student information:', err); // Log the error for debugging
        res.status(500).send('Internal Server Error. Please try again later.');
    }
}

// This is the controller function to fetch and render student result details:
async function Student_result(req, res){
    try {
        const Student = req.User; // Getting the Student Object from the req params
        const student_id = Student.id;
        // getting the student profile image:
        const studentImage = await StudentImage.findOne({ studentId: student_id });
        let imageSrc = null;  // Default to null if no image is found
        if (studentImage) {
            // Convert the buffer to base64 encoding to make the image data renderable
            const imageData = studentImage.image.data.toString('base64');
            imageSrc = `data:${studentImage.image.contentType};base64,${imageData}`;
        } else {
            console.log('No profile image found for student.');
        }
        // Getting Student Info.
        const s_info = await student_info.findOne({ studentID: student_id })
        // Getting the Student Registration and Roll Number:
        const RegRoll = await RegandRoll.findOne({studentID: student_id})
        // Getting the Student Result
        const Result = await DCA_Result.findOne({ studentID: student_id })
        // calculating the overall grade point:
        const sem_1 = ((Result.it_tools + Result.web_design)/200*100)
        const sem_2 = ((Result.c_programing + Result.dbms + Result.xml_php)/300*100)
        const sem_3 = ((Result.python + Result.cyber_security + Result.management)/300*100)
        const sem_4 = ((Result.javascript + Result.project_p1 + Result.project_p2)/300*100)

        const sgpa_1 = (sem_1 + 7.5)/100
        const sgpa_2 = (sem_2 + 7.5)/100
        const sgpa_3 = (sem_3 + 7.5)/100
        const sgpa_4 = (sem_4 + 7.5)/100
        const OGPA = (sgpa_1, sgpa_2, sgpa_3, sgpa_4)/4
        Result.OGPA = OGPA

        // Rendering the Output Page:
        res.render('dca_result', {Student: req.User, imageSrc, s_info, RegRoll, Result});
        
    } catch (error) {
        console.log(error);
        res.render('dca_result', {Student: req.User})
    }
}


async function StudentChangePassword(req, res) {
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
        console.error('Error changing password:', err);
        res.status(500).send('An error occurred while changing the password');
    }

}

module.exports = { StudentLogin, StudentChangePassword, P_info,
    Student_result,
 }