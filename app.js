const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
const MockAdapter = require("@bot-whatsapp/database/mock");
const { delay } = require("@whiskeysockets/baileys");

const path = require("path");
const fs = require("fs");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

const flowPrincipal = addKeyword(["hola", "ole", "alo"]).addAnswer(
  "Hola buenos dias"
);
const flowWelcome = addKeyword(EVENTS.WELCOME).addAnswer(
  "Este es el flujo welcome",
  {
    delay: 500,
    // media:
    //   "https://farallonesdelcitara.bioexploradores.com/wp-content/uploads/2024/01/Portada-Sciurus-granatensis-Ardilla-de-cola-roja-Red-tailed-Squirrel-1201x631.jpg",
  },
  async (ctx, ctxFn) => {
    if (ctx.body.includes("casas")) {
      await ctxFn.flowDynamic("escribiste casas");
    } else {
      await ctxFn.flowDynamic("escribiste otra cosa");
    }
  }
);

const menuFlow = addKeyword("Menu").addAnswer(
  menu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (!["1", "2", "3", "4", "5", "0"].includes(ctx.body)) {
      return fallBack(
        "Respuesta no valida, por favor selecciona una de las opciones."
      );
    }
    switch (ctx.body) {
      case "1":
        return await flowDynamic("Esta es la opcion 1");
      case "2":
        return await flowDynamic("Esta es la opcion 2");
      case "3":
        return await flowDynamic("Esta es la opcion 3");
      case "4":
        return await flowDynamic("Esta es la opcion 4");
      case "5":
        return await flowDynamic("Esta es la opcion 5");
      case "0":
        return await flowDynamic(
          "Saliendo... Puedes volver a acceder a este menu escribiendo '*Menu*' "
        );
    }
  }
);

const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal, flowWelcome, menuFlow]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
