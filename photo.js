const express = require('express');
const app = express();
const fr = require('face-recognition');

const image = fr.loadImage('./images/5.jpg');

const detector = fr.FaceDetector();
const faceImages = detector.detectFaces(image);
faceImages.forEach((img, i) => fr.saveImage(`./faces/igor5.png`, img));
console.log('end');
