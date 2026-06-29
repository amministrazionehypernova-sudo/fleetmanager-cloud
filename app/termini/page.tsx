import Link from "next/link";

const sections = [
  {
    title: "1. Fornitore del servizio",
    body: [
      "Ragione sociale: Hypernova di Fabio Natale Gigante",
      "Sede legale: c.da Gorgofreddo 73",
      "Partita IVA / Codice fiscale: 09064620728",
      "Email supporto: info@hypernova-lab.com",
      "PEC: fabio.natale.gigante@pec.it",
    ],
  },
  {
    title: "2. Oggetto del servizio",
    body: [
      "FleetManagerPro è un gestionale online che consente ai clienti aziendali di organizzare e monitorare dati relativi alla propria flotta, tra cui veicoli, scadenze, utenti, rifornimenti, manutenzioni, documenti e attività operative.",
      "Il servizio è fornito in modalità SaaS, tramite accesso web all'area riservata.",
    ],
  },
  {
    title: "3. Account e accesso",
    body: [
      "Per utilizzare FleetManagerPro è necessario disporre di un account autorizzato.",
      "Il cliente è responsabile della correttezza dei dati forniti, della gestione degli utenti collegati alla propria azienda, della protezione delle credenziali e di ogni attività svolta tramite gli account associati alla propria azienda.",
      "In caso di sospetto accesso non autorizzato, il cliente deve avvisare tempestivamente il supporto.",
    ],
  },
  {
    title: "4. Piani, limiti e prezzi",
    body: [
      "Piano Basic: fino a 10 veicoli, 39 euro al mese.",
      "Piano Pro: fino a 30 veicoli, 89 euro al mese.",
      "Piano Enterprise: fino a 60 veicoli, 159 euro al mese.",
      "Il sistema può impedire la creazione di nuovi veicoli quando viene raggiunto il limite previsto dal piano attivo.",
    ],
  },
  {
    title: "5. Abbonamento, pagamento e rinnovo",
    body: [
      "La periodicità del servizio è mensile. Il rinnovo è manuale.",
      "I pagamenti possono avvenire tramite bonifico bancario, PayPal o altro metodo concordato tra le parti.",
      "Il cliente può non rinnovare il servizio alla scadenza del periodo già pagato.",
      "In caso di mancato pagamento, scadenza del piano o violazione dei presenti Termini, il fornitore potrà sospendere o disattivare l'accesso dopo 5 giorni di tolleranza dalla scadenza o dal mancato pagamento.",
    ],
  },
  {
    title: "6. Sospensione e disattivazione",
    body: [
      "Il servizio può limitare o bloccare l'accesso alle aziende disattivate dall'amministratore, con piano scaduto, con pagamenti insoluti, in violazione dei presenti Termini o coinvolte in utilizzi abusivi o non autorizzati.",
      "La sospensione non elimina automaticamente i dati del cliente, salvo quanto previsto dalla legge, dal contratto o da una richiesta espressa di cancellazione.",
    ],
  },
  {
    title: "7. Obblighi del cliente",
    body: [
      "Il cliente si impegna a utilizzare FleetManagerPro in modo lecito, inserire dati corretti e aggiornati, avere titolo o autorizzazione per trattare i dati inseriti, non usare il servizio per finalità illecite o dannose, non compromettere la piattaforma, non condividere credenziali con soggetti non autorizzati e rispettare la normativa applicabile.",
    ],
  },
  {
    title: "8. Dati del cliente e backup",
    body: [
      "Il cliente mantiene la titolarità dei dati inseriti nella piattaforma. FleetManagerPro tratta tali dati per fornire il servizio, garantire il funzionamento tecnico, prestare assistenza e adempiere agli obblighi previsti dalla legge.",
      "I backup tecnici sono conservati per un periodo massimo di 30 giorni.",
      "I backup non sostituiscono gli obblighi interni del cliente di conservare copie, esportazioni o documentazione rilevante per la propria attività.",
    ],
  },
  {
    title: "9. Disponibilita, manutenzione e supporto",
    body: [
      "Il fornitore si impegna a mantenere FleetManagerPro funzionante e disponibile secondo standard ragionevoli per un servizio SaaS.",
      "Potrebbero verificarsi interruzioni dovute a manutenzione programmata, aggiornamenti tecnici, problemi infrastrutturali, cause di forza maggiore o interventi urgenti di sicurezza.",
      "Non è previsto un livello di servizio garantito specifico, salvo diverso accordo scritto con il cliente.",
      "Il supporto è disponibile tramite email all'indirizzo info@hypernova-lab.com e, se concordato con il cliente, tramite WhatsApp e telefono. Orari di supporto: dalle 8:00 alle 19:00.",
    ],
  },
  {
    title: "10. Responsabilita operative del cliente",
    body: [
      "FleetManagerPro è uno strumento di supporto gestionale. Il cliente resta responsabile della verifica delle scadenze, della correttezza dei dati inseriti, del rispetto degli obblighi amministrativi, fiscali, assicurativi e normativi, delle decisioni operative relative alla propria flotta e della manutenzione reale dei veicoli.",
      "La piattaforma non sostituisce consulenze legali, fiscali, assicurative, tecniche o professionali.",
    ],
  },
  {
    title: "11. Proprieta intellettuale",
    body: [
      "Il software, l'interfaccia, il codice, il marchio, la struttura della piattaforma e ogni elemento proprietario di FleetManagerPro restano di titolarità del fornitore o dei rispettivi aventi diritto.",
      "Al cliente viene concessa una licenza limitata, non esclusiva, non trasferibile e revocabile per utilizzare il servizio durante il periodo di validità dell'abbonamento.",
    ],
  },
  {
    title: "12. Limitazione di responsabilita",
    body: [
      "Nei limiti consentiti dalla legge, il fornitore non risponde per dati errati o incompleti inseriti dal cliente, mancata verifica delle scadenze, decisioni operative assunte sulla base dei dati presenti nella piattaforma, interruzioni dovute a cause esterne o forza maggiore, danni indiretti, perdita di profitto, perdita di opportunità o danni consequenziali.",
      "La responsabilità del fornitore resta disciplinata dalla legge applicabile, con esclusione di qualsiasi limitazione non consentita da norme inderogabili.",
    ],
  },
  {
    title: "13. Privacy, recesso e cessazione",
    body: [
      "Il trattamento dei dati personali è disciplinato dalla Privacy Policy di FleetManagerPro, disponibile sul sito ufficiale hypernova-lab.com o nella pagina dedicata del servizio.",
      "Alla cessazione del rapporto, l'accesso alla piattaforma potrà essere disattivato. Il cliente potrà richiedere, ove tecnicamente disponibile, un'esportazione dei dati. I dati potranno essere cancellati o anonimizzati dopo il periodo previsto dal contratto o dalla legge.",
    ],
  },
  {
    title: "14. Modifiche, legge applicabile e contatti",
    body: [
      "Il fornitore può aggiornare la piattaforma, introdurre nuove funzionalità, modificare funzionalità esistenti o correggere problemi tecnici.",
      "I presenti Termini possono essere aggiornati nel tempo. Le modifiche saranno pubblicate con indicazione della data di ultimo aggiornamento.",
      "I presenti Termini sono regolati dalla legge italiana. Foro competente: Monopoli.",
      "Contatti: info@hypernova-lab.com, PEC fabio.natale.gigante@pec.it, sito web hypernova-lab.com.",
    ],
  },
];

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-slate-100">
      <article className="mx-auto max-w-4xl border border-slate-800 bg-slate-900/80 p-6 sm:p-10">
        <Link className="text-sm font-bold text-sky-400 hover:text-sky-300" href="/login">
          Torna al login
        </Link>

        <header className="mt-8 border-b border-slate-800 pb-8">
          <p className="text-xs font-black tracking-[0.35em] text-sky-400">
            FLEETMANAGERPRO
          </p>
          <h1 className="mt-4 text-3xl font-black sm:text-4xl">
            Termini di Servizio
          </h1>
          <p className="mt-3 text-sm text-slate-400">
            Ultimo aggiornamento: 29 giugno 2026
          </p>
        </header>

        <div className="mt-8 space-y-8">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-xl font-black text-slate-100">
                {section.title}
              </h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-slate-300">
                {section.body.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
