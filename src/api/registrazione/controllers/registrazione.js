'use strict';

/**
 * A set of functions called "actions" for `registrazione`
 */

module.exports = {
  async registra(ctx) {
    try {
      const { username, email, password, nome, cognome, indirizzo, telefono, imgp } = ctx.request.body;

      // Controllo che tutti i campi obbligatori siano presenti (indirizzo e telefono non sono più obbligatori)
      if (!username || !email || !password || !nome || !cognome) {
        return ctx.badRequest('Tutti i campi obbligatori devono essere compilati');
      }

      // Verifica che l'email sia valida
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return ctx.badRequest('Email non valida');
      }

      // Verifica della lunghezza della password
      if (password.length < 8) {
        return ctx.badRequest('La password deve essere di almeno 8 caratteri');
      }

      // Se il numero di telefono è fornito, verifica che sia valido
      if (telefono) {
        const telefonoRegex = /^[0-9]{10,}$/;
        if (!telefonoRegex.test(telefono)) {
          return ctx.badRequest('Numero di telefono non valido');
        }
      }

      // Controllo che l'utente con la stessa email non esista già
      const utenteEsistente = await strapi.db.query('api::account.account').findOne({ where: { email } });
      if (utenteEsistente) {
        return ctx.badRequest('Email già registrata');
      }

      // Crea il cliente con l'aggiunta del campo publishedAt per la pubblicazione
      const clienteData = {
        nome,
        cognome,
        publishedAt: new Date(), // Pubblica il cliente immediatamente
      };

      // Aggiungi l'indirizzo se fornito
      if (indirizzo) {
        clienteData.indirizzo = indirizzo;
      }

      // Aggiungi il telefono se fornito
      if (telefono) {
        clienteData.telefono = telefono;
      }

      // Se l'immagine è fornita, aggiungila
      if (imgp) {
        clienteData.imgprofile = imgp;
      }

      const nuovoCliente = await strapi.entityService.create('api::cliente.cliente', {
        data: clienteData,
      });

      // Crea il login associato al cliente
      const nuovoLogin = await strapi.entityService.create('api::account.account', {
        data: {
          username,
          email,
          password,
          cliente: nuovoCliente.id,
          publishedAt: new Date(),
        },
      });

      return ctx.send({ message: 'Cliente registrato e pubblicato', login: nuovoLogin, cliente: nuovoCliente });

    } catch (error) {
      ctx.badRequest('Errore durante la registrazione', { error });
    }
  },

  async deleteAccountAndCliente(ctx) {
    const { id } = ctx.params;

    try {
      // Trova l'account da eliminare, con il cliente associato
      const account = await strapi.db.query('api::account.account').findOne({
        where: { id },
        populate: ['cliente'],
      });

      if (!account) {
        return ctx.notFound('Account non trovato');
      }

      // Se esiste un cliente associato
      if (account.cliente) {
        // Trova tutte le carte associate al cliente
        const carte = await strapi.db.query('api::carta.carta').findMany({
          where: { cliente: account.cliente.id },
        });

        // Elimina tutte le carte
        if (carte.length > 0) {
          await strapi.db.query('api::carta.carta').deleteMany({
            where: { id: carte.map(carta => carta.id) },
          });
        }

        // Elimina il cliente
        await strapi.db.query('api::cliente.cliente').delete({
          where: { id: account.cliente.id },
        });
      }

      // Elimina l'account
      await strapi.db.query('api::account.account').delete({
        where: { id },
      });

      return ctx.send({ message: 'Account, cliente e carte eliminati con successo' });

    } catch (error) {
      return ctx.badRequest('Errore durante la cancellazione', { error });
    }
  },

};
