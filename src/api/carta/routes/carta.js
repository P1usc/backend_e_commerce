'use strict';

/**
 * carta router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const defaultRouter = createCoreRouter('api::carta.carta');

// Rotte personalizzate per il controller carta
const extraRoutes = [
    {
      method: 'POST',
      path: '/carta/add', // Aggiungere una carta
      handler: 'carta.addCard',
      config: {
        auth: false,
      },
    },
    {
      method: 'PUT',
      path: '/carta/update/:id', // Modificare una carta esistente
      handler: 'carta.updateCard',
      config: {
        auth: false,
      },
    },
    {
      method: 'DELETE',
      path: '/carta/delete/:id', // Eliminare una carta
      handler: 'carta.deleteCard',
      config: {
        auth: false,
      },
    },
  ];
  
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