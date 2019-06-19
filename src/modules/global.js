const _API = {
        VERSION: {
          VALUE: "1.0.0",
          NAME: "v1"
        }
      },
      _SMS_PROVIDER = {
        PROTOCOL: 'https',
        DOMAIN: 'api.kavenegar.com',
        VERSION: 'v1',
        API_KEY : '736D32595A5635345A6D7068326646306F4E3756416465706C795A51696F4A6B'
      },
      _MAIL_TRANSPORTER = {
        HOST: "smtp.ethereal.email",
        PORT: {
          SECURE: 465,
          NON_SECURE: 587
        }
      },
      _PAYMENT_APPROACH = {
        API_KEY: 'sk_test_h88TQbVd5UPP4HGZdM2SQpbv'
      };

module.exports = {
  API: {
    ENDPOINT: `/api/${_API.VERSION.NAME}`
  },
  URLS: {
    SMS_PROVIDER: {
      HOST_NAME: `${_SMS_PROVIDER.PROTOCOL}://${_SMS_PROVIDER.DOMAIN}/${_SMS_PROVIDER.VERSION}/${_SMS_PROVIDER.API_KEY}`,
      PATTERN_NAMES: {
        VERIFY: {
          PERSIAN: 'DistroVerifyPersian',
          ENGLISH: 'DistroVerifyEnglish'
        },
        RECOVER: {
          PERSIAN: 'DistroRecoverPersian',
          ENGLISH: 'DistroRecoverEnglish'
        }
      }
    }
  },
  TRANSPORTER: {
    MAIL: _MAIL_TRANSPORTER
  },
  PAYMENT_APPROACH: _PAYMENT_APPROACH
};
