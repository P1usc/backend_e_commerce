module.exports = {
  async trovaSconti(ctx) {
    try {
      const now = new Date();
      const dataFormattata = now.toISOString().split('T')[0];  // Estrai solo la parte YYYY-MM-DD

      // Trova i prodotti con sconto attivo
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
        },
      });

      if (!prodotti || prodotti.length === 0) {
        return ctx.send({ message: "Nessun prodotto scontato trovato" });
      }
      const scontoprodotti = prodotti.map(product => {
      const sconto = product.sconto ? product.sconto.sconto : 0;
      const scontoPrezzo = product.costo - (product.costo * (sconto / 100));

        return {
          nome: product.nome,
          costoOriginale: product.costo,
          scontoPercentuale: sconto,
          prezzoScontato: scontoPrezzo,
          shortdescrizione: product.shortdescrizione,
          longdescrizione: product.longdescrizione,
          categoria: product.categoria,
          lunghezza: product.lunghezza,
          sesso: product.sesso,
          Taglia: product.Taglia,
          Colore: product.Colore,
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
};
