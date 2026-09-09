/* Not Luck — brand + catalog + coin-economy data. IIFE, no ES modules (file:// safe). */
(function () {
  "use strict";

  window.__NTL__ = {
    brand: {
      name: "Not Luck",
      short: "NTL",
      tagline: "No dejamos nada al azar.",
      founded: "2026",
    },

    /* Streetwear catalog. Priced only in NTL Coins — there is no cash price on a garment. */
    products: [
      {
        id: "cap-blackout",
        name: "Blackout Cap",
        category: "Gorra",
        price: 180,
        img: "cap",
        blurb: "Six panels, visera curva, bordado tonal 3D.",
        desc: "Gorra de seis paneles en drill pesado con bordado tonal 3D y cierre metálico grabado. La pieza de entrada a la colección — la primera que todo el mundo se lleva.",
      },
      {
        id: "tee-riptide",
        name: "Riptide Tee",
        category: "Camiseta",
        price: 320,
        img: "tee",
        blurb: "240gsm, corte boxy, print a una tinta.",
        desc: "Camiseta boxy en algodón peinado de 240gsm. Print a una tinta en el pecho, etiqueta tejida en el bajo. Lavado en frío, se queda como el primer día.",
      },
      {
        id: "cargo-slipstream",
        name: "Slipstream Cargo",
        category: "Pantalón",
        price: 470,
        img: "cargo",
        blurb: "Ripstop técnico, bolsillos utility, ajuste cónico.",
        desc: "Pantalón cargo en ripstop técnico resistente al agua. Seis bolsillos utility, cintura ajustable, tobillo cónico con cremallera oculta.",
      },
      {
        id: "hoodie-undertow",
        name: "Undertow Hoodie",
        category: "Sudadera",
        price: 560,
        img: "hoodie",
        blurb: "480gsm, forro de rizo, capucha triple capa.",
        desc: "Sudadera pesada de 480gsm con forro de rizo cepillado. Capucha de triple capa con cordón metálico, bolsillo canguro reforzado. La talla que no se presta.",
      },
      {
        id: "jacket-deepcurrent",
        name: "Deep Current Jacket",
        category: "Chaqueta",
        price: 890,
        img: "jacket",
        blurb: "Shell técnico, costuras selladas, forro térmico.",
        desc: "Chaqueta shell técnica con costuras termoselladas y forro térmico desmontable. Edición limitada — solo se reabastece cuando el lote lo permite.",
      },
    ],

    /* NTL Coins — the only currency this store accepts for garments.
       Packs are calibrated to one piece each; the remainder is by design
       (a few coins short of the next size up), so keep the change coming. */
    packs: [
      { id: "pack-spark", name: "Pack Spark", coins: 200, price: 12.99, tag: "Primer lote" },
      { id: "pack-surge", name: "Pack Surge", coins: 350, price: 19.99, tag: "Más popular" },
      { id: "pack-current", name: "Pack Current", coins: 500, price: 26.99, tag: "" },
      { id: "pack-tide", name: "Pack Tide", coins: 600, price: 32.99, tag: "" },
      { id: "pack-deep", name: "Pack Deep", coins: 950, price: 49.99, tag: "Mejor valor" },
    ],

    coinExchangeNote: "1 NTL Coin ≈ valor interno de colección — no reembolsable, no transferible entre cuentas.",
  };
})();
