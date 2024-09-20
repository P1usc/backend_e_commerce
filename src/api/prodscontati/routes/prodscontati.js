module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/prodotti-scontati',
      handler: 'prodscontati.trovaSconti',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};