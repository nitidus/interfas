module.exports = (app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  app.put('/', (req, res) => {
    res.json({
      hello: "World!"
    })
  });
};
