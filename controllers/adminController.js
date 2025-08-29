const Student = require('../models/Student')
const Student_Info = require('../models/student_info')
const StudentImage = require('../models/studentImage')
const At_a_glance = require('../models/At_a_glance')
const Activities = require('../models/Activities')
const dcaResult = require('../models/DCA_result')
const Reg_and_Roll = require('../models/Registration')
const NoticeImage = require('../models/NoticeImage')
const multer = require('multer')
const { sendMail } = require('../services/mail')


// Multer Configuration for File Uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).single('studentPhoto');  // for student profile
const noticeUpload = multer({ storage: storage }).single('image'); // for notice upload


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

// for students activities update:
async function submit_activities(req, res) {
  try {
    const {
      student_id,
      scholarship = [],
      award = [],
      position = [],
      psdp = [],
      seminar = [],
      training = [],
      others = []
    } = req.body;

    if (!student_id || student_id.trim() === "") {
      return res.status(400).send("student_id is required");
    }

    const makeArrayOfDesc = (arr) =>
      Array.isArray(arr)
        ? arr.filter(item => item && item.trim() !== '').map(item => ({ desc: item.trim() }))
        : [];

    // Get existing activity
    const existing = await Activities.findOne({ studentID: student_id });

    const activityData = {
      studentID: student_id,
      scholership: makeArrayOfDesc(scholarship),
      award_recived: makeArrayOfDesc(award),
      position_secured: makeArrayOfDesc(position),
      psdp: makeArrayOfDesc(psdp),
      seminar_workshop: makeArrayOfDesc(seminar),
      training: makeArrayOfDesc(training),
      others: makeArrayOfDesc(others),
    };

    // Merge: if new field is empty, use old data
    if (existing) {
      activityData.scholership = activityData.scholership.length > 0 ? activityData.scholership : existing.scholership;
      activityData.award_recived = activityData.award_recived.length > 0 ? activityData.award_recived : existing.award_recived;
      activityData.position_secured = activityData.position_secured.length > 0 ? activityData.position_secured : existing.position_secured;
      activityData.psdp = activityData.psdp.length > 0 ? activityData.psdp : existing.psdp;
      activityData.seminar_workshop = activityData.seminar_workshop.length > 0 ? activityData.seminar_workshop : existing.seminar_workshop;
      activityData.training = activityData.training.length > 0 ? activityData.training : existing.training;
      activityData.others = activityData.others.length > 0 ? activityData.others : existing.others;
    }

    // Update or create
    await Activities.findOneAndUpdate(
      { studentID: student_id },
      activityData,
      { upsert: true, new: true, runValidators: true }
    );

    return res.status(201).render('submit_successfull', {messege: "Data Updated Successfully!"});
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

// Controller Function for Notice Insert:
async function add_notice(req, res) {
    noticeUpload(req, res, async (err) => {
        if (err) {
            console.error("Multer error:", err);
            return res.status(400).send("Error uploading image.");
        }

        const { text: noticeHeading, noticeDescription: description } = req.body;

        // Basic validation (optional, but good practice)
        if (!noticeHeading || !description) {
            return res.status(400).render('Error_message', { message: "Heading and Description are required." });
        }

        try {
            const newNotice = new NoticeImage({
                noticeHeading,
                description
            });

            // Only set image if it exists
            if (req.file) {
                newNotice.image = {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                };
            }

            await newNotice.save();
            return res.status(201).render('submit_successfull', { messege: "Notice Uploaded Successfully!" });

        } catch (error) {
            console.error("Error saving notice:", error);
            return res.status(500).render('Error_message', { message: "Internal Server Error" });
        }
    });
}


// controller for the api to send Notice:
async function send_notice(req, res){
      try {
        const notices = await NoticeImage.find().sort({ createdAt: -1 });

        // Convert buffer image to base64 to send via JSON
        const formattedNotices = notices.map(notice => ({
            _id: notice._id,
            noticeHeading: notice.noticeHeading,
            description: notice.description,
            createdAt: notice.createdAt,
            updatedAt: notice.updatedAt,
            image: notice.image && notice.image.data 
                ? `data:${notice.image.contentType};base64,${notice.image.data.toString('base64')}` 
                : null
        }));

        res.json(formattedNotices);
    } catch (err) {
        console.error("Error fetching notices:", err);
        res.status(500).json({ error: "Internal server error" });
    }
}

module.exports = {
    registerStudent, searchStudent, deleteStudent,
    studentImageUpload, submitDcaResult, updateReg,
    studentInfoUpdate, submit_ataglance, submit_activities,
    add_notice, send_notice, 
}
