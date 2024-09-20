module.exports = {
  async addToCart(ctx) {
    const { clienteId, prodottoId, quantita } = ctx.request.body;

    try {
      // Trova il cliente
      const cliente = await strapi.entityService.findOne('api::cliente.cliente', clienteId, {
        populate: ['carrello'],
      });
      if (!cliente) {
        return ctx.throw(404, 'Cliente non trovato');
      }

      // Trova il prodotto
      const prodotto = await strapi.entityService.findOne('api::prodotto.prodotto', prodottoId);
      if (!prodotto) {
        return ctx.throw(404, 'Prodotto non trovato');
      }

      // Trova o crea il carrello
      let carrello;
      if (cliente.carrello) {
        carrello = await strapi.entityService.findOne('api::carrello.carrello', cliente.carrello.id, {
          populate: { item_carrelli: true },
        });
      } else {
        carrello = null;
      }

      if (!carrello) {
        carrello = await strapi.entityService.create('api::carrello.carrello', {
          data: {
            cliente: clienteId,
            publishedAt: new Date(),
          },
        });

        await strapi.entityService.create('api::item-carrello.item-carrello', {
          data: {
            carrello: carrello.id,
            prodotto: prodottoId,
            quantita,
            publishedAt: new Date(), 
          },
        });
      } else {
        if (carrello.item_carrelli && carrello.item_carrelli.length > 0) {
          const itemEsistente = carrello.item_carrelli.find(item => item.prodotto && item.prodotto.id === prodottoId);

          if (itemEsistente) {
            await strapi.entityService.update('api::item-carrello.item-carrello', itemEsistente.id, {
              data: {
                quantita: itemEsistente.quantita + quantita,
                publishedAt: new Date(),
              },
            });
          } else {
            await strapi.entityService.create('api::item-carrello.item-carrello', {
              data: {
                carrello: carrello.id,
                prodotto: prodottoId,
                quantita,
                publishedAt: new Date(),
              },
            });
          }
        } else {
          await strapi.entityService.create('api::item-carrello.item-carrello', {
            data: {
              carrello: carrello.id,
              prodotto: prodottoId,
              quantita,
              publishedAt: new Date(),
            },
          });
        }
      }

      ctx.send({ message: 'Prodotto aggiunto al carrello con successo!' });
    } catch (error) {
      ctx.throw(500, 'Errore durante l\'aggiunta del prodotto al carrello.');
    }
  },

  async addToWishlist(ctx) {
    const { clienteId, prodottoId } = ctx.request.body;

    try {
      // Trova il cliente
      const cliente = await strapi.entityService.findOne('api::cliente.cliente', clienteId, {
        populate: ['preferiti'],
      });
      if (!cliente) {
        return ctx.throw(404, 'Cliente non trovato');
      }

      // Trova il prodotto
      const prodotto = await strapi.entityService.findOne('api::prodotto.prodotto', prodottoId);
      if (!prodotto) {
        return ctx.throw(404, 'Prodotto non trovato');
      }

      // Trova la wishlist esistente del cliente
      let preferiti = cliente.preferiti && cliente.preferiti.length > 0 ? cliente.preferiti[0] : null;

      if (!preferiti) {
        preferiti = await strapi.entityService.create('api::preferito.preferito', {
          data: {
            cliente: clienteId,
            prodotti: [prodottoId],
            publishedAt: new Date(),
          },
        });
      } else {
        const prodotti = preferiti.prodotti || [];
        if (!prodotti.some(p => p.id === prodottoId)) {
          await strapi.entityService.update('api::preferito.preferito', preferiti.id, {
            data: {
              prodotti: [...prodotti, prodottoId],
              publishedAt: new Date(),
            },
          });
        }
      }

      ctx.send({ message: 'Prodotto aggiunto alla wishlist con successo!' });
    } catch (error) {
      ctx.throw(500, 'Errore durante l\'aggiunta del prodotto alla wishlist.');
    }
  },

  async removeFromCart(ctx) {
    const { clienteId, prodottoId, quantita } = ctx.request.body;
  
    try {
      // Trova il cliente e popola il carrello e i prodotti nel carrello
      const cliente = await strapi.entityService.findOne('api::cliente.cliente', clienteId, {
        populate: {
          carrello: {
            populate: ['item_carrelli', 'item_carrelli.prodotto'],
          },
        },
      });
  
      if (!cliente || !cliente.carrello) {
        return ctx.throw(404, 'Carrello non trovato');
      }
  
      const carrello = cliente.carrello;
  
      // Trova il prodotto nel carrello
      const itemEsistente = carrello.item_carrelli.find(item => item.prodotto.id === prodottoId);
      
      if (!itemEsistente) {
        return ctx.throw(404, 'Prodotto non trovato nel carrello');
      }
  
      // Riduci la quantità del prodotto
      const nuovaQuantita = itemEsistente.quantita - quantita;
  
      if (nuovaQuantita > 0) {
        // Aggiorna la quantità se è maggiore di 0
        await strapi.entityService.update('api::item-carrello.item-carrello', itemEsistente.id, {
          data: {
            quantita: nuovaQuantita,
            publishedAt: new Date(),
          },
        });
      } else {
        // Elimina l'item dal carrello se la quantità è 0 o meno
        await strapi.entityService.delete('api::item-carrello.item-carrello', itemEsistente.id);
      }
  
      // Controlla se il carrello è vuoto dopo la rimozione
      const carrelloAggiornato = await strapi.entityService.findOne('api::carrello.carrello', carrello.id, {
        populate: { item_carrelli: true },
      });
  
      if (!carrelloAggiornato.item_carrelli.length) {
        // Elimina il carrello se è vuoto
        await strapi.entityService.delete('api::carrello.carrello', carrello.id);
      }
  
      ctx.send({ message: 'Prodotto rimosso dal carrello con successo!' });
    } catch (error) {
      ctx.throw(500, 'Errore durante la rimozione del prodotto dal carrello.');
    }
  },

  async removeFromWishlist(ctx) {
    const { clienteId, prodottoId } = ctx.request.body;
  
    try {
      // Trova il cliente con la relazione 'preferiti'
      const cliente = await strapi.entityService.findOne('api::cliente.cliente', clienteId, {
        populate: ['preferiti', 'preferiti.prodotti'],
      });
      
      if (!cliente) {
        return ctx.throw(404, 'Cliente non trovato');
      }
  
      // Trova la wishlist
      // @ts-ignore
      const preferiti = cliente.preferiti.length > 0 ? cliente.preferiti[0] : null;
      
      if (!preferiti || !Array.isArray(preferiti.prodotti) || preferiti.prodotti.length === 0) {
        return ctx.throw(404, 'Nessun prodotto nella wishlist.');
      }
  
      // Cerca il prodotto nella wishlist
      const prodottiAggiornati = preferiti.prodotti.filter(p => p.id !== prodottoId);
  
      if (prodottiAggiornati.length === preferiti.prodotti.length) {
        return ctx.throw(404, 'Prodotto non trovato nella wishlist.');
      }
  
      // Aggiorna la wishlist rimuovendo il prodotto specificato
      await strapi.entityService.update('api::preferito.preferito', preferiti.id, {
        data: {
          prodotti: prodottiAggiornati,
        },
      });
  
      ctx.send({ message: 'Prodotto rimosso dalla wishlist con successo!' });
    } catch (error) {
      ctx.throw(500, 'Errore durante la rimozione del prodotto dalla wishlist.');
    }
  }
};
