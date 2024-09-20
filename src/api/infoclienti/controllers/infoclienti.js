module.exports = {
  async getAll(ctx) {
    try {
      const logins = await strapi.db.query('api::account.account').findMany({
        populate: {
          cliente: {
            populate: {
              preferiti: {
                populate: ['prodotti'],
              },
              carrello: {
                populate: {
                  item_carrelli: {
                    populate: ['prodotto'],
                  },
                },
              },
            },
          },
        },
      });

      const result = logins.map(login => {
        const cliente = login.cliente || {};
        const carrello = cliente.carrello || {};

        const totaleCarrello = carrello.item_carrelli?.reduce((total, item) => {
          const costoProdotto = item.prodotto ? item.prodotto.costo : 0;
          return total + (costoProdotto * (item.quantita || 1));
        }, 0) || 0;

        return {
          account: {
            id: login.id,
            username: login.username,
            email: login.email,
          },
          cliente: {
            id: cliente.id,
            nome: cliente.nome,
            cognome: cliente.cognome,
            indirizzo: cliente.indirizzo,
            telefono: cliente.telefono,
            imgprofile: cliente.imgprofile,
            preferiti: cliente.preferiti?.map(preferito => ({
              id: preferito.id,
              prodotti: preferito.prodotti?.map(prodotto => ({
                id: prodotto.id,
                nome: prodotto.nome,
                costo: prodotto.costo,
              })) || [],
            })) || [],
            carrello: {
              id: carrello.id,
              item_carrelli: carrello.item_carrelli?.map(item => ({
                id: item.id,
                quantita: item.quantita,
                prodotto: item.prodotto ? {
                  id: item.prodotto.id,
                  nome: item.prodotto.nome,
                  costo: item.prodotto.costo,
                } : null,
              })) || [],
              totale: totaleCarrello,
            },
          },
        };
      });

      ctx.send(result);
    } catch (error) {
      console.error('Errore:', error);
      ctx.internalServerError('Errore durante il recupero delle informazioni del cliente');
    }
  },

  async findOne(ctx) {
    try {
      const { id } = ctx.params;

      const login = await strapi.db.query('api::account.account').findOne({
        where: { id },
        populate: {
          cliente: {
            populate: {
              preferiti: {
                populate: ['prodotti'],
              },
              carrello: {
                populate: {
                  item_carrelli: {
                    populate: ['prodotto'],
                  },
                },
              },
            },
          },
        },
      });

      if (!login) {
        return ctx.notFound('Account non trovato');
      }

      const cliente = login.cliente || {};
      const carrello = cliente.carrello || {};

      const totaleCarrello = carrello.item_carrelli?.reduce((total, item) => {
        const costoProdotto = item.prodotto ? item.prodotto.costo : 0;
        return total + (costoProdotto * (item.quantita || 1));
      }, 0) || 0;

      const result = {
        account: {
          id: login.id,
          username: login.username,
          email: login.email,
        },
        cliente: {
          id: cliente.id,
          nome: cliente.nome,
          cognome: cliente.cognome,
          indirizzo: cliente.indirizzo,
          telefono: cliente.telefono,
          imgprofile: cliente.imgprofile,
          preferiti: cliente.preferiti?.map(preferito => ({
            id: preferito.id,
            prodotti: preferito.prodotti?.map(prodotto => ({
              id: prodotto.id,
              nome: prodotto.nome,
              costo: prodotto.costo,
            })) || [],
          })) || [],
          carrello: {
            id: carrello.id,
            item_carrelli: carrello.item_carrelli?.map(item => ({
              id: item.id,
              quantita: item.quantita,
              prodotto: item.prodotto ? {
                id: item.prodotto.id,
                nome: item.prodotto.nome,
                costo: item.prodotto.costo,
              } : null,
            })) || [],
            totale: totaleCarrello,
          },
        },
      };

      ctx.send(result);
    } catch (error) {
      console.error('Errore:', error);
      ctx.internalServerError('Errore durante il recupero delle informazioni del cliente');
    }
  },
};
