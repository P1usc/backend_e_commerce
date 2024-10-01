module.exports = {
  async trovaSconti(ctx) {
    try {
      const now = new Date();
      const dataFormattata = now.toISOString().split('T')[0]; // Estrai solo la parte YYYY-MM-DD

      // Trova i prodotti con sconto attivo e popola l'immagine
      const prodotti = await strapi.db.query('api::prodotto.prodotto').findMany({
        where: {
          sconto: {
            attiva: true,
            inizio: { $lte: dataFormattata },
            fine: { $gte: dataFormattata },
          }
        },
        populate: {
          sconto: true,
          pngProd: {
            fields: ['url'], // Popola solo il campo URL dell'immagine
          },
        },
      });

      if (!prodotti || prodotti.length === 0) {
        return ctx.send({ message: "Nessun prodotto scontato trovato" });
      }

      const scontoprodotti = prodotti.map(product => {
        const scontoPercentuale = product.sconto ? product.sconto.sconto : 0;
        const prezzoScontato = product.costo - (product.costo * (scontoPercentuale / 100));

        return {
          id: product.id,
          nome: product.nome,
          costoOriginale: product.costo,
          scontoPercentuale,
          prezzoScontato,
          shortdescrizione: product.shortdescrizione,
          longdescrizione: product.longdescrizione,
          categoria: product.categoria,
          lunghezza: product.lunghezza,
          sesso: product.sesso,
          taglia: product.taglia, // Corretto per coerenza
          colore: product.colore, // Corretto per coerenza
          url: product.pngProd ? product.pngProd.url : null, // Includi l'URL dell'immagine
          sconto: {
            nome: product.sconto?.nome,
            descrizione: product.sconto?.descrizione,
            inizio: product.sconto?.inizio,
            fine: product.sconto?.fine,
            attiva: product.sconto?.attiva,
          }
        };
      });

      return ctx.send(scontoprodotti);
    } catch (error) {
      strapi.log.error('Errore nel recupero dei prodotti scontati:', error);
      return ctx.badRequest('Errore nel recupero dei prodotti scontati');
    }
  },

  async trovaProdottoPerId(ctx) {
    try {
      const { id } = ctx.params;
      console.log("Richiesta di prodotto per ID:", id); // Log ID

      const prodotto = await strapi.db.query('api::prodotto.prodotto').findOne({
        where: { id },
        populate: {
          sconto: true,
          pngProd: {
            fields: ['url'], // Popola solo il campo URL dell'immagine
          },
        },
      });

      // Aggiungi un log per controllare l'output del prodotto
      console.log("Prodotto recuperato:", prodotto);

      if (!prodotto) {
        console.log("Prodotto non trovato per ID:", id); // Log non trovato
        return ctx.send({ message: "Prodotto non trovato" });
      }

      const scontoPercentuale = prodotto.sconto ? prodotto.sconto.sconto : 0;
      const prezzoScontato = prodotto.costo - (prodotto.costo * (scontoPercentuale / 100));

      return ctx.send({
        id: prodotto.id,
        nome: prodotto.nome,
        costoOriginale: prodotto.costo,
        scontoPercentuale,
        prezzoScontato,
        shortdescrizione: prodotto.shortdescrizione,
        longdescrizione: prodotto.longdescrizione,
        categoria: prodotto.categoria,
        lunghezza: prodotto.lunghezza,
        sesso: prodotto.sesso,
        taglia: prodotto.taglia, // Corretto per coerenza
        colore: prodotto.colore, // Corretto per coerenza
        url: prodotto.pngProd ? prodotto.pngProd.url : null, // Includi l'URL dell'immagine
        sconto: {
          nome: prodotto.sconto?.nome,
          descrizione: prodotto.sconto?.descrizione,
          inizio: prodotto.sconto?.inizio,
          fine: prodotto.sconto?.fine,
          attiva: prodotto.sconto?.attiva,
        }
      });
    } catch (error) {
      strapi.log.error('Errore nel recupero del prodotto per ID:', error);
      return ctx.badRequest('Errore nel recupero del prodotto');
    }
  }
};
