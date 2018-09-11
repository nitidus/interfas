module.exports = (app, CONNECTION_URL, INTERFAS_KEY) => {
  app.get('/', (req, res) => {
    res.json({
      hello: "World!"
    })
  });
};
