const _TARGET_PORT = process.env.APP_PORT || process.env.PORT || 16374,
      _TARGET_HOST = process.env.APP_HOST || process.env.HOST || 'http://localhost',
      axios = require('axios'),
      axiosInstance = axios.create({
        baseURL: `${_TARGET_HOST}:${_TARGET_PORT}`
      });

axiosInstance.interceptors.request.use(config => {
  const progressEvent = config.onLoading || config.onProgress || config.loading || config.progress;

  if (typeof progressEvent != 'undefined'){
    progressEvent();
  }

  return config;
})

axiosInstance.interceptors.response.use(response => {
  const { config } = response,
        doneEvent = config.onDone || config.onLoadingEnd || config.onProgressEnd || config.done || config.loadingEnd || config.progressEnd;

  if (typeof doneEvent != 'undefined'){
    doneEvent();
  }

  return response;
})

module.exports = axiosInstance;
