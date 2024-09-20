'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::carta.carta', ({ strapi }) => ({
  
  async addCard(ctx) {
    // @ts-ignore
    const { clienteId, nome, circuito, iban, cvv, saldo } = ctx.request.body;
    
    if (!clienteId || !nome || !circuito || !iban || !cvv || saldo === undefined) {
      return ctx.badRequest('Compila tutti i campi necessari.');
    }

    const cliente = await strapi.db.query('api::cliente.cliente').findOne({ where: { id: clienteId } });
    if (!cliente) {
      return ctx.notFound('Cliente non trovato.');
    }

    const carta = await strapi.db.query('api::carta.carta').create({
      data: {
        nome,
        Circuito: circuito,
        iban,
        cvv,
        saldo,
        cliente: clienteId,
        publishedAt: new Date(),
      },
    });

    return ctx.send({ message: 'Carta aggiunta e pubblicata con successo', carta });
  },

  async updateCard(ctx) {
    const { id } = ctx.params;
    // @ts-ignore
    const { nome, circuito, iban, cvv, saldo } = ctx.request.body;

    const carta = await strapi.db.query('api::carta.carta').findOne({ where: { id } });
    if (!carta) {
      return ctx.notFound('Carta non trovata.');
    }

    const updatedCarta = await strapi.db.query('api::carta.carta').update({
      where: { id },
      data: {
        nome,
        Circuito: circuito,
        iban,
        cvv,
        saldo,
        publishedAt: new Date(), 
      },
    });

    return ctx.send({ message: 'Carta aggiornata e pubblicata con successo', updatedCarta });
  },

  async deleteCard(ctx) {
    const { id } = ctx.params;

    const carta = await strapi.db.query('api::carta.carta').findOne({ where: { id } });
    if (!carta) {
      return ctx.notFound('Carta non trovata.');
    }

    await strapi.db.query('api::carta.carta').delete({ where: { id } });

    return ctx.send({ message: 'Carta eliminata con successo' });
  },
}));

