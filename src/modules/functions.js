var os = require('os'),
    fs = require('fs'),
    fx = require('mkdir-recursive'),
    path = require('path'),
    axios = require('axios'),
    nodemailer = require("nodemailer"),
    ejs = require('ejs'),
    stripe = require('stripe');

const GLOBAL = require('./global'),
      __CONSTANT = require('../flows/knowledge/index');

stripe = stripe(GLOBAL.PAYMENT_APPROACH.API_KEY);

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
 _checkIsAValidObjectID: (token) => {
   const _TARGET_REGEX = new RegExp(`^[0-9a-fA-F]{24}$`),
         _IS_OBJECT_ID_VALID = token.match(_TARGET_REGEX);

   return (_IS_OBJECT_ID_VALID !== null)? true: false;
 },
 _checkIsAValidNumericOnlyField: (content) => {
    const _TARGET_REGEX = new RegExp(`^[0-9]+.?([0-9]+)?$`, 'g'),
          _IS_TEXT_ONLY_VALID = content.match(_TARGET_REGEX);

    return (_IS_TEXT_ONLY_VALID !== null)? true: false;
  },
  _checkIsAValidTextOnlyField: (content) => {
    const _TARGET_REGEX = new RegExp(`^[\u0041-\u005A\u0061-\u007A\u00AA\u00B5\u00BA\u00C0-\u00D6\u00D8-\u00F6\u00F8-\u02C1\u02C6-\u02D1\u02E0-\u02E4\u02EC\u02EE\u0370-\u0374\u0376\u0377\u037A-\u037D\u0386\u0388-\u038A\u038C\u038E-\u03A1\u03A3-\u03F5\u03F7-\u0481\u048A-\u0527\u0531-\u0556\u0559\u0561-\u0587\u05D0-\u05EA\u05F0-\u05F2\u0620-\u064A\u066E\u066F\u0671-\u06D3\u06D5\u06E5\u06E6\u06EE\u06EF\u06FA-\u06FC\u06FF\u0710\u0712-\u072F\u074D-\u07A5\u07B1\u07CA-\u07EA\u07F4\u07F5\u07FA\u0800-\u0815\u081A\u0824\u0828\u0840-\u0858\u08A0\u08A2-\u08AC\u0904-\u0939\u093D\u0950\u0958-\u0961\u0971-\u0977\u0979-\u097F\u0985-\u098C\u098F\u0990\u0993-\u09A8\u09AA-\u09B0\u09B2\u09B6-\u09B9\u09BD\u09CE\u09DC\u09DD\u09DF-\u09E1\u09F0\u09F1\u0A05-\u0A0A\u0A0F\u0A10\u0A13-\u0A28\u0A2A-\u0A30\u0A32\u0A33\u0A35\u0A36\u0A38\u0A39\u0A59-\u0A5C\u0A5E\u0A72-\u0A74\u0A85-\u0A8D\u0A8F-\u0A91\u0A93-\u0AA8\u0AAA-\u0AB0\u0AB2\u0AB3\u0AB5-\u0AB9\u0ABD\u0AD0\u0AE0\u0AE1\u0B05-\u0B0C\u0B0F\u0B10\u0B13-\u0B28\u0B2A-\u0B30\u0B32\u0B33\u0B35-\u0B39\u0B3D\u0B5C\u0B5D\u0B5F-\u0B61\u0B71\u0B83\u0B85-\u0B8A\u0B8E-\u0B90\u0B92-\u0B95\u0B99\u0B9A\u0B9C\u0B9E\u0B9F\u0BA3\u0BA4\u0BA8-\u0BAA\u0BAE-\u0BB9\u0BD0\u0C05-\u0C0C\u0C0E-\u0C10\u0C12-\u0C28\u0C2A-\u0C33\u0C35-\u0C39\u0C3D\u0C58\u0C59\u0C60\u0C61\u0C85-\u0C8C\u0C8E-\u0C90\u0C92-\u0CA8\u0CAA-\u0CB3\u0CB5-\u0CB9\u0CBD\u0CDE\u0CE0\u0CE1\u0CF1\u0CF2\u0D05-\u0D0C\u0D0E-\u0D10\u0D12-\u0D3A\u0D3D\u0D4E\u0D60\u0D61\u0D7A-\u0D7F\u0D85-\u0D96\u0D9A-\u0DB1\u0DB3-\u0DBB\u0DBD\u0DC0-\u0DC6\u0E01-\u0E30\u0E32\u0E33\u0E40-\u0E46\u0E81\u0E82\u0E84\u0E87\u0E88\u0E8A\u0E8D\u0E94-\u0E97\u0E99-\u0E9F\u0EA1-\u0EA3\u0EA5\u0EA7\u0EAA\u0EAB\u0EAD-\u0EB0\u0EB2\u0EB3\u0EBD\u0EC0-\u0EC4\u0EC6\u0EDC-\u0EDF\u0F00\u0F40-\u0F47\u0F49-\u0F6C\u0F88-\u0F8C\u1000-\u102A\u103F\u1050-\u1055\u105A-\u105D\u1061\u1065\u1066\u106E-\u1070\u1075-\u1081\u108E\u10A0-\u10C5\u10C7\u10CD\u10D0-\u10FA\u10FC-\u1248\u124A-\u124D\u1250-\u1256\u1258\u125A-\u125D\u1260-\u1288\u128A-\u128D\u1290-\u12B0\u12B2-\u12B5\u12B8-\u12BE\u12C0\u12C2-\u12C5\u12C8-\u12D6\u12D8-\u1310\u1312-\u1315\u1318-\u135A\u1380-\u138F\u13A0-\u13F4\u1401-\u166C\u166F-\u167F\u1681-\u169A\u16A0-\u16EA\u1700-\u170C\u170E-\u1711\u1720-\u1731\u1740-\u1751\u1760-\u176C\u176E-\u1770\u1780-\u17B3\u17D7\u17DC\u1820-\u1877\u1880-\u18A8\u18AA\u18B0-\u18F5\u1900-\u191C\u1950-\u196D\u1970-\u1974\u1980-\u19AB\u19C1-\u19C7\u1A00-\u1A16\u1A20-\u1A54\u1AA7\u1B05-\u1B33\u1B45-\u1B4B\u1B83-\u1BA0\u1BAE\u1BAF\u1BBA-\u1BE5\u1C00-\u1C23\u1C4D-\u1C4F\u1C5A-\u1C7D\u1CE9-\u1CEC\u1CEE-\u1CF1\u1CF5\u1CF6\u1D00-\u1DBF\u1E00-\u1F15\u1F18-\u1F1D\u1F20-\u1F45\u1F48-\u1F4D\u1F50-\u1F57\u1F59\u1F5B\u1F5D\u1F5F-\u1F7D\u1F80-\u1FB4\u1FB6-\u1FBC\u1FBE\u1FC2-\u1FC4\u1FC6-\u1FCC\u1FD0-\u1FD3\u1FD6-\u1FDB\u1FE0-\u1FEC\u1FF2-\u1FF4\u1FF6-\u1FFC\u2071\u207F\u2090-\u209C\u2102\u2107\u210A-\u2113\u2115\u2119-\u211D\u2124\u2126\u2128\u212A-\u212D\u212F-\u2139\u213C-\u213F\u2145-\u2149\u214E\u2183\u2184\u2C00-\u2C2E\u2C30-\u2C5E\u2C60-\u2CE4\u2CEB-\u2CEE\u2CF2\u2CF3\u2D00-\u2D25\u2D27\u2D2D\u2D30-\u2D67\u2D6F\u2D80-\u2D96\u2DA0-\u2DA6\u2DA8-\u2DAE\u2DB0-\u2DB6\u2DB8-\u2DBE\u2DC0-\u2DC6\u2DC8-\u2DCE\u2DD0-\u2DD6\u2DD8-\u2DDE\u2E2F\u3005\u3006\u3031-\u3035\u303B\u303C\u3041-\u3096\u309D-\u309F\u30A1-\u30FA\u30FC-\u30FF\u3105-\u312D\u3131-\u318E\u31A0-\u31BA\u31F0-\u31FF\u3400-\u4DB5\u4E00-\u9FCC\uA000-\uA48C\uA4D0-\uA4FD\uA500-\uA60C\uA610-\uA61F\uA62A\uA62B\uA640-\uA66E\uA67F-\uA697\uA6A0-\uA6E5\uA717-\uA71F\uA722-\uA788\uA78B-\uA78E\uA790-\uA793\uA7A0-\uA7AA\uA7F8-\uA801\uA803-\uA805\uA807-\uA80A\uA80C-\uA822\uA840-\uA873\uA882-\uA8B3\uA8F2-\uA8F7\uA8FB\uA90A-\uA925\uA930-\uA946\uA960-\uA97C\uA984-\uA9B2\uA9CF\uAA00-\uAA28\uAA40-\uAA42\uAA44-\uAA4B\uAA60-\uAA76\uAA7A\uAA80-\uAAAF\uAAB1\uAAB5\uAAB6\uAAB9-\uAABD\uAAC0\uAAC2\uAADB-\uAADD\uAAE0-\uAAEA\uAAF2-\uAAF4\uAB01-\uAB06\uAB09-\uAB0E\uAB11-\uAB16\uAB20-\uAB26\uAB28-\uAB2E\uABC0-\uABE2\uAC00-\uD7A3\uD7B0-\uD7C6\uD7CB-\uD7FB\uF900-\uFA6D\uFA70-\uFAD9\uFB00-\uFB06\uFB13-\uFB17\uFB1D\uFB1F-\uFB28\uFB2A-\uFB36\uFB38-\uFB3C\uFB3E\uFB40\uFB41\uFB43\uFB44\uFB46-\uFBB1\uFBD3-\uFD3D\uFD50-\uFD8F\uFD92-\uFDC7\uFDF0-\uFDFB\uFE70-\uFE74\uFE76-\uFEFC\uFF21-\uFF3A\uFF41-\uFF5A\uFF66-\uFFBE\uFFC2-\uFFC7\uFFCA-\uFFCF\uFFD2-\uFFD7\uFFDA-\uFFDC ]+$`, 'g'),
          _IS_TEXT_ONLY_VALID = content.match(_TARGET_REGEX);

    return (_IS_TEXT_ONLY_VALID !== null)? true: false;
  },
 _convertTokenToKeyword: (token) => {
   return token.replace(/(_|-| )+/ig, '_').toUpperCase();
 },
 _convertTokenToSnakeword: (token) => {
    return token.replace(/(_|-| )+/ig, '-').toLowerCase();
  },
 _convertKeywordToToken: (keyword) => {
    return keyword.toLowerCase().replace(/(_|-| )/ig, ' ').replace(/\b\w/ig, char => char.toUpperCase());
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
   const _REQUESTED_PATH = path.resolve(__dirname, '../../public', directory);

   fs.unlink(_REQUESTED_PATH, (unlinkError) => {
      if (unlinkError){
        return false;
      }
    });
 },
 _uploadUserProfilePhoto: (base64DataURI, photoDirectoryWithOptionalExtendedPath) => {
   const _BASE_DIR = '../public/',
         _FILE_DIRECTORY = `assets/img/profile/users/${photoDirectoryWithOptionalExtendedPath}`;

   module.exports._uploadBase64DataURI(base64DataURI, `${_BASE_DIR}${_FILE_DIRECTORY}`);

   return _FILE_DIRECTORY;
 },
 _uploadBrandProfilePhoto: (base64DataURI, photoDirectoryWithOptionalExtendedPath) => {
   const _BASE_DIR = '../public/',
         _FILE_DIRECTORY = `assets/img/profile/brands/${photoDirectoryWithOptionalExtendedPath}`;

   module.exports._uploadBase64DataURI(base64DataURI, `${_BASE_DIR}${_FILE_DIRECTORY}`);

   return _FILE_DIRECTORY;
 },
 _uploadProductPhoto: (base64DataURI, photoDirectoryWithOptionalExtendedPath) => {
   const _BASE_DIR = '../public/',
         _FILE_DIRECTORY = `assets/img/products/${photoDirectoryWithOptionalExtendedPath}`;

   module.exports._uploadBase64DataURI(base64DataURI, `${_BASE_DIR}${_FILE_DIRECTORY}`);

   return _FILE_DIRECTORY;
 },
 _getEndpointOfAPI: () => {
   return GLOBAL.API.ENDPOINT;
 },
 _getFullEndpointOfAPI: () => {
   const _TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374,
         _TARGET_HOST = process.env.APP_HOST || process.env.HOST || 'http://localhost';

   return `${_TARGET_HOST}:${_TARGET_PORT}${GLOBAL.API.ENDPOINT}`;
 },
 _sendMessage: async (receptorPhoneNumber, receptorToken) => {
   const _TARGET_URL = `${GLOBAL.URLS.SMS_PROVIDER.HOST_NAME}/verify/lookup.json`,
         _SEED = {
           receptor: receptorPhoneNumber,
           token: receptorToken,
           template: GLOBAL.URLS.SMS_PROVIDER.PATTERN_NAME.PERSIAN
         };

   try {
     const _RESPONSE = await axios.post(`${_TARGET_URL}?receptor=${_SEED.receptor}&token=${_SEED.token}&template=${_SEED.template}`);

     return _RESPONSE;
   } catch (error) {
     if (typeof error.return != 'undefined'){
       throw error.return;
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
     throw 'None of the parameters can not be empty.';
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
  },
  _sendVerification: async (appName, details) => {
      const _REQUESTED_PATH = path.resolve(__dirname, '..', 'templates/verification.ejs'),
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
              _SENT_MAIL = await module.exports._sendEmail(`"${_PARSED_APP_DETAILS.name}" <${_PARSED_APP_DETAILS.email}>`, receivers, `${_PARSED_APP_DETAILS.name} Verification`, _EMAIL_BODY_CONTENT);

        return _SENT_MAIL;
      }
    },
  _chargeUsingToken: async (token) => {
    if (typeof token != 'undefined'){
      if (
        ((typeof token.card != 'undefined') || (typeof token.creditCard != 'undefined') || (typeof token.credit_card != 'undefined') || (typeof token.debitCard != 'undefined') || (typeof token.debit_card != 'undefined')) &&
        ((typeof token.amount != 'undefined') || (typeof token.charge_amount != 'undefined') || (typeof token.chargeAmount != 'undefined') || (typeof token.checkout_amount != 'undefined') || (typeof token.checkoutAmount != 'undefined')) &&
        (typeof token.currency != 'undefined')
      ) {
        const _CARD = token.card || token.creditCard || token.credit_card || token.debitCard || token.debit_card,
              _AMOUNT = token.amount || token.charge_amount || token.chargeAmount || token.checkout_amount || token.checkoutAmount,
              _FINAL_AMOUNT = parseInt(_AMOUNT),
              _CURRENCY = token.currency;

        try {
          const _TOKEN = await stripe.tokens.create({
            card: _CARD
          });

          var _CHARGE_SEED = {
            amount: (_FINAL_AMOUNT > 50)? _FINAL_AMOUNT: (_FINAL_AMOUNT * 100),
            currency: _CURRENCY,
            source: _TOKEN.id
          };

          if ((typeof token.receipt_email != 'undefined') || (typeof token.receiptEmail != 'undefined') || (typeof token.email != 'undefined')){
            const _RECEIPT_EMAIL = token.receipt_email || token.receiptEmail || token.email;

            _CHARGE_SEED = {
              ..._CHARGE_SEED,
              receipt_email: _RECEIPT_EMAIL
            };
          }

          if ((typeof token.description != 'undefined') || (typeof token.caption != 'undefined')){
            const _DESCRIPTION = token.description || token.caption;

            _CHARGE_SEED = {
              ..._CHARGE_SEED,
              description: _DESCRIPTION
            };
          }

          if ((typeof token.shipping != 'undefined') || (typeof token.shipping_detail != 'undefined') || (typeof token.shippingDetail != 'undefined')){
            const _SHIPPINNG = token.shipping || token.shipping_detail || token.shippingDetail;

            _CHARGE_SEED = {
              ..._CHARGE_SEED,
              shipping: _SHIPPINNG
            };
          }

          if ((typeof token.meta_data != 'undefined') || (typeof token.metadata != 'undefined') || (typeof token.extra_data != 'undefined') || (typeof token.extradata != 'undefined')){
            const _META_DATA = token.meta_data || token.extra_data || token.metadata || token.extradata;

            _CHARGE_SEED = {
              ..._CHARGE_SEED,
              metadata: _META_DATA
            };
          }

          const _CHARGE = await stripe.charges.create(_CHARGE_SEED);

          return _CHARGE;
        } catch (e) {
          let _FINAL_RESPONSE = {
            raw_type: e.rawType,
            code: e.code,
            message: e.message
          };

          if (_FINAL_RESPONSE.code === 'card_declined'){
            _FINAL_RESPONSE.decline_code = e.raw.decline_code;
          }

          throw _FINAL_RESPONSE;
        }
      }else{
        throw {
          message: "You should define card, amount, currency as the token parameter."
        };
      }
    }else{
      throw {
        message: "You should define token as an required object."
      };
    }
  }
};
