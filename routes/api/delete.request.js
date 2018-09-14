module.exports = (app, CONNECTION_URL, CONNECTION_CONFIG, INTERFAS_KEY) => {
  app.delete('/', (req, res) => {
    res.json({
      hello: "World!"
    })
  });
};
