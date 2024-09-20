'use strict';

const { createCoreController } = require('@strapi/strapi').factories;

module.exports = createCoreController('api::checkout.checkout', ({ strapi }) => ({
  
  async processCheckout(ctx) {
    try {
      // @ts-ignore
      const { clienteId, indirizzo, modalitaPag, citta, nominativo, telefono, codicep, provincia, cartaId } = ctx.request.body;

      // Parsing dei numeri
      const telefonoParsed = parseInt(telefono, 10);
      const codicepParsed = parseInt(codicep, 10);

      // Verifica che tutti i campi necessari siano presenti e validi
      if (!clienteId || !indirizzo || !modalitaPag || !citta || !nominativo || isNaN(telefonoParsed) || isNaN(codicepParsed) || !provincia) {
        return ctx.badRequest('Compilare tutti i campi necessari per il checkout.');
      }

      // Recupera il cliente e il suo carrello
      const cliente = await strapi.db.query('api::cliente.cliente').findOne({
        where: { id: clienteId },
        populate: ['carrello', 'carrello.item_carrelli']
      });
      if (!cliente) {
        return ctx.notFound('Cliente non trovato.');
      }

      // Controlla che il carrello del cliente non sia vuoto
      const carrello = cliente.carrello;
      if (!carrello || carrello.item_carrelli.length === 0) {
        return ctx.badRequest('Il carrello è vuoto.');
      }

      // Calcola il totale e verifica se la carta è valida
      let total = 0;
      if (modalitaPag === 'Carta') {
        const carta = await strapi.db.query('api::carta.carta').findOne({ where: { id: cartaId } });
        if (!carta) {
          return ctx.badRequest('Carta non valida.');
        }

        // Calcola il totale e verifica se la carta ha saldo sufficiente
        total = carrello.item_carrelli.reduce((sum, item) => sum + (item.prezzo || 0) * (item.quantita || 0), 0);
        if (carta.saldo < total) {
          return ctx.badRequest('Saldo insufficiente sulla carta.');
        }

        // Scala il saldo dalla carta
        await strapi.db.query('api::carta.carta').update({
          where: { id: cartaId },
          data: {
            saldo: carta.saldo - total,
          },
        });
      } else if (modalitaPag === 'Contrassegno') {
        console.log('Pagamento in contrassegno selezionato.');
      } else {
        return ctx.badRequest('Metodo di pagamento non valido.');
      }

      // Crea il checkout
      const checkout = await strapi.db.query('api::checkout.checkout').create({
        data: {
          indirizzo,
          modalitaPag,
          citta,
          nominativo,
          telefono: telefonoParsed,
          codicep: codicepParsed,
          provincia,
          aquistodata: new Date(),
          cliente: clienteId,
          carta: modalitaPag === 'Carta' ? cartaId : null,
          publishedAt: new Date(), // Pubblica subito il checkout
        },
      });

      // Recupera i dettagli degli articoli del carrello
      const itemDetails = await strapi.db.query('api::item-carrello.item-carrello').findMany({
        where: { carrello: carrello.id },
        populate: ['prodotto'] // Assumi che ci sia una relazione con i prodotti
      });

      // Svuota il carrello del cliente
      await strapi.db.query('api::item-carrello.item-carrello').delete({
        where: { carrello: carrello.id },
      });

      return ctx.send({
        message: 'Checkout completato con successo',
        checkout,
        items: itemDetails
      });

    } catch (err) {
      console.error('Error processing checkout:', err);
      ctx.throw(500, 'Errore durante il processo di checkout.');
    }
  },

}));
