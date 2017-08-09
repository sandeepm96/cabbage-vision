// Get dependencies
const express = require('express');
const path = require('path');
const http = require('http');
const bodyParser = require('body-parser');
const Vision = require('@google-cloud/vision');
const NodeWebcam = require( "node-webcam" );

const app = express();
const vision = Vision();

var opts = {
    width: 1280,
    height: 720,
    quality: 100,
    delay: 0,
    saveShots: true,
    output: "jpeg",
    device: false,
    callbackReturn: "location",
    verbose: false
};

var Webcam = NodeWebcam.create( opts );

// Parsers for POST data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

// Catch all other routes and return the index file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client.html'));
});
app.get('/jquery.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'jquery.js'));
});
app.get('/detect', (req, res) => {
  Webcam.capture( "test_picture", function( err, data ) {
    var fileName = './test_picture.jpg';

    // Prepare the request object
    var request = {
      source: {
        filename: fileName
      }
    };

    // Performs label detection on the image file
    vision.labelDetection(request)
    .then((results) => {
      const labels = results[0].labelAnnotations;
      var return_result = {
        score: 0
      }

      console.log('Labels:');
      labels.forEach((label) => {
        console.log(label.description)
        if(label.description == 'cabbage'){
          return_result.score = label.score
        }
      });
      res.send(return_result)
    })
    .catch((err) => {
      console.error('ERROR:', err);
      res.send(err)
    });
  });
})


/**
 * Get port from environment and store in Express.
 */
const port = process.env.PORT || '3000';
app.set('port', port);

/**
 * Create HTTP server.
 */
const server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */
server.listen(port, () => console.log(`APP running on localhost:${port}`));
