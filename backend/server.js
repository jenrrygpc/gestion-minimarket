const path = require('path');
const express = require('express');
const colors = require('colors');
const dotenv = require('dotenv').config();
const { errorHandler } = require('./middleware/errorMiddleware');
const connectDB = require('./config/db');
const PORT = process.env.PORT || 5000;

//Connect to database
connectDB();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));



//Routes
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/products/', require('./routes/productRoutes'));
app.use('/api/measures/', require('./routes/measureRoutes'));

// Server Frontend
console.log('antes de servir');
if (process.env.NODE_ENV === 'production') {
    // Set build folder as static
    app.use(express.static(path.join(__dirname, '../frontend/build')))
    console.log('antes de get');

    app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../frontend/build/index.html')))
    console.log('despues de get');
} else {
    app.get('/', (req, res) => {
        res.status(201).json({
            message: 'Welcome to the Support Desk API'
        })
    });
}

app.use(errorHandler);

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));


