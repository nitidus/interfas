module.exports = (app, CONNECTION_URL, INTERFAS_KEY) => {
  app.delete('/', (req, res) => {
    res.json({
      hello: "World!"
    })
  });
};
