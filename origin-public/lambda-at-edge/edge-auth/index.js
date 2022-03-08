'use strict';
var jwt = require('jsonwebtoken');  
var jwkToPem = require('jwk-to-pem');

/*
TO DO:
copy values from CloudFormation outputs into USERPOOLID and JWKS variables
*/

var USERPOOLID = 'us-east-1_bSofCDt8L';
var JWKS = '{"keys":[{"alg":"RS256","e":"AQAB","kid":"Uv5vK0XNUVl9S6WCFmiDb4tVdF+pzjNtW5LG69wf2iI=","kty":"RSA","n":"plASaJ4V9edIHSpVVhrk2NbnpBnn9h2-uzUR7jf4fHKIr3S9O8f99MEI8NkcB_xdo92FZWK47_utxagJ6wXmtzXkGu97qtmr9nk9fOu1BtX6rqOPKutb3RXA-om0OKwTkosKZW45rKFl3exDXEnko7DM-DtpIR6wlsIMLMmgzrzXO1iBw9-rmjUqvorPJypYGHS1hxqhRNJuiDC_-NpXDGWgCO2L0oBjiGI-xuDHL3P9fugIPnVcshxK3I3Go9nlUekjTCoUXfaNrO2ugk8JesPvkkNyqQNBHWpjcs7pneUjRDr_HoB-EfhFKMH7G3MynaVf1mYVfCXt7Jxns-PKxQ","use":"sig"},{"alg":"RS256","e":"AQAB","kid":"rxVPuT+WuGHDQGLzEN7kdoRK/b8SQApOsLSc1/OWJDU=","kty":"RSA","n":"6qtzrpj6UrBk-phoiEKEFmky4JDUWL_Y5yB0AJTOt6dSVDtbtJ61MHwiS4BeVcLDo7ZbEoXD1OLS8pSQfYXwB1ZuDP_69HfZjH8ZOQAfBlhj771HEDroA9AnW_fSMVee19RKP9TWStL_4JAK1nUTVRZQbq5GO7iqs97DOYUUED8UxRt4VxtKHF71V7GNpIvl5GzjatSOo3RUzxh_MSA1SRSWnOAbTmFGmt6lsx81A6QPvfMLy-0v2lO7gHd7lB52nmhZRq2_EMlTDQq6wkD6KYVCrgVFMgmLUWbuL1BYzPAId_9TOiXdqKzEbDkscyWTlBTHaHUvQo-bkGAM3jBR-Q","use":"sig"}]}';

/*
verify values above
*/



var region = 'us-east-1';
var iss = 'https://cognito-idp.' + region + '.amazonaws.com/' + USERPOOLID;
var pems;

pems = {};
var keys = JSON.parse(JWKS).keys;
for(var i = 0; i < keys.length; i++) {
    //Convert each key to PEM
    var key_id = keys[i].kid;
    var modulus = keys[i].n;
    var exponent = keys[i].e;
    var key_type = keys[i].kty;
    var jwk = { kty: key_type, n: modulus, e: exponent};
    var pem = jwkToPem(jwk);
    pems[key_id] = pem;
}

const response401 = {
    status: '401',
    statusDescription: 'Unauthorized'
};

exports.handler = (event, context, callback) => {
    const cfrequest = event.Records[0].cf.request;
    const headers = cfrequest.headers;
    console.log('getting started');
    console.log('USERPOOLID=' + USERPOOLID);
    console.log('region=' + region);
    console.log('pems=' + pems);

    //Fail if no authorization header found
    if(!headers.authorization) {
        console.log("no auth header");
        callback(null, response401);
        return false;
    }

    //strip out "Bearer " to extract JWT token only
    var jwtToken = headers.authorization[0].value.slice(7);
    console.log('jwtToken=' + jwtToken);

    //Fail if the token is not jwt
    var decodedJwt = jwt.decode(jwtToken, {complete: true});
    if (!decodedJwt) {
        console.log("Not a valid JWT token");
        callback(null, response401);
        return false;
    }

    //Fail if token is not from your UserPool
    if (decodedJwt.payload.iss != iss) {
        console.log("invalid issuer");
        callback(null, response401);
        return false;
    }

    //Reject the jwt if it's not an 'Access Token'
    if (decodedJwt.payload.token_use != 'access') {
        console.log("Not an access token");
        callback(null, response401);
        return false;
    }

    //Get the kid from the token and retrieve corresponding PEM
    var kid = decodedJwt.header.kid;
    var pem = pems[kid];
    if (!pem) {
        console.log('Invalid access token');
        callback(null, response401);
        return false;
    }

    //Verify the signature of the JWT token to ensure it's really coming from your User Pool
    jwt.verify(jwtToken, pem, { issuer: iss }, function(err, payload) {
      if(err) {
        console.log('Token failed verification');
        callback(null, response401);
        return false;
      } else {
        //Valid token. 
        console.log('Successful verification');
        //remove authorization header
        delete cfrequest.headers.authorization;
        //CloudFront can proceed to fetch the content from origin
        callback(null, cfrequest);
        return true;
      }
    });
};




