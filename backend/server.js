const express = require('express');
const cors = require('cors');
require('dotenv').config();
const dashboardRoutes = require('./routes/dashboardRoutes');
const  path = require('path');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const masterlistRoutes = require('./routes/masterlistRoutes') 
const scheduleRoutes = require('./routes/scheduleRoutes')
const profileRoutes = require('./routes/profileRoutes')
const notificationRoutes = require('./routes/notificationRoutes');


const bhwDashboardRoutes = require('./routes/bhwDashboardRoutes');
const bhwScheduleRoutes = require('./routes/bhwScheduleRoutes');
const bhwNeedAttentionRoutes = require('./routes/bhwNeedAttentionRoutes');
const bhwReferralsRoutes = require('./routes/bhwReferralsRoutes');
const bhwMedicalRecordsRoutes = require('./routes/bhwMedicalRecordsRoutes');
const bhwNotificationRoutes = require('./routes/bhwNotificationRoutes');
const bhwProfileRoutes = require('./routes/bhwProfileRoutes');

const app = express();

// middleware to

app.use(cors());
app.use(express.json());

//sa routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/masterlist', masterlistRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/notifications', notificationRoutes);


app.use('/api/bhw', bhwDashboardRoutes);
app.use('/api/bhw/schedule' , bhwScheduleRoutes);
app.use('/api/bhw/need-attention', bhwNeedAttentionRoutes);
app.use('/api/bhw/referrals', bhwReferralsRoutes);
app.use('/api/bhw/medical-records', bhwMedicalRecordsRoutes);
app.use('/api/bhw/notification', bhwNotificationRoutes);
app.use('/api/bhw/profile', bhwProfileRoutes);

app.use('/uploads',express.static(path.join(__dirname, 'uploads')))
// check 
app.get('/', (req, res)=>{
    res.send('AppScale Backend API is running.');
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});