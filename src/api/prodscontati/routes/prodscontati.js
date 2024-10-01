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
    {
      method: 'GET',
      path: '/prodotti-scontati/:id',  // Define the path to include the product ID
      handler: 'prodscontati.trovaProdottoPerId',  // Ensure the correct handler is called
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
