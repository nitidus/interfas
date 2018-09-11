module.exports = (app, CONNECTION_URL, INTERFAS_KEY) => {
  app.put('/', (req, res) => {
    res.json({
      hello: "World!"
    })
  });
};
