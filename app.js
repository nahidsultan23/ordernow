const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const http = require('http');
const https = require('https');

const db = require('./db/db');
const authRoute = require('./routes/authRoute');
const userRoute = require('./routes/userRoute');
const ownerRoute = require('./routes/ownerRoute');
const managerRoute = require('./routes/managerRoute');
const photoRoute = require('./routes/photoRoute');
const adminRoute = require('./routes/adminRoute');

const cronJobs = require('./cron_jobs/cron');

mongoose.connect(db.DB,{
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(
    () => {console.log('Database is connected')},
    err => {console.log('Can not connect to the database '+err)}
);

const app = express();
app.use(cors());

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,'build')));

app.post('/api/user-app-status',function(req,res) {
    var responseObject = {
        status: 'failure',
        maintenanceStatus: '',
        maintenanceMessage: '',
        appVersion: '',
        forceUpdate: '',
        language: '',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('./validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        res.json({
            status: 'success',
            maintenanceStatus: false,
            maintenanceMessage: 'Server is under maintenance',
            appVersion: '1.0.0',
            forceUpdate: false,
            language: 'en',
            message: {
                fatalError: ''
            }
        })
    });
});

app.post('/api/owner-app-status',function(req,res) {
    var responseObject = {
        status: 'failure',
        maintenanceStatus: '',
        maintenanceMessage: '',
        appVersion: '',
        forceUpdate: '',
        language: '',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('./validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        res.json({
            status: 'success',
            maintenanceStatus: false,
            maintenanceMessage: 'Server is under maintenance',
            appVersion: '1.0.0',
            forceUpdate: false,
            language: 'en',
            message: {
                fatalError: ''
            }
        })
    });
});

app.post('/api/manager-app-status',function(req,res) {
    var responseObject = {
        status: 'failure',
        maintenanceStatus: '',
        maintenanceMessage: '',
        appVersion: '',
        forceUpdateFrom: '',
        updateMessage: '',
        language: '',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('./validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        res.json({
            status: 'success',
            maintenanceStatus: false,
            maintenanceMessage: 'Server is under maintenance',
            appVersion: '1.0.0',
            forceUpdateFrom: '1.0.0',
            updateMessage: 'Please download the latest version of the app from http://ordernow.restaurant',
            language: 'en-us',
            message: {
                fatalError: ''
            }
        })
    });
});

app.use('/api/auth',authRoute);
app.use('/api/user',userRoute);
app.use('/api/owner',ownerRoute);
app.use('/api/manager',managerRoute);
app.use('/api/photo',photoRoute);
app.use('/api/admin',adminRoute);

app.get('*',function(req,res) {
    var responseObject = {
        status: 'failure',
        message: {
            fatalError: ''
        }
    }
    const checkSpam = require('./validation/spamFilter');
    checkSpam(req,res,responseObject,(req,res) => {
        res.sendFile(path.resolve(__dirname,'build','index.html'));
    });
});

http.createServer(function (req, res) {
    res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
    res.end();
}).listen(3000);

const PORT = 5000;

var options = {
    key: fs.readFileSync('./ssl/privatekey.pem'),
    cert: fs.readFileSync('./ssl/certificate.pem'),
};

https.createServer(options, app).listen(PORT, function(){
    console.log(`Secured server is running on PORT ${PORT}`);
});