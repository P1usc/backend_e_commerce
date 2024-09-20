'use strict';

/**
 * checkout router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::checkout.checkout');

const extraRoutes = [
    {
        method: 'POST',
        path: '/checkouts/process',
        handler: 'checkout.processCheckout',
        config: {
          auth: false,
        },
      },
]

const customRouter = (innerRouter, extraRoutes = []) => {
    let routes;
    return {
      get prefix() {
        return innerRouter.prefix;
      },
      get routes() {
        if (!routes) routes = innerRouter.routes.concat(extraRoutes);
        return routes;
      },
    };
  };
  
  module.exports = customRouter(defaultRouter, extraRoutes);
