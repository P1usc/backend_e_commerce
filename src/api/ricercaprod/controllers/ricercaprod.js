'use strict';
const axios = require('axios'); // Ensure axios is imported

module.exports = {
  async cercaprod(ctx) {
    const { valore, genere } = ctx.query;

    const validGeneri = ['Uomo', 'Donna', 'Accessorio'];
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
        const discountedResponse = await axios.get('http://localhost:1337/api/prodotti-scontati/');
        const discountedIds = discountedResponse.data.map(prod => prod.id);

        // Fetch products based on filters
        const prodotti = await strapi.entityService.findMany('api::prodotto.prodotto', {
            filters,
            fields: ['id', 'nome', 'marca', 'categoria', 'shortdescrizione', 'costo'], // Removed 'sconto'
            populate: {
                pngProd: {
                    fields: ['url'],
                },
                // Populate sconto if it's a relation
                sconto: true,
            },
        });

        // Modify products to include costoOriginale, prezzoScontato, and discount info
        const prodottiModificati = prodotti.map(prodotto => {
            // @ts-ignore
            const isDiscounted = discountedIds.includes(prodotto.id);
            // @ts-ignore
            const scontoInfo = isDiscounted && prodotto.sconto && prodotto.sconto.attiva
                ? {
                    attiva: true,
                    // @ts-ignore
                    nome: prodotto.sconto.nome,
                    // @ts-ignore
                    descrizione: prodotto.sconto.descrizione,
                    // @ts-ignore
                    sconto: prodotto.sconto.sconto,
                    // @ts-ignore
                    inizio: prodotto.sconto.inizio,
                    // @ts-ignore
                    fine: prodotto.sconto.fine,
                }
                : null;

            // Calculate the discounted price if applicable
            const prezzoScontato = scontoInfo
                // @ts-ignore
                ? (prodotto.costo * (1 - scontoInfo.sconto / 100)).toFixed(2) // Apply discount
                // @ts-ignore
                : prodotto.costo.toFixed(2); // No discount, use original cost

            return {
                // @ts-ignore
                ...prodotto,
                // @ts-ignore
                costoOriginale: prodotto.costo.toFixed(2), // Keep the original cost as a string
                prezzoScontato: prezzoScontato, // Add discounted price
                sconto: scontoInfo // Include the discount info if available
            };
        });

        return prodottiModificati;
    } catch (err) {
        ctx.throw(500, `Errore durante la ricerca dei prodotti: ${err.message}`);
    }
},
  // @ts-ignore
  async prodottiPerTipoECategoria(ctx) {


      // @ts-ignore
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
          // @ts-ignore
          const prodottiConSconto = prodotti.map(prodotto => {
              // Check if costo is valid
              const costo = prodotto.costo !== null ? prodotto.costo : 0; // Default to 0 if costo is null
              const prezzoScontato = prodotto.sconto && prodotto.sconto.attiva
                  ? costo * (1 - prodotto.sconto.sconto / 100)
                  : costo;













              return {
                  ...prodotto,
                  prezzoScontato: prezzoScontato.toFixed(2),
                  sconto: prodotto.sconto && prodotto.sconto.attiva ? {
                      nome: prodotto.sconto.nome,
                      descrizione: prodotto.sconto.descrizione,
                      sconto: prodotto.sconto.sconto,
                      inizio: prodotto.sconto.inizio,
                      fine: prodotto.sconto.fine
                  } : null
              };
          });








          return prodottiConSconto;
      } catch (err) {
          console.error('Error in prodottiPerTipoECategoria:', err);
          // @ts-ignore
          ctx.throw(500, `Errore durante la ricerca dei prodotti: ${err.message}`);
      }
  }// @ts-ignore
};
