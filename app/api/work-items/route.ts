import { NextResponse } from "next/server";

const workItems = [
  { id: "Cambio olio motore", name: "Cambio olio motore", category: "Tagliando" },
  { id: "Cambio filtro olio", name: "Cambio filtro olio", category: "Tagliando" },
  { id: "Cambio filtro aria", name: "Cambio filtro aria", category: "Tagliando" },
  { id: "Cambio filtro abitacolo", name: "Cambio filtro abitacolo", category: "Tagliando" },
  { id: "Cambio filtro carburante", name: "Cambio filtro carburante", category: "Tagliando" },
  { id: "Cambio filtro gasolio", name: "Cambio filtro gasolio", category: "Tagliando" },
  { id: "Controllo livelli", name: "Controllo livelli", category: "Tagliando" },
  { id: "Diagnosi elettronica", name: "Diagnosi elettronica", category: "Tagliando" },
  { id: "Reset service", name: "Reset service", category: "Tagliando" },

  { id: "Cambio pastiglie freni anteriori", name: "Cambio pastiglie freni anteriori", category: "Freni" },
  { id: "Cambio pastiglie freni posteriori", name: "Cambio pastiglie freni posteriori", category: "Freni" },
  { id: "Cambio dischi freni anteriori", name: "Cambio dischi freni anteriori", category: "Freni" },
  { id: "Cambio dischi freni posteriori", name: "Cambio dischi freni posteriori", category: "Freni" },
  { id: "Cambio liquido freni", name: "Cambio liquido freni", category: "Freni" },
  { id: "Controllo impianto frenante", name: "Controllo impianto frenante", category: "Freni" },

  { id: "Cambio pneumatici", name: "Cambio pneumatici", category: "Pneumatici" },
  { id: "Inversione pneumatici", name: "Inversione pneumatici", category: "Pneumatici" },
  { id: "Equilibratura pneumatici", name: "Equilibratura pneumatici", category: "Pneumatici" },
  { id: "Convergenza", name: "Convergenza", category: "Pneumatici" },
  { id: "Riparazione foratura", name: "Riparazione foratura", category: "Pneumatici" },

  { id: "Cambio batteria", name: "Cambio batteria", category: "Elettrico" },
  { id: "Controllo batteria", name: "Controllo batteria", category: "Elettrico" },
  { id: "Controllo alternatore", name: "Controllo alternatore", category: "Elettrico" },
  { id: "Sostituzione alternatore", name: "Sostituzione alternatore", category: "Elettrico" },
  { id: "Cambio lampadine", name: "Cambio lampadine", category: "Elettrico" },
  { id: "Controllo luci", name: "Controllo luci", category: "Elettrico" },

  { id: "Cambio cinghia distribuzione", name: "Cambio cinghia distribuzione", category: "Distribuzione" },
  { id: "Cambio cinghia servizi", name: "Cambio cinghia servizi", category: "Distribuzione" },
  { id: "Cambio catena distribuzione", name: "Cambio catena distribuzione", category: "Distribuzione" },

  { id: "Cambio frizione", name: "Cambio frizione", category: "Trasmissione" },
  { id: "Cambio olio cambio", name: "Cambio olio cambio", category: "Trasmissione" },
  { id: "Riparazione cambio", name: "Riparazione cambio", category: "Trasmissione" },

  { id: "Controllo sospensioni", name: "Controllo sospensioni", category: "Sospensioni" },
  { id: "Cambio ammortizzatori anteriori", name: "Cambio ammortizzatori anteriori", category: "Sospensioni" },
  { id: "Cambio ammortizzatori posteriori", name: "Cambio ammortizzatori posteriori", category: "Sospensioni" },

  { id: "Ricarica aria condizionata", name: "Ricarica aria condizionata", category: "Climatizzazione" },
  { id: "Igienizzazione impianto clima", name: "Igienizzazione impianto clima", category: "Climatizzazione" },

  { id: "Lavaggio esterno", name: "Lavaggio esterno", category: "Pulizia" },
  { id: "Lavaggio interno", name: "Lavaggio interno", category: "Pulizia" },
  { id: "Lavaggio completo", name: "Lavaggio completo", category: "Pulizia" },
  { id: "Sanificazione abitacolo", name: "Sanificazione abitacolo", category: "Pulizia" },

  { id: "Controllo pre-revisione", name: "Controllo pre-revisione", category: "Controlli" },
  { id: "Controllo sicurezza", name: "Controllo sicurezza", category: "Controlli" },
  { id: "Controllo documenti veicolo", name: "Controllo documenti veicolo", category: "Controlli" },

  { id: "Soccorso stradale", name: "Soccorso stradale", category: "Altro" },
  { id: "Traino veicolo", name: "Traino veicolo", category: "Altro" },
  { id: "Manodopera generica", name: "Manodopera generica", category: "Altro" },
  { id: "Ricambi vari", name: "Ricambi vari", category: "Altro" },
  { id: "Altro intervento", name: "Altro intervento", category: "Altro" },
];

export async function GET() {
  return NextResponse.json({
    count: workItems.length,
    workItems,
  });
}
