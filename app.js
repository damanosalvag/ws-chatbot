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
const main = async () => {
  const adapterDB = new MockAdapter();
  const adapterFlow = createFlow([flowPrincipal, flowWelcome]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
