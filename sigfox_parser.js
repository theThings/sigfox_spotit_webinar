// BIG ENDIAN TO LITTLE ENDIAN
function rev(v) {
  let s = v.replace(/^(.(..)*)$/, '0$1'); // add a leading zero if needed
  let a = s.match(/../g);             // split number in groups of two
  a.reverse();                        // reverse the groups
  let s2 = a.join('');                // join the groups back together
  return s2;
}

// STRING TO FLOAT
function parseF(s) {
  let intData = new Uint32Array(1);
  intData[0] = s;
  let dataAsFloat = new Float32Array(intData.buffer);
  return dataAsFloat[0];
}

// STRING TO MAC ADDRESS
function stringToMac(string) {
  return rev(string).match(/.{1,2}/g).reverse().join(':');
}

let GOOGLE_API_KEY = 'your google api key';

function main(params, callback) {
  let result;

  if (params.data.substring(0,4) !== '0000') {
    let mac = stringToMac(rev(params.data.substring(0, 12)));
    let mac2 = stringToMac(rev(params.data.substring(12, 24)));

    let body = {
      'considerIp': 'false',
      'wifiAccessPoints': [
        {'macAddress': mac},
        {'macAddress': mac2}]
    };

    httpRequest({
      host: 'www.googleapis.com',
      path: '/geolocation/v1/geolocate?key=' + GOOGLE_API_KEY,
      method: 'POST',
      secure: true,
      headers: {'Content-Type': 'application/json'}
    }, body, function (err, res) {
      if (err) return callback(err);

      result = [
        {
          'key': 'geolocation',
          'value': 'google-wifi',
          'geo': {
            'lat': JSON.parse(res.result).location.lat,
            'long': JSON.parse(res.result).location.long
          }
        },
        {
          'key': 'google_accuracy',
          'value': JSON.parse(res.result).accuracy
        }];
      return callback(null, result);
    });

  }
  else {
    result = [{
      'key': 'temperature',
      'value': parseF(parseInt(params.data.substring(8, 16), 16))
    },
      {
        'key': 'humidity',
        'value': parseInt(params.data.substring(16, 24), 16)
      }];

    callback(null, result);
  }
}