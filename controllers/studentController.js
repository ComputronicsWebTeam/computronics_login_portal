const mongoose = require('mongoose')
const Student = require('../models/Student')
const course_completed = require('../models/At_a_glance')
const Activities = require('../models/Activities')
const DCA_Result = require('../models/DCA_result')
const student_info = require('../models/student_info')
const Student_RegRoll = require('../models/Registration')
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
        const Reg_Roll = await Student_RegRoll.findOne({studentID: student_id})
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

        return res.render('personal_info', { Student: req.User, s_info, imageSrc, Reg_Roll});
    } catch (err) {
        console.error('Error fetching student information:', err); // Log the error for debugging
        res.status(500).send('Internal Server Error. Please try again later.');
    }
}

// At a Glance Render Function:
async function Student_ataglance(req, res){
    try {
        const Student = req.User; // Getting the Student Object from the req params
        const student_id = Student.id;

        // Getting student basic info.:
        const s_info = await student_info.findOne({ studentID: student_id })
        // Getting course completed data:
        const c_completed = await course_completed.findOne({ studentID: student_id })

        return res.render('student_at_a_glance', {Student: req.User, s_info, c_completed}) // Rendering the output
    } catch (error) {
        console.log(error);
    }
}

async function activities_render(req, res){
    try {
        const Student = req.User; // Getting the Student Object from the req params
        const student_id = Student.id;

        // Getting student basic info.:
        const s_info = await student_info.findOne({ studentID: student_id })
        // Getting Activities data:
        const activities = await Activities.findOne({studentID: student_id})

        return res.render('activities', {Student: req.User, s_info, activities}) // Rendering the Output
    } catch (error) {

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
        // Rendering the Output Page:
        if(Result){
            res.render('dca_result', {Student: req.User, imageSrc, s_info, RegRoll, Result});
        }
        else{
            res.send(`
                <html>
                  <head>
                    <style>
                      body {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        background-color: #f8f8f8;
                      }
                      .message {
                        color: #ff4d4f;
                        font-size: 24px;
                        font-family: Arial, sans-serif;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="message">Your result has not yet been updated on the admin site.</div>
                  </body>
                </html>
              `);
              
        }
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
    Student_result, Student_ataglance, activities_render,
 }