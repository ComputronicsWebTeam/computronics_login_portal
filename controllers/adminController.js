const Student = require('../models/Student')
const Student_Info = require('../models/student_info')
const StudentImage = require('../models/studentImage')
const At_a_glance = require('../models/At_a_glance')
const dcaResult = require('../models/DCA_result')
const Reg_and_Roll = require('../models/Registration')
const multer = require('multer')
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

// Student Information Update:
async function studentInfoUpdate(req, res) {
    try {
        const student = new Student_Info(req.body);
        await student.save();
        res.send('Student information saved successfully!');
    } catch (error) {
        res.status(400).send('Error saving student info: ' + error.message);
    }

}


// Student search function :
const searchStudent = async (req, res) => {
    try {
        const { studentId } = req.body; // Extract studentId from the request body
        const student = await Student.findOne({ studentID: studentId }); // Use studentID instead of studentId

        if (!student) {
            return res.render('studentLoginEdit', { message: 'Student not found' })
        }
        return res.render('studentLoginEdit', { Student: student })

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

// for Registration and roll Number Update:
async function updateReg(req, res) {
    const { studentID, Reg_No, Roll_No } = req.body;
    try {
        const Preloded = await Reg_and_Roll.findOne({ studentID }); // Fixed syntax
        if (!Preloded) {
            await Reg_and_Roll.create({ studentID, Reg_No, Roll_No });
        }
        res.status(200).send('Record Updated or Created Successfully.');
    } catch (error) {
        res.status(500).send('Something went wrong');
    }
}

// For at a Glance Update:
async function submit_ataglance(req, res) {
  try {
    const { studentId, items } = req.body;

    const sanitizedItems = items.map(item => ({
      Course: item.Course,
      Marks: Number(item.Marks)
    }));

    await At_a_glance.findOneAndUpdate(
      { studentID: studentId },            // Filter
      { items: sanitizedItems },           // Update
      { upsert: true, new: true }          // Create if not exists, return updated doc
    );

    return res.status(201).render('submit_successfull', {messege: "Submitted Successfully!"});
    
  } catch (error) {
    return res.status(500).render('Error_message', {message: "Internal Server Error"});
  }
}


//  for results and other links:
async function submitDcaResult(req, res) {
    try {
        const {
            studentID,
            it_tools, web_design,
            c_programing, dbms, xml_php,
            python, cyber_security, management,
            javascript,

            it_tools_prac, web_design_prac,
            c_programing_prac, dbms_prac, xml_php_prac,
            python_prac,
            javascript_prac, project, project_presentation,

            total, percentage, ogpa,
        } = req.body;

        // Check if a result already exists for the given studentID
        let result = await dcaResult.findOne({ studentID });

        if (result) {
            // Update existing result
            result.it_tools = it_tools;
            result.web_design = web_design;
            result.c_programing = c_programing;
            result.dbms = dbms;
            result.xml_php = xml_php;
            result.python = python;
            result.cyber_security = cyber_security;
            result.management = management;
            result.javascript = javascript;

            result.it_tools_prac = it_tools_prac;
            result.web_design_prac = web_design_prac;
            result.c_programing_prac = c_programing_prac;
            result.dbms_prac = dbms_prac;
            result.xml_php_prac = xml_php_prac;
            result.python_prac = python_prac;
            result.javascript_prac = javascript_prac;
            result.project = project;
            result.project_presentation = project_presentation;

            result.total = total;
            result.percentage = percentage;
            result.ogpa = ogpa;

            await result.save(); // Save updated result
            res.status(200).send("Result Data Updated Successfully !");
        } else {
            // Insert new result
            const newResult = new dcaResult({
                studentID,
                it_tools, web_design,
                c_programing, dbms, xml_php,
                python, cyber_security, management,
                javascript,

                it_tools_prac, web_design_prac,
                c_programing_prac, dbms_prac, xml_php_prac,
                python_prac,
                javascript_prac, project, project_presentation,

                total, percentage, ogpa,
            });

            await newResult.save(); // Save new result
            res.status(200).send("Result Data Submitted Successfully !");
        }
    } catch (err) {
        res.status(500).send("An internal error occurred! Try again later.");
        console.log(err);

    }
}

module.exports = {
    registerStudent, searchStudent, deleteStudent,
    studentImageUpload, submitDcaResult, updateReg,
    studentInfoUpdate, submit_ataglance,
}
