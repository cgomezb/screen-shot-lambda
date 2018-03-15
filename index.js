function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

var webshot = require("webshot");
var AWS = require('aws-sdk');
AWS.config.region = 'us-east-2';

var s3 = new AWS.S3();
var S3_BUCKET = 'creatives-screenshot-test';

exports.handler = (() => {
  var _ref = _asyncToGenerator(function* (event, context, callback) {
    var urlSite = "https://www.google.com";
    var screenShotName = `screenShot-${generateId()}.png`;

    var options = {
      streamType: "png",
      windowSize: {
        width: 1400,
        height: 786
      },
      shotSize: {
        width: 'all',
        height: 'all'
      },
      renderDelay: 5000,
      onLoadFinished: {
        fn: function () {
          var tagExample = '<img src="https://www.mumbrella.asia/content/uploads/2017/02/IPG-Mediabrands-image.png" height="90" width="728">';
          var element = 'lga';
          var targetTag = document.getElementById(element);
          targetTag.innerHTML = tagExample;
        }
      }
    };

    try {
      var renderStream = webshot(urlSite, options);
      
      var result = new Buffer('', 'base64');
      renderStream.on('data', function (data) {
        console.log('Enter: ' + data.toString('binary').substring(1, 4));
        result = Buffer.concat([result, data]);
      });

      renderStream.on('end', function () {
        console.log('End');

        var s3Params = {
          Body: result.toString('binary'),
          Bucket: S3_BUCKET,
          Key: screenShotName
        };

        s3.putObject(s3Params, (err, data) => {
          if (err) {
            console.log(err);
          }
          callback(null, 'ok!');
        });
      });
    } catch (err) {
      callback(err);
    }
  });

  return function (_x, _x2, _x3) {
    return _ref.apply(this, arguments);
  };
})();

function generateId() {
  return ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
}