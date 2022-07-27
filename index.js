const cors = require('cors')
const express = require('express')
const bodyParser = require('body-parser')
const { connect } = require('mongoose')
const { success, error } = require('consola')
const passport = require('passport')

// Bring in the app constants
const { DB, PORT } = require('./config')

// Initialize the application
const app = express()

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(passport.initialize());

require('./middlewares/passport')(passport);

// Use router middlewares
app.use('/api/users', require('./routes/users'))

const startApp = async () => {
    try {
        // Connection with DB
        await connect(DB, { 
            // useFindAndModify: true, 
            useUnifiedTopology: true, 
            useNewUrlParser: true
        });

        success({ 
            message: `Successfully connected to the Database \n${DB}`, 
            badge: true
        })

        // Start listening for the server on PORT
        app.listen(PORT, () => {
            success({ message: `Server started on PORT ${PORT}`, badge: true})
        })

    } catch (err) {
        error({ 
            message: `Unable to connect to Database \n${err}`, 
            badge: true
        })

        startApp()
    }
};

startApp()


