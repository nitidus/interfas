const GLOBAL = require('../../../modules/global'),
      axios = require('axios'),
      axiosInstance = axios.create({
        baseURL: GLOBAL.API.URL
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
