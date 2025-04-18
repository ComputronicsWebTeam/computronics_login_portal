const mongoose = require('mongoose');

const dcaResultSchema = new mongoose.Schema(
    {
        studentID: { type: String, required: true, unique: true },

        // Theory
        it_tools: {type: Number}, // IT Tools
        web_design: {type: Number}, // Web Desiging
        c_programing: {type: Number}, // C Programing
        dbms: {type: Number}, // DBMS
        xml_php: {type: Number}, // XML & PHP
        python: {type: Number}, // Python
        cyber_security: {type: Number}, // Cyber Security 
        management: {type: Number}, // Management
        javascript: {type: Number}, // Javascript

        // Practical 
        it_tools_prac: {type: Number}, // It tools 
        web_design_prac: {type: Number}, // Web Design
        c_programing_prac: {type: Number}, // C Programing
        dbms_prac: {type: Number}, // DBMS
        xml_php_prac: {type: Number}, // XML & PHP
        python_prac: {type: Number}, // Python
        project_p1: {type: Number}, // Project Part 1
        javascript_prac: {type: Number}, // Javascript
        project_p2: {type: Number}, // Project Part 2
        project_presentation: {type: Number}, // Project Presentation 
    },
    { timestamps: true } // This ensures createdAt and updatedAt are automatically added
);

const DCAresult = mongoose.model('DCAresult', dcaResultSchema);

module.exports = DCAresult;
