const {
  createBot,
  createProvider,
  createFlow,
  addKeyword,
  EVENTS,
} = require("@bot-whatsapp/bot");
require("dotenv").config();

const QRPortalWeb = require("@bot-whatsapp/portal");
const BaileysProvider = require("@bot-whatsapp/provider/baileys");
//const MockAdapter = require("@bot-whatsapp/database/mock");
const MongoAdapter = require("@bot-whatsapp/database/mongo");
const { delay } = require("@whiskeysockets/baileys");

const path = require("path");
const fs = require("fs");
const chat = require("./chatgpt");

const menuPath = path.join(__dirname, "mensajes", "menu.txt");
const menu = fs.readFileSync(menuPath, "utf8");

const consultasPath = path.join(__dirname, "mensajes", "promptConsultas.txt");
const promptConsultas = fs.readFileSync(consultasPath, "utf8");

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

const flowMenuRest = addKeyword(EVENTS.ACTION).addAnswer("Este es el menu", {
  media: "https://www.elcorral.com/pdf/EC_Menu_Digital.pdf",
});
const flowReservar = addKeyword(EVENTS.ACTION).addAnswer(
  "Reservas en: www.rubyk.shop"
);
const flowConsultas = addKeyword(EVENTS.ACTION)
  .addAnswer("Consultas")
  .addAnswer(
    "Ingresa tu consulta",
    {
      capture: true,
    },
    async (ctx, ctxFn) => {
      const prompt = promptConsultas;
      const consulta = ctx.body;
      const answer = await chat(prompt, consulta);
      await ctxFn.flowDynamic(answer.content);
    }
  );

const menuFlow = addKeyword("Menu").addAnswer(
  menu,
  { capture: true },
  async (ctx, { gotoFlow, fallBack, flowDynamic }) => {
    if (!["1", "2", "3", "0"].includes(ctx.body)) {
      return fallBack(
        "Respuesta no valida, por favor selecciona una de las opciones."
      );
    }
    switch (ctx.body) {
      case "1":
        return gotoFlow(flowMenuRest);
      case "2":
        return gotoFlow(flowReservar);
      case "3":
        return gotoFlow(flowConsultas);
      case "0":
        return await flowDynamic(
          "Saliendo... Puedes volver a acceder a este menu escribiendo '*Menu*' "
        );
    }
  }
);

const main = async () => {
  const adapterDB = new MongoAdapter({
    dbUri: process.env.MONGO_DB_URI,
    dbName: "chat-ws",
  });
  const adapterFlow = createFlow([
    flowMenuRest,
    flowWelcome,
    menuFlow,
    flowReservar,
    flowConsultas,
  ]);
  const adapterProvider = createProvider(BaileysProvider);

  createBot({
    flow: adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  QRPortalWeb();
};

main();
