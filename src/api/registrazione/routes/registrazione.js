module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/registrazione',
      handler: 'registrazione.registra',
      config: {
        policies: [],
        middlewares: [],
      },
    },

    {
      method: 'DELETE',
      path: '/registrazione/:id',
      handler: 'registrazione.deleteAccountAndCliente',
      config: {
        policies: [],
        middlewares: [],
      },
    }
  ],
};
