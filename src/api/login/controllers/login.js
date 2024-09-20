'use strict';

const bcrypt = require('bcryptjs');
const validator = require('validator');

module.exports = {
  async login(ctx) {
    const { identifier, password } = ctx.request.body;

    // Sanitizza input
    const sanitizedIdentifier = validator.trim(identifier);
    const sanitizedPassword = validator.trim(password);

    // Controllo campi
    if (!sanitizedIdentifier || !sanitizedPassword) {
      return ctx.badRequest('Completare i campi Email/Username e Password');
    }

    // Controllo validità formato email o username
    if (!validator.isEmail(sanitizedIdentifier) && !validator.isAlphanumeric(sanitizedIdentifier)) {
      return ctx.badRequest('Formato non valido per email/username');
    }

    // Trova l'account basato su email o username
    const account = await strapi.db.query('api::account.account').findOne({
      where: {
        $or: [{ email: sanitizedIdentifier }, { username: sanitizedIdentifier }],
      },
      populate: { cliente: true }, // Popola il cliente associato
    });

    // Verifica se l'account esiste
    if (!account) {
      return ctx.badRequest('Email/username non valida');
    }

    // Confronta la password inserita con quella hashata nel database
    const validPassword = await bcrypt.compare(sanitizedPassword, account.password);

    if (!validPassword) {
      return ctx.badRequest('Email/username o password non valide');
    }

    // Recupera il cliente direttamente dalla relazione
    const cliente = account.cliente;

    if (!cliente) {
      return ctx.badRequest('Cliente non trovato');
    }

    // Trova il carrello del cliente
    const carrello = await strapi.db.query('api::carrello.carrello').findOne({
      where: { cliente: cliente.id },
      populate: { item_carrelli: { populate: { prodotto: true } } }, // Popola gli item e i prodotti
    });

    // Trova i preferiti del cliente
    const preferiti = await strapi.db.query('api::preferito.preferito').findMany({
      where: { cliente: cliente.id },
      populate: { prodotti: true }, // Popola i prodotti preferiti
    });

    // Restituisci tutti i dettagli dell'account, cliente, carrello e preferiti
    ctx.send({
      message: 'Login ha avuto successo',
      account: {
        id: account.id,
        username: account.username,
        email: account.email,
      },
      cliente: {
        id: cliente.id,
        nome: cliente.nome,
        cognome: cliente.cognome,
        indirizzo: cliente.indirizzo,
        telefono: cliente.telefono,
        imgprofile: cliente.imgprofile,
      },
      carrello: carrello ? {
        id: carrello.id,
        items: carrello.item_carrelli.map(item => ({
          quantita: item.quantita,
          prodotto: item.prodotto, // Dettagli del prodotto
        })),
      } : null,
      preferiti: preferiti.map(preferito => ({
        id: preferito.id,
        prodotti: preferito.prodotti, // Dettagli dei prodotti preferiti
      })),
    });
  },
};
