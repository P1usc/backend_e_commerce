module.exports = {
  routes: [
     {
      method: 'POST',
      path: '/login',
      handler: 'login.login',
      config: {
        policies: [],
        middlewares: [],
      },
     },
  ],
};
