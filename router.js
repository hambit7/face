const express = require('express');
const router = express.Router();
const fr = require('face-recognition');
const path = require('path');
const fs = require('fs');
const webcam = require( "node-webcam" );
const UserModel = require('./user.model');
const md5 = require('md5');

router.route('/').get(function (req, res) {
    res.render('index')
});

router.route('/success').get(function (req, res) {
    res.render('success')
});

router.route('/error').get(function (req, res) {
    res.render('error')
});

router.route('/login').post(function (req, res) {
    UserModel.findOne({ username: req.body.username, password: md5(req.body.password) }, function (err, user) {
        console.log(md5(req.body.password));
        if (!user || err) {
            return res.redirect(301, '/error');
        } else {
            var opts = {
                width: 1280,
                height: 720,
                quality: 100,
                delay: 0,
                saveShots: true,
                output: "jpeg",
                device: false,
                callbackReturn: "location",
                verbose: false,
                skip: 10
            };

            setTimeout(() => {
                webcam.capture( "./images/user.jpg", opts, function( err, data ) {
                    const image = fr.loadImage('./images/user.jpg');

                    const detector = fr.FaceDetector();
                    const faceImages = detector.detectFaces(image);
                    faceImages.forEach((img, i) => fr.saveImage(`./faces/detected.png`, img));

                    const dataPath = path.resolve('./faces');
                    UserModel.find({}, function(err, users) {
                        const classNames = users.map(user => {return user.username});

                        const allFiles = fs.readdirSync(dataPath);
                        const imagesByClass = classNames.map(c =>
                            allFiles
                                .filter(f => f.includes(c))
                                .map(f => path.join(dataPath, f))
                                .map(fp => fr.loadImage(fp))
                        );

                        const numTrainingFaces = 5;
                        const trainDataByClass = imagesByClass.map(imgs => imgs.slice(0, numTrainingFaces));

                        const recognizer = fr.FaceRecognizer();

                        trainDataByClass.forEach((faces, label) => {
                            const name = classNames[label];
                            recognizer.addFaces(faces.filter(face => face), name)
                        });

                        const modelState = recognizer.serialize();
                        recognizer.load(modelState);

                        const recognizedUser = recognizer.predictBest(fr.loadImage('./faces/detected.png'));

                        if (recognizedUser.className === user.username) {
                            console.log(user);
                            return res.render('success', {user: user});
                        }

                        return res.redirect('/error');
                    });
                });
            }, 500);
        }
    });
});

module.exports = router;