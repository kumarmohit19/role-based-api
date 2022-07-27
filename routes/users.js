const router = require('express').Router()
// Bring in the user registration function 
const { userRegister, userLogin, userAuth, serializeUser, checkRole } = require('../utils/Auth')

// User Registration Route
router.post('/register-user', async (req, res) => {
    await userRegister(req.body, 'user', res)
})

// Admin Registration Route
router.post('/register-admin', async (req, res) => {
    await userRegister(req.body, 'admin', res)
})

// Super Admin Registration Route
router.post('/register-super-admin', async (req, res) => {
    await userRegister(req.body, 'superadmin', res)
})

// User Authentication Route
router.post('/login-user', async (req, res) => {
    await userLogin(req.body, 'user', res)
})

// Admin Authentication Route
router.post('/login-admin', async (req, res) => {
    await userLogin(req.body, 'admin', res)
})

// Super Admin Authentication Route
router.post('/login-super-admin', async (req, res) => {
    await userLogin(req.body, 'superadmin', res)
})

// Profile Route 
router.get('/profile', userAuth, async (req, res) => {
    return res.json(serializeUser(req.user))
})

// User Protected Route
router.get('/user-protected', userAuth, checkRole(['user']), async (req, res) => {
    res.json('Hello')
})

// Admin Protected Route
router.get('/admin-protected', userAuth, checkRole(['admin']), async (req, res) => {
    res.json('Hello')
})

// Super Admin Protected Route
router.get('/super-admin-protected', userAuth, checkRole(['superadmin']), async (req, res) => {
    res.json('Hello')
})

// Super Admin and Admin Protected Route
router.get('/admin-and-super-admin-protected', userAuth, checkRole(['superadmin', 'admin']), async (req, res) => {
    res.json('Hello')
})

module.exports = router;