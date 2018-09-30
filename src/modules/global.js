const _SMS_PROVIDER = {
  PROTOCOL: 'https',
  DOMAIN: 'api.kavenegar.com',
  VERSION: 'v1',
  API_KEY : '736D32595A5635345A6D7068326646306F4E3756416465706C795A51696F4A6B'
};

module.exports = {
  URLS: {
    SMS_PROVIDER: {
      HOST_NAME: `${_SMS_PROVIDER.PROTOCOL}://${_SMS_PROVIDER.DOMAIN}/${_SMS_PROVIDER.VERSION}/${_SMS_PROVIDER.API_KEY}`,
      PATTERN_NAME: 'DistroVerify'
    }
  }
};
