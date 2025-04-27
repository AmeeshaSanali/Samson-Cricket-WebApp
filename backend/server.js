const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRoutes =  require('./routes/userRoutes');
const batRoutes = require('./routes/batsRoutes');
const protectionRoutes = require('./routes/protectionRoutes');
const merchRoutes = require('./routes/merchRoutes');
const shoeRoutes = require('./routes/shoeRoutes');
const repairRoutes = require('./routes/repairRoutes');
const orderRoutes = require('./routes/orderRoutes');
const otpRoutes = require('./routes/otpRoutes');
const coachRoutes = require('./routes/coachRoutes');
const consultantRoutes = require('./routes/consultantRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

//db connection
const connectDB = require("./config/db");
connectDB();

const app = express();
app.use(bodyParser.json());

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", process.env.CLIENT_URL);
    res.setHeader("Access-Control-Allow-Methods", 'GET, POST, PUT, DELETE, PATCH');
    res.setHeader("Access-Control-Allow-Headers", 'Content-Type, Authorization');
    res.header("Access-Control-Allow-Credentials", true);
    next();
});
app.use(cors());
app.use('/uploads', express.static('uploads'));

app.use('/api/users', userRoutes);
app.use('/api/bats', batRoutes);
app.use('/api/protection', protectionRoutes);
app.use('/api/merch', merchRoutes);
app.use('/api/shoes', shoeRoutes);
app.use('/api/services', repairRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/auth', otpRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/consultants', consultantRoutes);
app.use('/api/feedback', feedbackRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 @ http://localhost:${PORT}`));
