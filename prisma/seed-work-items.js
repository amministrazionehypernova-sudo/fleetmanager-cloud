const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const workItems = [
  // Tagliando / manutenzione ordinaria
  { name: "Cambio olio motore", category: "Tagliando" },
  { name: "Cambio filtro olio", category: "Tagliando" },
  { name: "Cambio filtro aria", category: "Tagliando" },
  { name: "Cambio filtro abitacolo", category: "Tagliando" },
  { name: "Cambio filtro carburante", category: "Tagliando" },
  { name: "Cambio filtro gasolio", category: "Tagliando" },
  { name: "Controllo livelli", category: "Tagliando" },
  { name: "Rabbocco olio motore", category: "Tagliando" },
  { name: "Rabbocco liquido refrigerante", category: "Tagliando" },
  { name: "Rabbocco liquido lavavetri", category: "Tagliando" },
  { name: "Rabbocco liquido freni", category: "Tagliando" },
  { name: "Controllo generale veicolo", category: "Tagliando" },
  { name: "Diagnosi elettronica", category: "Tagliando" },
  { name: "Reset service", category: "Tagliando" },

  // Motore
  { name: "Controllo motore", category: "Motore" },
  { name: "Riparazione motore", category: "Motore" },
  { name: "Sostituzione supporti motore", category: "Motore" },
  { name: "Pulizia corpo farfallato", category: "Motore" },
  { name: "Pulizia iniettori", category: "Motore" },
  { name: "Sostituzione iniettori", category: "Motore" },
  { name: "Sostituzione candele", category: "Motore" },
  { name: "Sostituzione candelette", category: "Motore" },
  { name: "Sostituzione bobine accensione", category: "Motore" },
  { name: "Sostituzione pompa acqua", category: "Motore" },
  { name: "Sostituzione radiatore", category: "Motore" },
  { name: "Sostituzione termostato", category: "Motore" },
  { name: "Sostituzione manicotti", category: "Motore" },

  // Distribuzione / cinghie
  { name: "Cambio cinghia distribuzione", category: "Distribuzione" },
  { name: "Cambio catena distribuzione", category: "Distribuzione" },
  { name: "Cambio cinghia servizi", category: "Distribuzione" },
  { name: "Cambio tendicinghia", category: "Distribuzione" },
  { name: "Controllo distribuzione", category: "Distribuzione" },

  // Freni
  { name: "Cambio pastiglie freni anteriori", category: "Freni" },
  { name: "Cambio pastiglie freni posteriori", category: "Freni" },
  { name: "Cambio dischi freni anteriori", category: "Freni" },
  { name: "Cambio dischi freni posteriori", category: "Freni" },
  { name: "Cambio ganasce freni", category: "Freni" },
  { name: "Cambio tamburi freni", category: "Freni" },
  { name: "Cambio liquido freni", category: "Freni" },
  { name: "Controllo impianto frenante", category: "Freni" },
  { name: "Riparazione pinze freno", category: "Freni" },
  { name: "Sostituzione pinze freno", category: "Freni" },
  { name: "Regolazione freno a mano", category: "Freni" },

  // Pneumatici / assetto
  { name: "Cambio pneumatici", category: "Pneumatici" },
  { name: "Montaggio pneumatici", category: "Pneumatici" },
  { name: "Smontaggio pneumatici", category: "Pneumatici" },
  { name: "Inversione pneumatici", category: "Pneumatici" },
  { name: "Equilibratura pneumatici", category: "Pneumatici" },
  { name: "Convergenza", category: "Pneumatici" },
  { name: "Controllo pressione pneumatici", category: "Pneumatici" },
  { name: "Riparazione foratura", category: "Pneumatici" },
  { name: "Sostituzione valvole pneumatici", category: "Pneumatici" },
  { name: "Cambio gomme estive", category: "Pneumatici" },
  { name: "Cambio gomme invernali", category: "Pneumatici" },

  // Sospensioni / sterzo
  { name: "Controllo sospensioni", category: "Sospensioni" },
  { name: "Cambio ammortizzatori anteriori", category: "Sospensioni" },
  { name: "Cambio ammortizzatori posteriori", category: "Sospensioni" },
  { name: "Cambio molle sospensioni", category: "Sospensioni" },
  { name: "Cambio bracci oscillanti", category: "Sospensioni" },
  { name: "Cambio testine sterzo", category: "Sospensioni" },
  { name: "Cambio tiranti sterzo", category: "Sospensioni" },
  { name: "Controllo scatola sterzo", category: "Sospensioni" },
  { name: "Riparazione servosterzo", category: "Sospensioni" },

  // Trasmissione / frizione
  { name: "Cambio frizione", category: "Trasmissione" },
  { name: "Cambio volano", category: "Trasmissione" },
  { name: "Controllo cambio", category: "Trasmissione" },
  { name: "Cambio olio cambio", category: "Trasmissione" },
  { name: "Riparazione cambio", category: "Trasmissione" },
  { name: "Sostituzione semiassi", category: "Trasmissione" },
  { name: "Sostituzione giunti omocinetici", category: "Trasmissione" },

  // Elettrico / batteria
  { name: "Cambio batteria", category: "Elettrico" },
  { name: "Controllo batteria", category: "Elettrico" },
  { name: "Controllo alternatore", category: "Elettrico" },
  { name: "Sostituzione alternatore", category: "Elettrico" },
  { name: "Controllo motorino avviamento", category: "Elettrico" },
  { name: "Sostituzione motorino avviamento", category: "Elettrico" },
  { name: "Controllo impianto elettrico", category: "Elettrico" },
  { name: "Riparazione impianto elettrico", category: "Elettrico" },
  { name: "Cambio lampadine", category: "Elettrico" },
  { name: "Controllo luci", category: "Elettrico" },
  { name: "Sostituzione fari", category: "Elettrico" },
  { name: "Sostituzione tergicristalli", category: "Elettrico" },

  // Climatizzazione
  { name: "Ricarica aria condizionata", category: "Climatizzazione" },
  { name: "Controllo climatizzatore", category: "Climatizzazione" },
  { name: "Igienizzazione impianto clima", category: "Climatizzazione" },
  { name: "Sostituzione compressore clima", category: "Climatizzazione" },
  { name: "Riparazione climatizzatore", category: "Climatizzazione" },

  // Scarico / emissioni
  { name: "Controllo scarico", category: "Scarico" },
  { name: "Sostituzione marmitta", category: "Scarico" },
  { name: "Sostituzione catalizzatore", category: "Scarico" },
  { name: "Pulizia FAP/DPF", category: "Scarico" },
  { name: "Rigenerazione FAP/DPF", category: "Scarico" },
  { name: "Sostituzione sonda lambda", category: "Scarico" },
  { name: "Controllo emissioni", category: "Scarico" },

  // Carrozzeria
  { name: "Riparazione carrozzeria", category: "Carrozzeria" },
  { name: "Verniciatura", category: "Carrozzeria" },
  { name: "Sostituzione paraurti", category: "Carrozzeria" },
  { name: "Sostituzione specchietto", category: "Carrozzeria" },
  { name: "Riparazione portiera", category: "Carrozzeria" },
  { name: "Sostituzione parabrezza", category: "Carrozzeria" },
  { name: "Riparazione cristalli", category: "Carrozzeria" },

  // Interni / accessori
  { name: "Riparazione sedili", category: "Interni" },
  { name: "Riparazione serrature", category: "Interni" },
  { name: "Riparazione alzacristalli", category: "Interni" },
  { name: "Installazione accessori", category: "Interni" },
  { name: "Installazione GPS", category: "Interni" },
  { name: "Installazione dashcam", category: "Interni" },

  // Pulizia
  { name: "Lavaggio esterno", category: "Pulizia" },
  { name: "Lavaggio interno", category: "Pulizia" },
  { name: "Lavaggio completo", category: "Pulizia" },
  { name: "Sanificazione abitacolo", category: "Pulizia" },
  { name: "Pulizia tappezzeria", category: "Pulizia" },

  // Controlli
  { name: "Controllo pre-revisione", category: "Controlli" },
  { name: "Controllo sicurezza", category: "Controlli" },
  { name: "Controllo liquidi", category: "Controlli" },
  { name: "Controllo freni", category: "Controlli" },
  { name: "Controllo pneumatici", category: "Controlli" },
  { name: "Controllo documenti veicolo", category: "Controlli" },

  // Altro
  { name: "Soccorso stradale", category: "Altro" },
  { name: "Traino veicolo", category: "Altro" },
  { name: "Manodopera generica", category: "Altro" },
  { name: "Ricambi vari", category: "Altro" },
  { name: "Altro intervento", category: "Altro" },
];

async function main() {
  for (const item of workItems) {
    await prisma.workItem.upsert({
      where: {
        name: item.name,
      },
      update: {
        category: item.category,
      },
      create: item,
    });
  }

  console.log("Lista lavori creata/aggiornata.");
  console.log(`Totale lavori: ${workItems.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    prisma.$disconnect();
  });