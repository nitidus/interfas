var os = require('os'),
    fs = require('fs'),
    fx = require('mkdir-recursive'),
    path = require('path'),
    axios = require('axios'),
    nodemailer = require("nodemailer"),
    ejs = require('ejs');

const GLOBAL = require('./global'),
      __CONSTANT = require('../flows/knowledge/index');

module.exports = {
  _convertDigitsToEnglish: (string) => {
      return string.replace(/[\u0660-\u0669]/g, function (c) {
          return c.charCodeAt(0) - 0x0660;
      }).replace(/[\u06f0-\u06f9]/g, function (c) {
         return c.charCodeAt(0) - 0x06f0;
     });
  },
  _convertDigitsToPersian: (string) => {
    return string.replace(/[0-9]/g, function (c) {
        return String.fromCharCode(c.charCodeAt(0) + 0x0630);
    });
  },
  _convertDateFromGregorianToJalali: (gy, gm, gd) => {
   g_d_m = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];

   if (gy > 1600){
    jy = 979;
    gy -= 1600;
   }else{
    jy = 0;
    gy -= 621;
   }

   gy2 = (gm > 2)? (gy + 1): gy;
   days = (365*gy) + (parseInt((gy2+3)/4)) - (parseInt((gy2 + 99) / 100)) +(parseInt((gy2 + 399) / 400)) - 80 + gd + g_d_m[gm - 1];
   jy += 33 * (parseInt(days / 12053));
   days %= 12053;
   jy += 4 * (parseInt(days / 1461));
   days %= 1461;

   if (days > 365){
    jy += parseInt((days - 1) / 365);
    days = (days - 1) % 365;
   }

   jm = (days < 186)? 1 + parseInt(days/31): 7 + parseInt((days - 186) / 30);
   jd = 1 + ((days < 186)? (days % 31): ((days - 186) % 30));

   return {
     year: jy,
     month: jm,
     day: jd
   };
 },
 _convertDateFromJalaliToGregorian: (jy, jm, jd) => {
   if (jy > 979){
    gy = 1600;
    jy -= 979;
   }else{
    gy = 621;
   }

   days = (365 * jy) + ((parseInt(jy / 33)) * 8) + (parseInt(((jy % 33) + 3) / 4)) + 78 + jd + ((jm < 7)? (jm - 1) * 31: ((jm - 7) * 30) + 186);
   gy += 400 * (parseInt(days / 146097));
   days %= 146097;

   if (days > 36524){
    gy += 100 *(parseInt(--days / 36524));
    days %= 36524;

    if (days >= 365) days++;
   }

   gy += 4 * (parseInt(days / 1461));
   days %= 1461;

   if (days > 365){
    gy += parseInt((days - 1) / 365);
    days = (days - 1) % 365;
   }

   gd = days + 1;
   sal_a = [0, 31, ((gy % 4 == 0 && gy % 100 != 0) || (gy % 400 == 0))? 29: 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

   for (gm = 0; gm < 13; gm++){
    v = sal_a[gm];

    if (gd <= v) break;

    gd-=v;
   }

   return (new Date(gy + '/' + gm + '/' + gd));
 },
 _throwErrorWithCodeAndMessage: (metaErrorMessage, metaCode = 600, metaErrorType = 'BadRequestException') => {
   return {
     meta: {
       code: metaCode,
       error_type: metaErrorType,
       error_message: metaErrorMessage
     }
   }
 },
 _throwResponseWithData: (response, metaCode = 200) => {
   return {
     meta: {
       code: metaCode
     },
     data: response
   }
 },
 _convertTokenToKeyword: (token) => {
   return token.replace(/(_|-| )+/ig, '_').toUpperCase();
 },
 _writeBase64DataOnFile: (base64DataURI, requestedDirectoryPath) => {
   const _REQUESTED_FILE_NAME = (requestedDirectoryPath.match(/.+\.\w/ig) !== null)? path.basename(requestedDirectoryPath): '',
         _FILE_MIME_TYPE = base64DataURI.match(/data:image\/\w+/ig)[0].replace(/data:image\//ig, ''),
         _FILE_EXTENSION_REGEX = new RegExp(`.+\.${_FILE_MIME_TYPE}$`, 'g');

   if (_REQUESTED_FILE_NAME.match(_FILE_EXTENSION_REGEX) !== null){
     const _FINAL_BASE64_DATA_URI = base64DataURI.replace(/data:\w+\/\w+;base64,/i, ''),
           _FINAL_DATA_BUFFER = new Buffer(_FINAL_BASE64_DATA_URI, 'base64');

     fs.writeFile(requestedDirectoryPath, _FINAL_DATA_BUFFER, (writeFileError) => {
       if (writeFileError){
         return module.exports._throwErrorWithCodeAndMessage(writeFileError, 700);
       }

       return module.exports._throwResponseWithData(requestedDirectoryPath);
     })
   }
 },
 _uploadBase64DataURI: (base64DataURI, specificDirectory) => {
   const _REQUESTED_PATH = path.resolve(__dirname, '..', specificDirectory),
         _REQUESTED_FILE_NAME = (_REQUESTED_PATH.match(/.+\.\w/ig) !== null)? path.basename(_REQUESTED_PATH): '',
         _REQUESTED_DIRECTORY = _REQUESTED_PATH.replace(_REQUESTED_FILE_NAME, '');

   fs.access(_REQUESTED_DIRECTORY, fs.constants.F_OK, (accessError) => {
     if (accessError){
       if (accessError.code === 'ENOENT'){
         fx.mkdir(_REQUESTED_DIRECTORY, (mkdirError) => {
           if (!mkdirError){
             module.exports._writeBase64DataOnFile(base64DataURI, _REQUESTED_PATH);
           }
         });
       }else{
         module.exports._writeBase64DataOnFile(base64DataURI, _REQUESTED_PATH);
       }
     }else{
       module.exports._writeBase64DataOnFile(base64DataURI, _REQUESTED_PATH);
     }
   });
 },
 _removeFileWithEmptyDirectory: (directory) => {
   const _REQUESTED_PATH = path.resolve(__dirname, '..', directory),
         _REQUESTED_FILE_NAME = (_REQUESTED_PATH.match(/.+\.\w/ig) !== null)? path.basename(_REQUESTED_PATH): '',
         _REQUESTED_DIRECTORY = _REQUESTED_PATH.replace(_REQUESTED_FILE_NAME, '');

   fs.access(_REQUESTED_DIRECTORY, fs.constants.F_OK, (accessError) => {
     if (accessError){
       if (accessError.code === 'ENOENT'){
         fx.rmdir(_REQUESTED_PATH, (rmpathError) => {
           if (rmpathError){
             return false;
           }
         });
       }else{
         fx.rmdir(_REQUESTED_PATH, (rmpathError) => {
           if (rmpathError){
             return false;
           }
         });
       }
     }
   });
 },
 _removeFileWithPath: (directory) => {
   const _REQUESTED_PATH = path.resolve(__dirname, '..', directory);

   fs.unlink(_REQUESTED_PATH, (unlinkError) => {
      if (unlinkError){
        return false;
      }
    });
 },
 _uploadUserProfilePhoto: (base64DataURI, photoDirectoryWithOptionalExtendedPath) => {
   const _FILE_DIRECTORY = `img/profile/users/${photoDirectoryWithOptionalExtendedPath}`;

   module.exports._uploadBase64DataURI(base64DataURI, _FILE_DIRECTORY);

   return _FILE_DIRECTORY;
 },
 _uploadBrandProfilePhoto: (base64DataURI, photoDirectoryWithOptionalExtendedPath) => {
   const _FILE_DIRECTORY = `img/profile/brands/${photoDirectoryWithOptionalExtendedPath}`;

   module.exports._uploadBase64DataURI(base64DataURI, _FILE_DIRECTORY);

   return _FILE_DIRECTORY;
 },
 _sendMessage: async (receptorPhoneNumber, receptorToken) => {
   const _TARGET_URL = `${GLOBAL.URLS.SMS_PROVIDER.HOST_NAME}/verify/lookup.json`,
         _SEED = {
           receptor: receptorPhoneNumber,
           token: receptorToken,
           template: GLOBAL.URLS.SMS_PROVIDER.PATTERN_NAME
         };

   try {
     const _RESPONSE = await axios.post(_TARGET_URL, _SEED);

     return _RESPONSE;
   } catch (error) {
     if (typeof error.return != 'undefined'){
       throw new Error(error.return);
     }
   }
 },
 _sendEmail: async (sender, receivers, subject, content) => {
   if (sender != '' && subject != '' && content != ''){
     var _RECEIVERS = receivers;

     if (Array.isArray(receivers) && receivers.length > 0){
       _RECEIVERS = _RECEIVERS.toString();
     }

     let account = await nodemailer.createTestAccount(),
         transporter = nodemailer.createTransport({
            host: GLOBAL.TRANSPORTER.MAIL.HOST,
            port: GLOBAL.TRANSPORTER.MAIL.PORT.NON_SECURE,
            secure: false, // true for 465, false for other ports
            auth: {
              user: account.user,
              pass: account.pass
            }
          }),
          mailOptions = {
            from: sender,
            to: _RECEIVERS,
            subject: subject,
            priority: 'high',
            headers: [
              {
                key: 'Content-Type',
                value: 'text/html'
              }
            ],
            html: content
          },
          sentMail = await transporter.sendMail(mailOptions);

     return sentMail;
   }else{
     throw new Error('None of the parameters can not be empty.');
   }
},
_sendInvitation: async (appName, details) => {
  const _REQUESTED_PATH = path.resolve(__dirname, '..', 'templates/invitation.ejs'),
        _TARGET_RESPONSE = fs.readFileSync(_REQUESTED_PATH, 'utf8'),
        _TARGET_RESPONSE_CONTENT = _TARGET_RESPONSE.toString(),
        _APP_DETAILS = __CONSTANT.GLOBAL.targets.filter((target) => {
          const TARGET_KEYWORD = module.exports._convertTokenToKeyword(target.name),
                APP_NAME_KEYWORD = module.exports._convertTokenToKeyword(appName);

          return TARGET_KEYWORD === APP_NAME_KEYWORD;
        });

  if (_APP_DETAILS.length === 1){
    const _PARSED_APP_DETAILS = _APP_DETAILS[0],
          _EMAIL_BODY_CONTENT = ejs.render(_TARGET_RESPONSE_CONTENT, {
            app: {
              name: _PARSED_APP_DETAILS.name,
              photo: _PARSED_APP_DETAILS.photo,
              address: _PARSED_APP_DETAILS.address
            },
            ...details
          }),
          _SENT_MAIL = await module.exports._sendEmail(`"${_PARSED_APP_DETAILS.name}" <${_PARSED_APP_DETAILS.email}>`, receivers, `${_PARSED_APP_DETAILS.name} Invitation`, _EMAIL_BODY_CONTENT);

    return _SENT_MAIL;
  }
}
};
