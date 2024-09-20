'use strict';

module.exports = {
  async cercaprod(ctx) {
    const { valore, genere } = ctx.query;
  
    const validGeneri = ['Uomo', 'Donna', 'Accessorio'];
  
    // Crea il filtro condizionale
    const filters = {};
  
    if (valore) {
      filters.$or = [
        { nome: { $contains: valore } }, 
        { marca: { $contains: valore } }  
      ];
    }
  
    if (genere && validGeneri.includes(genere)) {
      filters.tipo = genere;
    }
  
    try {
      
      const prodotti = await strapi.entityService.findMany('api::prodotto.prodotto', {
        filters,
        fields: ['nome', 'marca', 'categoria', 'shortdescrizione', 'costo'],
        populate: {
          pngProd: {
            fields: ['url'],  
          },
        },
      });
  
      return prodotti;
    } catch (err) {
      ctx.throw(500, `Errore durante la ricerca dei prodotti: ${err.message}`);
    }
  },
  

  
  async prodottiPerGenere(ctx) {
    const { genere, categoria, nuovo, sconti } = ctx.query;
  
    const validGeneri = ['Uomo', 'Donna', 'Accessorio', 'All'];
    const validCategorie = ['Pantalone', 'T-shirt', 'Felpa', 'Camicia', 'Accessorio', 'All'];
  
    if (genere && !validGeneri.includes(genere)) {
      return ctx.badRequest('Genere non valido');
    }
  
    let filters = {};
  
    if (genere && genere !== 'All') {
      filters.tipo = genere;
    }
  
    if (categoria && categoria !== 'All' && validCategorie.includes(categoria)) {
      filters.categoria = categoria;
    }
  
    if (nuovo === 'true') {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 30); 
      filters.createdAt = { $gte: pastDate };
    }
  

    if (sconti === 'true') {
      filters['sconto.attiva'] = true;
    }
  
    try {
      const prodotti = await strapi.entityService.findMany('api::prodotto.prodotto', {
        filters,
        populate: {
          sconto: true,
          pngProd: {
            fields: ['url']  
          },
        },
        fields: ['nome', 'marca', 'categoria', 'shortdescrizione', 'costo', 'tipo'],
      });
  
      // Calcola e formatta il prezzo scontato
      const prodottiConSconto = prodotti.map(prodotto => {
        if (prodotto.sconto && prodotto.sconto.attiva) {
          const scontoPercentuale = prodotto.sconto.sconto;
          const prezzoScontato = prodotto.costo * (1 - scontoPercentuale / 100);
          return {
            ...prodotto,
            prezzoScontato: prezzoScontato.toFixed(2),
            sconto: {
              nome: prodotto.sconto.nome,
              descrizione: prodotto.sconto.descrizione,
              sconto: prodotto.sconto.sconto,
              inizio: prodotto.sconto.inizio,
              fine: prodotto.sconto.fine
            }
          };
        }
        return {
          ...prodotto,
          prezzoScontato: prodotto.costo.toFixed(2),
          sconto: null
        };
      });
  
      return prodottiConSconto;
    } catch (err) {
      console.error('Error in prodottiPerGenere:', err);
      ctx.throw(500, `Errore durante la ricerca dei prodotti per genere: ${err.message}`);
    }
  }
  
};
