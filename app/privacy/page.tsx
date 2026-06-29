import Link from "next/link";

const sections = [
  {
    title: "1. Titolare del trattamento",
    body: [
      "Ragione sociale: Hypernova di Fabio Natale Gigante",
      "Sede legale: c.da Gorgofreddo 73",
      "Partita IVA / Codice fiscale: 09064620728",
      "Email privacy: info@hypernova-lab.com",
      "PEC: fabio.natale.gigante@pec.it",
    ],
  },
  {
    title: "2. Cos'e FleetManagerPro",
    body: [
      "FleetManagerPro è un gestionale online dedicato alla gestione amministrativa e operativa di flotte aziendali. La piattaforma consente di gestire aziende, utenti, veicoli, scadenze, manutenzioni, rifornimenti, documenti e dati collegati alla flotta.",
    ],
  },
  {
    title: "3. Dati trattati",
    body: [
      "Dati account e utenti: nome, cognome, email, ruolo, azienda di appartenenza, credenziali protette e stato dell'account.",
      "Dati aziendali: nome o ragione sociale, piano SaaS, stato dell'azienda, data di scadenza e limite massimo di veicoli.",
      "Dati relativi alla flotta: targhe o identificativi dei veicoli, marca, modello, chilometraggio, scadenze, manutenzioni, rifornimenti, costi, interventi e documenti collegati.",
      "Dati tecnici: indirizzo IP, log di accesso e utilizzo, informazioni sul browser e cookie tecnici necessari al funzionamento della sessione.",
      "Dati di supporto: comunicazioni inviate al supporto e informazioni tecniche necessarie alla risoluzione dei problemi.",
    ],
  },
  {
    title: "4. Finalita e basi giuridiche",
    body: [
      "I dati sono trattati per creare e gestire gli account, consentire l'accesso alla piattaforma, erogare il servizio SaaS, fornire assistenza, proteggere i sistemi, adempiere a obblighi amministrativi, fiscali e legali e inviare comunicazioni operative sul servizio.",
      "Le basi giuridiche principali sono l'esecuzione del contratto, l'adempimento di obblighi di legge e l'interesse legittimo alla sicurezza e al corretto funzionamento della piattaforma.",
    ],
  },
  {
    title: "5. Conservazione",
    body: [
      "I dati account, aziendali e operativi sono conservati per la durata del rapporto contrattuale e per il periodo necessario a eventuali adempimenti o contestazioni.",
      "I log tecnici sono conservati per un periodo di norma non superiore a 12 mesi, salvo esigenze di sicurezza.",
      "I backup tecnici sono conservati per un periodo massimo di 30 giorni.",
      "I dati fiscali e amministrativi sono conservati secondo i termini previsti dalla legge.",
    ],
  },
  {
    title: "6. Destinatari e hosting",
    body: [
      "I dati possono essere trattati da soggetti autorizzati e da fornitori tecnici necessari all'erogazione del servizio, tra cui provider hosting, consulenti tecnici, consulenti fiscali o legali e autorità pubbliche nei casi previsti dalla legge.",
      "Il servizio è ospitato su infrastruttura VPS Contabo situata in Unione Europea, in Germania.",
      "Al momento non vengono utilizzati servizi esterni di analytics, marketing automation, newsletter o profilazione.",
    ],
  },
  {
    title: "7. Trasferimenti extra UE",
    body: [
      "I dati sono trattati all'interno dello Spazio Economico Europeo. Al momento non sono previsti trasferimenti sistematici di dati personali al di fuori dello Spazio Economico Europeo.",
      "Qualora in futuro vengano utilizzati fornitori extra UE, il trasferimento avverrà nel rispetto delle garanzie previste dal GDPR.",
    ],
  },
  {
    title: "8. Sicurezza",
    body: [
      "FleetManagerPro adotta misure tecniche e organizzative ragionevoli, tra cui accesso tramite credenziali, password protette, connessione HTTPS, controlli di accesso per ruolo e azienda, limitazione degli accessi amministrativi, backup periodici e manutenzione tecnica.",
      "Nessun sistema informatico può garantire sicurezza assoluta. L'utente è tenuto a proteggere le proprie credenziali e a comunicare tempestivamente eventuali accessi non autorizzati.",
    ],
  },
  {
    title: "9. Ruoli privacy dei clienti aziendali",
    body: [
      "Quando un cliente aziendale inserisce nella piattaforma dati relativi ai propri utenti, dipendenti, collaboratori, conducenti o veicoli, il cliente può agire come titolare del trattamento di tali dati.",
      "In questi casi, FleetManagerPro può operare come responsabile del trattamento per conto del cliente, nei limiti del servizio erogato e secondo gli accordi contrattuali applicabili.",
    ],
  },
  {
    title: "10. Cookie",
    body: [
      "FleetManagerPro utilizza cookie tecnici e strumenti analoghi necessari a gestire il login, mantenere la sessione attiva, proteggere l'accesso all'area riservata e garantire il corretto funzionamento del servizio.",
      "La piattaforma non utilizza cookie di profilazione.",
    ],
  },
  {
    title: "11. Diritti dell'interessato",
    body: [
      "Gli interessati possono esercitare i diritti previsti dal GDPR, tra cui accesso, rettifica, cancellazione, limitazione, opposizione, portabilità dei dati e revoca del consenso quando applicabile.",
      "Le richieste possono essere inviate a info@hypernova-lab.com.",
      "L'interessato ha inoltre il diritto di proporre reclamo al Garante per la protezione dei dati personali.",
    ],
  },
  {
    title: "12. Minori e modifiche",
    body: [
      "FleetManagerPro è destinato a clienti professionali e aziende. Il servizio non è rivolto a minori.",
      "La presente Privacy Policy può essere aggiornata nel tempo. Le modifiche saranno pubblicate su questa pagina con indicazione della data di ultimo aggiornamento.",
    ],
  },
];

export default function PrivacyPage() {
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
            Privacy Policy
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
