const {createHmac, randomBytes} = require('crypto')
const mongoose = require('mongoose')
const validator = require('validator')
const {createTokenforAdmin} = require('../services/authentication')

const AdminScheema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        validate: {
            validator: validator.isEmail,
            message: 'Please provide a valid email address',
        }
    },
    salt:{
        type: String,
    },
    password: {
        type: String,
        required: true
    }
}, {timestamps: true}, {collection: 'Admins'})

//  A pre function to Hash the password before storing in the Database:
AdminScheema.pre("save", function (next){
    const user = this;
    if (!user.isModified('password')) return next(); // Fixed missing `next()` here
    
    const salt = randomBytes(16).toString('hex'); // Corrected salt generation
    const hashedPassword = createHmac('sha256', salt).update(user.password).digest('hex');

    this.salt = salt;
    this.password = hashedPassword;
    next();
})

AdminScheema.static('checkPasswordandCreateToken', async function(email, password) {
    const Admin = await this.findOne({ email });
    if (!Admin) {
        throw new Error('Admin not found');
    }

    const salt = Admin.salt;
    const hashedPassword = Admin.password;
    const userPasswordHash = createHmac('sha256', salt).update(password).digest('hex'); // converting user given password into hash 

    if (hashedPassword !== userPasswordHash) {
        throw new Error('Incorrect password');
    }
    
    const token = createTokenforAdmin(Admin);
    return { token, name: Admin.name };
});


const Admin = mongoose.model('Admin', AdminScheema)

module.exports = Admin

