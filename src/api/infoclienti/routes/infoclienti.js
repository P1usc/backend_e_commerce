
module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/infoclienti',
      handler: 'infoclienti.getAll',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/infoclienti/:id',
      handler: 'infoclienti.findOne',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
