const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { success, error } = require('consola')
const passport = require('passport')

const { SECRET } = require('../config')

/**
 * @DESC To register user (ADMIN, SUPERADMIN, USER)
 */
const userRegister = async (userData, role, res) => {
    try {
        // Validate the username
        let usernameNotTaken = await validateUsername(userData.username)
        if(!usernameNotTaken){
            return res.status(400).json({
                message: 'Username is already taken.',
                succes: false
            })
        }

        // Validate the email
        let emailNotRegistered = await validateEmail(userData.email)
        if(!emailNotRegistered){
            return res.status(400).json({
                message: 'Email is already registered.',
                succes: false
            })
        }

        // Get the hashes password
        const password = await bcrypt.hash(userData.password, 12);

        // Create a new user
        const newUser = new User({
            ...userData,
            password,
            role
        });

        await newUser.save();

        return res.status(201).json({
            message:'Hurray! now you are succesfully registered. Please now login.',
            succes: true
        })
    } catch (err) {
        // Implement logger function (winston)
        error({ 
            message: `Unable to create your account \n${err.message}`, 
            badge: true
        })

        return res.status(500).json({
            message: 'Unable to create your account',
            succes: false
        })
    }

}

const validateUsername = async username => {
    let user = await User.findOne({ username });
    return user ? false : true;
}

const validateEmail = async email => {
    let user = await User.findOne({ email });
    return user ? false : true;
}

/**
 * @DESC To login user (ADMIN, SUPERADMIN, USER)
 */
const userLogin = async (userCreds, role, res) => {
    let { username, password } = userCreds;
    // First check if the username is in the database
    const user = await User.findOne({ username });
    if(!user) {
        return res.status(404).json({
            message: 'Username is not found. Invalid login credentials.',
            succes: false
        })
    }

    // We will check the role
    if(user.role !== role) {
        return res.status(403).json({
            message: 'Please make sure you are logging in from the right portal.',
            succes: false
        })
    }

    // Thst means the user is existing and trying to signin from the right portal
    // Now check for the password
    let isMatch = await bcrypt.compare(password, user.password);

    if(isMatch) {
       // Sign in the token and iss it to the user
        let token = jwt.sign(
            { 
                user_id: user._id, 
                role: user.role, 
                username: user.username
            }, 
            SECRET, 
            { expiresIn: "7 days"}
        )

        let result = {
            username: user.username,
            role: user.role,
            email: user.email,
            token: `Bearer ${token}`,
            expiresIn: 168
        }

        return res.status(200).json({
            ...result,
            message: "Hurray! You are now logged in.",
            success: true
        });
    } else {
        return res.status(403).json({
            message: 'Incorrect password.',
            success: false
        }); 
    }
}

/**
 * @DESC Passport middleware
 */
const userAuth = passport.authenticate("jwt", { session: false });


/**
 * @DESC Check Role middleware
 */
const checkRole = roles => (req, res, next)  => 
    !roles.includes(req.user.role)
        ? res.status(401).json('Unauthorized.')
        : next();


const serializeUser = user => {
    return {
        username: user.username,
        email: user.email,
        name: user.name,
        _id: user._id,
        updatedAt: user.updatedAt,
        createdAt: user.createdAt,

    }
}

module.exports = {
    userRegister,
    userLogin,
    userAuth,
    serializeUser,
    checkRole
}