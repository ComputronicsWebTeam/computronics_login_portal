const Student = require('../models/Student')
const StudentImage = require('../models/studentImage')
const multer = require('multer');
const { sendMail } = require('../services/mail')


// Multer Configuration for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('studentPhoto');

// New Student Register Controller Function:
async function registerStudent(req, res) {
    const { studentID, name, email, password } = req.body

    try {
        const existingStudent = await Student.findOne({ studentID })  // checking the Student is already registered or not
        if (existingStudent) {
            return res.status(400).send(`Name: ${name}, StudentID: ${studentID} is already registered`)
        }
        const reservedEmail = await Student.findOne({ email })    // checking the email is already registered or not
        if (reservedEmail) {
            return res.status(400).send(`Email ID: ${email} is already registered`)
        }

        await Student.create({ studentID, name, email, password })
        res.send('Student Registered successfully. Go to <a href="/admin/dashboard">Dashboard</a>')

        // sending email after successfull registration:
        const sub = 'Welcome to Computronics Web Portal'
        const message =
            `Dear ${name},

Congratulations on successfully registering on the Computronics Web Portal.

Here are your login credentials:
ID: ${studentID}
Password: ${password}

Please keep this information confidential.

Thank You,
Computronics`

        sendMail(email, sub, message)

    } catch (error) {
        console.error('Error during registration:', err)
        res.status(500).send('An error occurred during registration')
    }

}


// Student search function :

const searchStudent = async (req, res) => {
    try {
        const { studentId } = req.body; // Extract studentId from the request body
        const student = await Student.findOne({ studentID: studentId }); // Use studentID instead of studentId

        if(!student){
            return res.render('studentLoginEdit', {message: 'Student not found'})
        }
        return res.render('studentLoginEdit',{Student: student})
        
    } catch (error) {
        console.error('Error searching for student:', error);
        res.status(500).json({
            success: false,
            message: 'An error occurred while searching for the student'
        });
    }
}

// student Image upload function:
async function studentImageUpload(req, res) {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).send("Error uploading file.");
        }

        const newStudentImage = new StudentImage({
            studentId: req.body.studentId,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            }
        });

        try {
            await newStudentImage.save();
            res.send("File uploaded successfully!");
        } catch (error) {
            res.status(500).send("Error saving to database.");
        }
    })
}


// Student delete function:
async function deleteStudent(req, res) {
    try {
        const studentID = req.query.id; 
        if (!studentID) {
            return res.status(400).json({ error: 'Student ID is required' });
        }
        console.log('Deleting student with ID:', studentID);
        
        // Remove the student from the database based on the studentID field
        const result = await Student.findOneAndDelete({ studentID });

        if (!result) {
            return res.status(404).json({ error: 'Student not found' });
        }

        res.status(200).json({ message: 'Student deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to delete student' });
    }
}


module.exports = { registerStudent, searchStudent, deleteStudent, studentImageUpload}
