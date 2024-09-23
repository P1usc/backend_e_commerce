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
  

  
  async prodottiPerTipoECategoria(ctx) {
    const { tipo, categoria, nuovo, sconti } = ctx.query;

    const validTipi = ['Uomo', 'Donna', 'Accessorio', 'All'];
    const validCategorie = ['Pantalone', 'T-shirt', 'Felpa', 'Camicia', 'Accessorio', 'All'];

    // Controlla la validità del tipo
    if (tipo && tipo !== 'All' && !validTipi.includes(tipo)) {
        return ctx.badRequest('Tipo non valido');
    }

    // Controlla la validità della categoria
    if (categoria && categoria !== 'All' && !validCategorie.includes(categoria)) {
        return ctx.badRequest('Categoria non valida');
    }

    let filters = {};

    // Aggiungi filtro per tipo
    if (tipo && tipo !== 'All') {
        filters.tipo = tipo;
    }

    // Aggiungi filtro per categoria
    if (categoria && categoria !== 'All') {
        filters.categoria = categoria;
    }

    // Filtro per prodotti nuovi
    if (nuovo === 'true') {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 30);
        filters.createdAt = { $gte: pastDate };
    }

    // Filtro per sconti attivi
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

        // Logica per calcolare il prezzo scontato
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
        console.error('Error in prodottiPerTipoECategoria:', err);
        ctx.throw(500, `Errore durante la ricerca dei prodotti: ${err.message}`);
    }
}
};
