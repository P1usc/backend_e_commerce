'use strict';

module.exports = {
  routes: [
    {
      method: 'GET',
      path: '/ricerca-prod',
      handler: 'ricercaprod.cercaprod',
      config: {
        policies: [],
        middlewares: [],
      },
    },
    {
      method: 'GET',
      path: '/prodotti-per-genere',
      handler: 'ricercaprod.prodottiPerGenere',
      config: {
        policies: [],
        middlewares: [],
      },
    },
  ],
};
