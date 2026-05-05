import { ReactNode } from "react";

export interface TemplateField {
  label: string;
  key: string;
  type: "text" | "textarea" | "select" | "date" | "multiParty";
  defaultValue: string;
  options?: string[];
  /** Show this field only when another field matches a value */
  showWhen?: { key: string; value: string | string[] };
  /** Role label for multi-party fields (e.g. "Applicant", "Claimant") */
  partyRole?: string;
}

/** Parse a multi-party field value (pipe-delimited) into an array */
export function parseParties(value: string): string[] {
  if (!value) return [""];
  return value.split("|||").map((s) => s.trim());
}

/** Join an array of parties into a pipe-delimited string */
export function joinParties(parties: string[]): string {
  return parties.join("|||");
}

/** Format a multi-party value for display in body text: "A, B and C" */
function dp(value: string): string {
  const parts = parseParties(value).filter(Boolean);
  if (parts.length === 0) return "";
  if (parts.length === 1) return parts[0];
  if (parts.length === 2) return `${parts[0]} and ${parts[1]}`;
  return parts.slice(0, -1).join(", ") + " and " + parts[parts.length - 1];
}

export interface TemplateConfig {
  fields: TemplateField[];
  aiSuggestions: string[];
  aiTip: string;
  renderDocument: (fields: Record<string, string>) => ReactNode;
}

// ─── Helper: court header block ─────────────────────────────────────
function CourtHeader({ court, division, state }: { court: string; division: string; state?: string }) {
  const div = (division || "").toUpperCase();
  const st = (state || "LAGOS STATE").toUpperCase();

  if (court === "Supreme Court") {
    return (
      <div className="text-center uppercase" style={{ fontWeight: 700 }}>
        <p>IN THE SUPREME COURT OF NIGERIA</p>
        <p className="mt-2">HOLDEN AT ABUJA</p>
      </div>
    );
  }

  if (court === "Magistrate Court") {
    return (
      <div className="text-center uppercase" style={{ fontWeight: 700 }}>
        <p>IN THE MAGISTRATE COURT OF {st}</p>
        <p>IN THE {div} MAGISTERIAL DISTRICT</p>
        <p className="mt-2">HOLDEN AT {div}</p>
      </div>
    );
  }

  const courtLine = court === "State High Court"
    ? `IN THE HIGH COURT OF ${st}`
    : `IN THE ${court.toUpperCase()} OF NIGERIA`;

  return (
    <div className="text-center uppercase" style={{ fontWeight: 700 }}>
      <p>{courtLine}</p>
      <p>IN THE {div} JUDICIAL DIVISION</p>
      <p className="mt-2">HOLDEN AT {div}</p>
    </div>
  );
}

function PartiesBlock({ applicant, respondent, applicantRole, respondentRole }: { applicant: string; respondent: string; applicantRole?: string; respondentRole?: string }) {
  const applicants = parseParties(applicant);
  const respondents = parseParties(respondent);
  const aRole = applicantRole || "Applicant";
  const rRole = respondentRole || "Respondent";

  return (
    <div>
      <p className="text-right" style={{ fontSize: "13px" }}>SUIT NO: _____________</p>
      <div className="mt-4">
        <p style={{ fontWeight: 700 }}>BETWEEN:</p>
        <table className="w-full mt-2">
          <tbody>
            {applicants.map((name, i) => (
              <tr key={`a-${i}`}>
                <td className="uppercase py-1">{name}</td>
                <td className="text-right" style={{ fontWeight: 600 }}>
                  {i === 0
                    ? `...${applicants.length > 1 ? `1st ${aRole}` : aRole}`
                    : `...${ordinal(i + 1)} ${aRole}`}
                </td>
              </tr>
            ))}
            <tr><td colSpan={2} className="py-2" style={{ fontWeight: 700 }}>AND</td></tr>
            {respondents.map((name, i) => (
              <tr key={`r-${i}`}>
                <td className="uppercase py-1">{name}</td>
                <td className="text-right" style={{ fontWeight: 600 }}>
                  {i === 0
                    ? `...${respondents.length > 1 ? `1st ${rRole}` : rRole}`
                    : `...${ordinal(i + 1)} ${rRole}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function SignatureBlock({ title }: { title: string }) {
  return (
    <div className="mt-20">
      <p>Dated this ______ day of ______________ 2026.</p>
      <div className="mt-16">
        <div className="w-[250px] border-t border-[#0F172A] pt-2">
          <p style={{ fontSize: "13px" }}>{title}</p>
        </div>
      </div>
    </div>
  );
}

// Pulls counsel info from the user's saved Settings preferences.
function getCounsel() {
  try {
    const raw = localStorage.getItem("lexdraft_preferences");
    if (!raw) return { name: "", firmName: "", signature: "", email: "", jurisdiction: "" };
    const p = JSON.parse(raw);
    return {
      name: p.fullName || "",
      firmName: p.firmName || "",
      signature: p.signature || "",
      email: p.email || "",
      jurisdiction: p.jurisdiction || "",
    };
  } catch {
    return { name: "", firmName: "", signature: "", email: "", jurisdiction: "" };
  }
}

// Citation of the rule under which the application is brought, by court.
function rulesCitation(court: string, state?: string): string {
  switch (court) {
    case "Federal High Court":
      return "ORDER 26 RULE 1 OF THE FEDERAL HIGH COURT (CIVIL PROCEDURE) RULES, 2019";
    case "State High Court":
      return `ORDER 43 OF THE HIGH COURT OF ${(state || "LAGOS STATE").toUpperCase()} (CIVIL PROCEDURE) RULES, 2019`;
    case "Court of Appeal":
      return "ORDER 6 OF THE COURT OF APPEAL RULES, 2021";
    case "Supreme Court":
      return "ORDER 2 OF THE SUPREME COURT RULES, 1985 (AS AMENDED)";
    case "National Industrial Court":
      return "ORDER 17 OF THE NATIONAL INDUSTRIAL COURT OF NIGERIA (CIVIL PROCEDURE) RULES, 2017";
    case "Magistrate Court":
      return "THE MAGISTRATE COURT (CIVIL PROCEDURE) RULES OF THE RELEVANT STATE";
    default:
      return "THE RELEVANT RULES OF THIS HONOURABLE COURT";
  }
}

// "BROUGHT PURSUANT TO ORDER... AND UNDER THE INHERENT JURISDICTION..." heading.
function BroughtPursuantTo({ court, state }: { court: string; state?: string }) {
  return (
    <div className="text-center mt-2" style={{ fontWeight: 700, fontSize: "13px" }}>
      <p className="underline">BROUGHT PURSUANT TO {rulesCitation(court, state)}</p>
      <p className="underline">AND UNDER THE INHERENT JURISDICTION OF THIS HONOURABLE COURT</p>
    </div>
  );
}

// Counsel's address block — right-aligned, used at the foot of any process.
function CounselAddress({ role }: { role: string }) {
  const c = getCounsel();
  return (
    <div className="flex justify-end mt-12">
      <div className="text-right" style={{ maxWidth: 340 }}>
        <div className="border-t border-[#0F172A] pt-2 mb-1" />
        <p style={{ fontWeight: 700, fontSize: "13px" }}>{c.name ? c.name.toUpperCase() : "_______________________"}</p>
        <p style={{ fontSize: "13px" }}>Counsel to the {role}</p>
        {c.firmName && <p style={{ fontSize: "13px", fontWeight: 600 }}>{c.firmName}</p>}
        {c.signature ? (
          <div style={{ fontSize: "12px", whiteSpace: "pre-line", lineHeight: 1.5 }}>{c.signature}</div>
        ) : (
          <>
            <p style={{ fontSize: "12px" }}>______________________</p>
            <p style={{ fontSize: "12px" }}>______________________</p>
          </>
        )}
        {c.email && <p style={{ fontSize: "12px" }}>Email: {c.email}</p>}
      </div>
    </div>
  );
}

// "FOR SERVICE ON:" block — left-aligned, sits below the counsel's address.
function ForServiceBlock({ parties, role = "Respondent" }: { parties: string; role?: string }) {
  const list = parseParties(parties).filter(Boolean);
  return (
    <div className="mt-10">
      <p className="underline" style={{ fontWeight: 700, fontSize: "13px" }}>FOR SERVICE ON:</p>
      <div className="mt-2 space-y-3">
        {list.map((name, i) => (
          <div key={i}>
            <p className="uppercase" style={{ fontWeight: 600, fontSize: "13px" }}>
              {name}{list.length > 1 ? ` — ${ordinal(i + 1)} ${role}` : ` — ${role}`}
            </p>
            <p style={{ fontSize: "12px" }}>C/o their Counsel / Last known address</p>
            <p style={{ fontSize: "12px" }}>______________________</p>
            <p style={{ fontSize: "12px" }}>______________________</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// Combined dated + counsel address (right) + for-service block (below, left).
function ProcessFooter({ role, serviceParties, serviceRole = "Respondent" }: { role: string; serviceParties: string; serviceRole?: string }) {
  return (
    <div className="mt-16">
      <p>Dated this ______ day of ______________ 2026.</p>
      <CounselAddress role={role} />
      <ForServiceBlock parties={serviceParties} role={serviceRole} />
    </div>
  );
}

function DeponentBlock() {
  return (
    <div className="mt-12">
      <div className="w-[250px] border-t border-[#0F172A] pt-2 mb-8">
        <p style={{ fontSize: "13px" }}>Deponent</p>
      </div>
      <p style={{ fontWeight: 700 }}>SWORN TO at the Registry of this Honourable Court</p>
      <p>This ______ day of ______________ 2026</p>
      <div className="mt-8 w-[250px] border-t border-[#0F172A] pt-2">
        <p style={{ fontSize: "13px" }}>Commissioner for Oaths</p>
      </div>
    </div>
  );
}

// ─── State → Division mapping (exported for DraftEditor) ────────────
export const stateDivisions: Record<string, string[]> = {
  "Lagos State": ["Lagos", "Ikeja", "Epe", "Badagry", "Ikorodu", "Igbosere"],
  "FCT Abuja": ["Abuja", "Gwagwalada", "Kuje", "Kwali", "Bwari"],
  "Rivers State": ["Port Harcourt", "Degema", "Ahoada", "Bori", "Omoku"],
  "Cross River State": ["Calabar", "Ogoja", "Ikom", "Ugep"],
  "Enugu State": ["Enugu", "Nsukka", "Awgu", "Oji River", "Agbani"],
  "Kaduna State": ["Kaduna", "Zaria", "Kafanchan", "Zonkwa"],
  "Oyo State": ["Ibadan", "Ogbomosho", "Oyo", "Iseyin", "Saki"],
  "Edo State": ["Benin", "Auchi", "Ekpoma", "Uromi", "Ubiaja"],
  "Ogun State": ["Abeokuta", "Ijebu-Ode", "Sagamu", "Ilaro", "Ota"],
  "Delta State": ["Asaba", "Warri", "Sapele", "Agbor", "Ughelli"],
  "Kano State": ["Kano", "Wudil", "Rano", "Gwarzo", "Bichi"],
  "Anambra State": ["Awka", "Onitsha", "Nnewi", "Aguata", "Ogidi"],
  "Imo State": ["Owerri", "Orlu", "Okigwe", "Oguta"],
  "Abia State": ["Umuahia", "Aba", "Ohafia", "Bende"],
  "Kwara State": ["Ilorin", "Offa", "Lafiagi", "Patigi"],
  "Osun State": ["Osogbo", "Ile-Ife", "Ilesa", "Ede", "Ikirun"],
  "Ondo State": ["Akure", "Ondo", "Owo", "Ikare", "Okitipupa"],
  "Ekiti State": ["Ado-Ekiti", "Ikere", "Ijero", "Ikole", "Efon"],
  "Plateau State": ["Jos", "Pankshin", "Shendam", "Wase"],
  "Bauchi State": ["Bauchi", "Azare", "Misau", "Jama'are"],
  "Borno State": ["Maiduguri", "Biu", "Bama", "Dikwa"],
  "Adamawa State": ["Yola", "Mubi", "Numan", "Ganye"],
  "Niger State": ["Minna", "Bida", "Kontagora", "Suleja"],
  "Kogi State": ["Lokoja", "Okene", "Kabba", "Idah", "Ankpa"],
  "Benue State": ["Makurdi", "Otukpo", "Gboko", "Katsina-Ala"],
  "Taraba State": ["Jalingo", "Wukari", "Takum", "Bali"],
  "Nassarawa State": ["Lafia", "Keffi", "Akwanga", "Nasarawa"],
  "Gombe State": ["Gombe", "Deba", "Kaltungo", "Bajoga"],
  "Yobe State": ["Damaturu", "Potiskum", "Gashua", "Nguru"],
  "Zamfara State": ["Gusau", "Kaura Namoda", "Talata Mafara", "Anka"],
  "Sokoto State": ["Sokoto", "Gwadabawa", "Illela", "Tambuwal"],
  "Kebbi State": ["Birnin Kebbi", "Argungu", "Yauri", "Zuru"],
  "Katsina State": ["Katsina", "Daura", "Funtua", "Malumfashi"],
  "Jigawa State": ["Dutse", "Hadejia", "Gumel", "Birnin Kudu"],
  "Bayelsa State": ["Yenagoa", "Sagbama", "Ogbia", "Brass"],
  "Ebonyi State": ["Abakaliki", "Afikpo", "Onueke", "Ishiagu"],
  "Akwa Ibom State": ["Uyo", "Eket", "Ikot Ekpene", "Oron", "Abak"],
};

// ─── Standard court fields ──────────────────────────────────────────
const courtField: TemplateField = {
  label: "Court", key: "court", type: "select", defaultValue: "Federal High Court",
  options: ["Federal High Court", "State High Court", "Court of Appeal", "Supreme Court", "National Industrial Court", "Magistrate Court"],
};
const stateField: TemplateField = {
  label: "State", key: "state", type: "select", defaultValue: "Lagos State",
  options: Object.keys(stateDivisions).sort(),
  showWhen: { key: "court", value: ["State High Court", "Magistrate Court"] },
};
const divisionField: TemplateField = {
  label: "Judicial Division", key: "division", type: "select", defaultValue: "Lagos",
  options: ["Lagos", "Abuja", "Port Harcourt", "Calabar", "Enugu", "Kaduna", "Ibadan", "Benin"],
  showWhen: { key: "court", value: ["State High Court", "Magistrate Court"] },
};
const applicantField: TemplateField = { label: "Applicant / Claimant", key: "applicant", type: "multiParty", defaultValue: "TechCorp Solutions Ltd", partyRole: "Applicant" };
const respondentField: TemplateField = { label: "Respondent / Defendant", key: "respondent", type: "multiParty", defaultValue: "Global Logistics Inc.", partyRole: "Respondent" };

// =====================================================================
//  TEMPLATE CONFIGURATIONS
// =====================================================================

const templates: Record<string, TemplateConfig> = {

  // ─── LITIGATION ─────────────────────────────────────────────────────

  "Motion Ex Parte": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Relief Sought", key: "relief", type: "textarea", defaultValue: "Interim injunction restraining the Respondent from disposing of, alienating, or encumbering the assets subject matter of this suit pending the hearing and determination of the Motion on Notice." },
      { label: "Grounds for Urgency", key: "urgency", type: "textarea", defaultValue: "There is imminent danger that the Respondent will dissipate the assets if not restrained urgently." },
    ],
    aiSuggestions: ["Refine legal language", "Add case law support", "Check compliance", "Suggest clauses"],
    aiTip: "Consider adding an affidavit of urgency to strengthen this motion. Reference Order 26 Rule 1 of the Federal High Court Rules.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>MOTION EX PARTE</div>
        <BroughtPursuantTo court={f.court} state={f.state} />
        <p className="mt-4">TAKE NOTICE that this Honourable Court will be moved on the ______ day of ______________ 2026 at the hour of 9 O'clock in the forenoon or so soon thereafter as Counsel on behalf of the Applicant may be heard praying this Honourable Court for the following orders:</p>
        <ol className="list-decimal pl-8 space-y-4">
          <li>{f.relief}</li>
          <li>AND for such further order or other orders as this Honourable Court may deem fit to make in the circumstances of this case.</li>
        </ol>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>GROUNDS UPON WHICH THIS APPLICATION IS BROUGHT:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>{f.urgency}</li>
            <li>The balance of convenience is in favour of granting this application.</li>
            <li>It is in the interest of justice to grant this application.</li>
          </ol>
        </div>
        <ProcessFooter role="Applicant" serviceParties={f.respondent} />
      </>
    ),
  },

  "Motion on Notice": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Relief Sought", key: "relief", type: "textarea", defaultValue: "An order of interlocutory injunction restraining the Respondent, their agents, servants, privies or howsoever from interfering with the Applicant's rights over the subject matter of this suit." },
      { label: "Supporting Affidavit Deponent", key: "deponent", type: "text", defaultValue: "John Adewale" },
    ],
    aiSuggestions: ["Strengthen prayer points", "Add case authorities", "Verify court rules compliance", "Draft supporting affidavit"],
    aiTip: "Ensure that the motion is accompanied by a supporting affidavit and a written address as required by the Rules of Court.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>MOTION ON NOTICE</div>
        <BroughtPursuantTo court={f.court} state={f.state} />
        <p className="mt-4">TAKE NOTICE that this Honourable Court will be moved on the ______ day of ______________ 2026 at the hour of 9 O'clock in the forenoon or so soon thereafter as Counsel on behalf of the Applicant/Claimant may be heard PRAYING THIS HONOURABLE COURT for the following reliefs:</p>
        <ol className="list-decimal pl-8 space-y-4">
          <li>{f.relief}</li>
          <li>An order for costs of this application.</li>
          <li>And for such further order(s) as this Honourable Court may deem fit to make in the circumstances.</li>
        </ol>
        <div className="mt-8">
          <p>The grounds upon which this application is brought are as follows:</p>
          <ol className="list-lower-alpha pl-8 space-y-3 mt-3">
            <li>The Applicant has a legal right which deserves to be protected by this Honourable Court.</li>
            <li>The Respondent's conduct, if not checked, will cause irreparable damage to the Applicant.</li>
            <li>The balance of convenience favours the granting of this application.</li>
            <li>It is in the interest of justice to grant this application.</li>
          </ol>
        </div>
        <p className="mt-6">The Application is supported by a {f.deponent ? `${f.deponent}'s` : ""} Affidavit and a Written Address filed herewith.</p>
        <ProcessFooter role="Applicant/Claimant" serviceParties={f.respondent} serviceRole="Respondent/Defendant" />
      </>
    ),
  },

  "Motion for Interim Injunction": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Subject Matter", key: "subject", type: "textarea", defaultValue: "Property situate at No. 15, Victoria Island, Lagos, covered by Certificate of Occupancy No. LAS/2024/0092." },
      { label: "Irreparable Harm Description", key: "harm", type: "textarea", defaultValue: "The Respondent has commenced demolition works on the property and has threatened to continue same despite the Applicant's subsisting title." },
    ],
    aiSuggestions: ["Add American Cyanamid test", "Cite Kotoye v. CBN", "Check limitation period", "Strengthen undertaking as to damages"],
    aiTip: "The court will apply the American Cyanamid principles. Ensure you demonstrate: (1) serious question to be tried, (2) damages not adequate, (3) balance of convenience.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>MOTION FOR INTERIM INJUNCTION</div>
        <BroughtPursuantTo court={f.court} state={f.state} />
        <p className="mt-4">TAKE NOTICE that this Honourable Court will be moved on the ______ day of ______________ 2026 at the hour of 9 O'clock in the forenoon or so soon thereafter as Counsel on behalf of the Applicant may be heard praying this Honourable Court for an Order of Interim Injunction restraining the Respondent, whether by themselves, their agents, servants, privies or howsoever described from continuing any act of interference, trespass, demolition or disturbance in respect of:</p>
        <div className="pl-8 border-l-2 border-[#D1D5DB] my-4 py-2">{f.subject}</div>
        <p style={{ fontWeight: 700 }}>GROUNDS:</p>
        <ol className="list-decimal pl-8 space-y-4 mt-3">
          <li>There exists a serious question to be tried in this suit.</li>
          <li>{f.harm}</li>
          <li>Damages would not be an adequate remedy if the Respondent is not restrained.</li>
          <li>The balance of convenience is in favour of granting this application.</li>
          <li>The Applicant gives an undertaking as to damages.</li>
        </ol>
        <ProcessFooter role="Applicant" serviceParties={f.respondent} />
      </>
    ),
  },

  "Notice of Preliminary Objection": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Ground of Objection", key: "ground", type: "textarea", defaultValue: "The suit as presently constituted is incompetent having been commenced by a wrong mode of commencement." },
      { label: "Legal Basis", key: "basis", type: "textarea", defaultValue: "The Claimant's action ought to have been commenced by Originating Summons and not by Writ of Summons, as no disputed facts exist." },
    ],
    aiSuggestions: ["Add jurisdictional authorities", "Cite Madukolu v. Nkemdilim", "Check locus standi issues", "Draft written address"],
    aiTip: "Preliminary Objection goes to jurisdiction. Reference Madukolu v. Nkemdilim (1962) for conditions of court competence.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.respondent} respondent={f.applicant} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>NOTICE OF PRELIMINARY OBJECTION</div>
        <BroughtPursuantTo court={f.court} state={f.state} />
        <p className="mt-4">TAKE NOTICE that at the hearing of this suit, the Defendant/Respondent shall raise a Preliminary Objection praying this Honourable Court to strike out and/or dismiss this suit on the following grounds:</p>
        <ol className="list-decimal pl-8 space-y-4 mt-3">
          <li>{f.ground}</li>
          <li>{f.basis}</li>
          <li>The Court lacks the jurisdiction to entertain this suit as presently constituted.</li>
        </ol>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>RELIEFS SOUGHT:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>An order striking out or dismissing this suit for being incompetent.</li>
            <li>Such further orders as this Honourable Court may deem fit.</li>
          </ol>
        </div>
        <p className="mt-6">This Notice is supported by a Written Address filed along with this application.</p>
        <ProcessFooter role="Defendant/Respondent" serviceParties={f.applicant} serviceRole="Claimant" />
      </>
    ),
  },

  "Originating Summons": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Question for Determination", key: "question", type: "textarea", defaultValue: "Whether upon a true and proper construction of Section 20 of the Companies and Allied Matters Act, 2020, the Claimant is entitled to inspect the books and records of the Defendant company." },
      { label: "Relief Sought", key: "relief", type: "textarea", defaultValue: "A declaration that the Claimant, as a shareholder of the Defendant company, is entitled to access and inspect the statutory books and records of the Defendant." },
    ],
    aiSuggestions: ["Add statutory references", "Check CAMA provisions", "Cite relevant authorities", "Refine questions for determination"],
    aiTip: "Originating Summons is used where there is no substantial dispute of facts. Ensure questions are clearly framed for judicial determination.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>ORIGINATING SUMMONS</div>
        <BroughtPursuantTo court={f.court} state={f.state} />
        <p className="mt-4">LET the Defendant within thirty (30) days after the service on them of this Summons, inclusive of the day of such service, cause an appearance to be entered for them in the Registry of this Honourable Court to this Summons, which is issued upon the application of the Claimant, seeking the determination of the following questions:</p>
        <div className="mt-4">
          <p style={{ fontWeight: 700 }}>QUESTIONS FOR THE DETERMINATION OF THE COURT:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>{f.question}</li>
          </ol>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>RELIEFS SOUGHT:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>{f.relief}</li>
            <li>An order of perpetual injunction restraining the Defendant from denying the Claimant access to the company's records.</li>
            <li>Cost of this application.</li>
          </ol>
        </div>
        <ProcessFooter role="Claimant" serviceParties={f.respondent} serviceRole="Defendant" />
      </>
    ),
  },

  "Writ of Summons": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Claim Amount (₦)", key: "amount", type: "text", defaultValue: "150,000,000.00" },
      { label: "Cause of Action", key: "cause", type: "textarea", defaultValue: "Breach of contract for the supply and delivery of industrial equipment pursuant to a Supply Agreement dated 15th March 2025." },
    ],
    aiSuggestions: ["Add particulars of claim", "Check limitation period", "Verify jurisdiction", "Add special damages"],
    aiTip: "Ensure the Writ is accompanied by a Statement of Claim. Check the Limitation Law to confirm the cause of action is not statute-barred.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>WRIT OF SUMMONS</div>
        <p>TO: <span className="uppercase" style={{ fontWeight: 600 }}>{dp(f.respondent)}</span></p>
        <p className="mt-4">YOU ARE HEREBY COMMANDED that within thirty (30) days after the service on you of this Writ, inclusive of the day of such service, you do cause an appearance to be entered for you in an action at the suit of <span className="uppercase" style={{ fontWeight: 600 }}>{dp(f.applicant)}</span>.</p>
        <p className="mt-4">AND TAKE NOTICE that in default of your so doing, the Claimant may proceed therein and judgment may be given in your absence.</p>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>THE CLAIMANT'S CLAIMS AGAINST THE DEFENDANT ARE:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>The sum of ₦{f.amount} (Naira) being general and special damages for {f.cause}</li>
            <li>10% interest per annum on the said sum from the date of breach until the date of judgment.</li>
            <li>Cost of this action.</li>
          </ol>
        </div>
        <div className="mt-12 text-center">
          <p style={{ fontWeight: 600 }}>Issued at Lagos this ______ day of ______________ 2026</p>
          <div className="mt-8 w-[200px] mx-auto border-t border-[#0F172A] pt-2">
            <p style={{ fontSize: "13px" }}>Chief Registrar</p>
          </div>
        </div>
        <CounselAddress role="Claimant" />
        <ForServiceBlock parties={f.respondent} role="Defendant" />
      </>
    ),
  },

  "Notice of Appeal": {
    fields: [
      { label: "Appellant", key: "applicant", type: "multiParty", defaultValue: "TechCorp Solutions Ltd", partyRole: "Appellant" },
      { label: "Respondent", key: "respondent", type: "multiParty", defaultValue: "Global Logistics Inc.", partyRole: "Respondent" },
      courtField, stateField, divisionField,
      { label: "Lower Court / Tribunal", key: "lowerCourt", type: "text", defaultValue: "Federal High Court, Lagos Division" },
      { label: "Date of Decision", key: "decisionDate", type: "text", defaultValue: "15th January 2026" },
      { label: "Ground of Appeal", key: "ground", type: "textarea", defaultValue: "The learned trial Judge erred in law when he held that the Appellant had failed to establish a prima facie case, thereby dismissing the Appellant's suit." },
    ],
    aiSuggestions: ["Add more grounds of appeal", "Cite appellate authorities", "Draft Appellant's brief", "Check appeal timelines"],
    aiTip: "The Notice of Appeal must be filed within 90 days for appeals as of right (S.241 CFRN) or 14 days with leave. Verify timeline compliance.",
    renderDocument: (f) => (
      <>
        <div className="text-center uppercase" style={{ fontWeight: 700 }}>
          <p>IN THE COURT OF APPEAL</p>
          <p>IN THE {f.division.toUpperCase()} JUDICIAL DIVISION</p>
          <p className="mt-2">HOLDEN AT {f.division.toUpperCase()}</p>
        </div>
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Appellant" respondentRole="Respondent" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>NOTICE OF APPEAL</div>
        <p>TAKE NOTICE that the Appellant being dissatisfied with the decision of the {f.lowerCourt} delivered on {f.decisionDate} by Honourable Justice ______________ hereby appeals to the Court of Appeal upon the following grounds:</p>
        <div className="mt-4">
          <p style={{ fontWeight: 700 }}>GROUNDS OF APPEAL:</p>
          <p className="mt-2" style={{ fontWeight: 600 }}>GROUND ONE:</p>
          <p>{f.ground}</p>
          <div className="mt-4 pl-4">
            <p style={{ fontWeight: 600, fontSize: "14px" }}>PARTICULARS:</p>
            <ol className="list-lower-alpha pl-6 space-y-2 mt-2">
              <li>The trial Court failed to properly evaluate the evidence before it.</li>
              <li>Had the Court properly evaluated the evidence, it would have arrived at a different conclusion.</li>
            </ol>
          </div>
        </div>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>RELIEFS SOUGHT FROM THE COURT OF APPEAL:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>An order setting aside the judgment of the lower court.</li>
            <li>An order entering judgment in favour of the Appellant.</li>
            <li>Cost of this appeal.</li>
          </ol>
        </div>
        <ProcessFooter role="Appellant" serviceParties={f.respondent} serviceRole="Respondent" />
      </>
    ),
  },

  "Memorandum of Appearance": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Address for Service", key: "serviceAddress", type: "textarea", defaultValue: "No. ___, ______ Street, ______, Lagos State." },
      { label: "Defendant's Counsel", key: "counsel", type: "text", defaultValue: "M/S Adewale & Co." },
    ],
    aiSuggestions: ["Ensure suit details match originating process", "State counsel clearly", "Provide complete address for service", "Confirm party designation"],
    aiTip: "Use this process to formally enter appearance for the Defendant/Respondent after service of originating process.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>MEMORANDUM (NOTICE) OF APPEARANCE</div>
        <p className="mt-6">TAKE NOTICE that the Defendant above named hereby enters appearance in this suit.</p>
        <p className="mt-4">AND TAKE FURTHER NOTICE that the Defendant's address for service is <span style={{ fontWeight: 600 }}>{f.serviceAddress}</span>.</p>
        <p className="mt-4">This Memorandum of Appearance is filed by <span style={{ fontWeight: 600 }}>{f.counsel}</span>, Counsel to the Defendant.</p>
        <ProcessFooter role="Defendant" serviceParties={f.applicant} serviceRole="Claimant" />
      </>
    ),
  },

  "Statement of claim": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Claim Amount (₦)", key: "amount", type: "text", defaultValue: "75,000,000.00" },
      { label: "Facts of the Case", key: "facts", type: "textarea", defaultValue: "The Claimant is a company incorporated under the laws of Nigeria and engaged in the business of technology services. The Defendant is a logistics company. By a contract dated 10th February 2025, the Claimant engaged the Defendant to deliver equipment." },
    ],
    aiSuggestions: ["Add particulars of special damages", "Strengthen factual narrative", "Insert documentary evidence references", "Check for joinder issues"],
    aiTip: "Ensure every material fact is pleaded. Remember: parties are bound by their pleadings. Include specific dates, amounts, and documentary references.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>STATEMENT OF CLAIM</div>
        <p>The Claimant claims against the Defendant as follows:</p>
        <div className="mt-4">
          <p style={{ fontWeight: 700 }}>THE PARTIES:</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>The Claimant is {dp(f.applicant)}, a company duly incorporated under the laws of the Federal Republic of Nigeria with its registered office at ______, Lagos.</li>
            <li>The Defendant is {dp(f.respondent)}, a company likewise incorporated under the laws of Nigeria with its registered office at ______, Lagos.</li>
          </ol>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>FACTS OF THE CASE:</p>
          <ol start={3} className="list-decimal pl-8 space-y-3 mt-3">
            <li>{f.facts}</li>
            <li>Despite repeated demands, the Defendant has failed, refused and/or neglected to perform its obligations under the said contract.</li>
            <li>By reason of the Defendant's breach, the Claimant has suffered loss and damage in the sum of ₦{f.amount}.</li>
          </ol>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>RELIEFS:</p>
          <p className="mt-2">WHEREFORE the Claimant claims against the Defendant:</p>
          <ol className="list-lower-alpha pl-8 space-y-3 mt-3">
            <li>The sum of ₦{f.amount} being special and general damages.</li>
            <li>Interest at 10% per annum from the date of breach.</li>
            <li>Cost of this action.</li>
          </ol>
        </div>
        <ProcessFooter role="Claimant" serviceParties={f.respondent} serviceRole="Defendant" />
      </>
    ),
  },

  "Counter Affidavit": {
    fields: [
      { label: "Deponent Name", key: "deponent", type: "text", defaultValue: "Akinwale Olakunle" },
      { label: "Deponent Title", key: "deponentTitle", type: "text", defaultValue: "Managing Director" },
      applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Response Facts", key: "facts", type: "textarea", defaultValue: "The allegations contained in the Applicant's affidavit are false and misleading. The Respondent has at all material times complied with its contractual obligations." },
    ],
    aiSuggestions: ["Strengthen denial paragraphs", "Add documentary evidence", "Check for hearsay issues", "Cross-reference supporting affidavit"],
    aiTip: "Each paragraph should respond to a specific paragraph in the Applicant's affidavit. Avoid vague denials — be specific.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>COUNTER AFFIDAVIT</div>
        <p>I, <span className="uppercase" style={{ fontWeight: 600 }}>{f.deponent}</span>, {f.deponentTitle} of {dp(f.respondent)}, Nigerian Citizen, Male, Adult, Christian/Muslim, do hereby make oath and state as follows:</p>
        <ol className="list-decimal pl-8 space-y-4 mt-4">
          <li>That I am the {f.deponentTitle} of the Respondent company and I am conversant with the facts of this case.</li>
          <li>That I have the authority of the Respondent to depose to this affidavit.</li>
          <li>That I have read the Affidavit in support of the Applicant's motion filed in this suit.</li>
          <li>That {f.facts}</li>
          <li>That the Respondent denies each and every allegation contained in the Applicant's affidavit save as expressly admitted herein.</li>
          <li>That the Applicant's application is an abuse of court process and ought to be dismissed.</li>
          <li>That it is in the interest of justice to refuse the reliefs sought by the Applicant.</li>
          <li>That I depose to this affidavit in good faith believing the contents to be true and correct.</li>
        </ol>
        <DeponentBlock />
      </>
    ),
  },

  "Further Affidavit": {
    fields: [
      { label: "Deponent Name", key: "deponent", type: "text", defaultValue: "Chidinma Okafor" },
      applicantField, respondentField, courtField, stateField, divisionField,
      { label: "New Facts", key: "facts", type: "textarea", defaultValue: "Since the filing of the initial affidavit, new facts have emerged which are material to the just determination of this case." },
    ],
    aiSuggestions: ["Justify need for further affidavit", "Add supporting exhibits", "Cross-reference prior affidavit", "Check procedural compliance"],
    aiTip: "A Further Affidavit should only contain genuinely new facts that arose after the initial affidavit. Courts frown upon using it to address inadequacies.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>FURTHER AFFIDAVIT</div>
        <p>I, <span className="uppercase" style={{ fontWeight: 600 }}>{f.deponent}</span>, of ______, Lagos, do hereby make oath and state as follows:</p>
        <ol className="list-decimal pl-8 space-y-4 mt-4">
          <li>That I am the Applicant in this suit and I deposed to the initial affidavit filed in support of this application.</li>
          <li>That I have read the Counter Affidavit of the Respondent filed on ______.</li>
          <li>That {f.facts}</li>
          <li>That the new facts are material and necessary for the just determination of this matter.</li>
          <li>That I depose to this Further Affidavit in good faith.</li>
        </ol>
        <DeponentBlock />
      </>
    ),
  },

  "Affidavit of Facts": {
    fields: [
      { label: "Deponent Name", key: "deponent", type: "text", defaultValue: "Oluwaseun Bello" },
      { label: "Deponent Occupation", key: "occupation", type: "text", defaultValue: "Legal Practitioner" },
      applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Material Facts", key: "facts", type: "textarea", defaultValue: "The Applicant entered into a contract with the Respondent on 1st March 2025 for the supply of goods valued at ₦50,000,000." },
    ],
    aiSuggestions: ["Verify facts against documents", "Add exhibit references", "Check hearsay compliance", "Strengthen material paragraphs"],
    aiTip: "Every fact must be within the deponent's personal knowledge or clearly attributed to information and belief with the source identified.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>AFFIDAVIT OF FACTS</div>
        <p>I, <span className="uppercase" style={{ fontWeight: 600 }}>{f.deponent}</span>, {f.occupation}, of ______, Lagos, Nigerian Citizen, do make oath and state as follows:</p>
        <ol className="list-decimal pl-8 space-y-4 mt-4">
          <li>That I am the {f.occupation} to the Applicant/Claimant in this suit and by virtue of my position, I am familiar with the facts of this case.</li>
          <li>That I have the authority and consent of the Applicant to depose to this Affidavit.</li>
          <li>That {f.facts}</li>
          <li>That the above facts are within my personal knowledge and are true to the best of my information and belief.</li>
          <li>That I depose to this affidavit in good faith believing same to be true and correct and in accordance with the Oaths Act, Laws of the Federation.</li>
        </ol>
        <DeponentBlock />
      </>
    ),
  },

  "Witness Statement on Oath": {
    fields: [
      { label: "Witness Name", key: "witness", type: "text", defaultValue: "Adebayo Mustafa" },
      { label: "Witness Occupation", key: "occupation", type: "text", defaultValue: "Accountant" },
      applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Testimony", key: "testimony", type: "textarea", defaultValue: "I was present at the meeting of 15th March 2025 where the Defendant agreed to supply 500 units of industrial generators within 60 days." },
    ],
    aiSuggestions: ["Organize chronologically", "Add exhibit references", "Check Evidence Act compliance", "Identify potential cross-examination points"],
    aiTip: "Under the Evidence Act 2011, the Witness Statement on Oath serves as the examination-in-chief. Ensure it covers all material facts the witness will testify to.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>WITNESS STATEMENT ON OATH</div>
        <p>I, <span className="uppercase" style={{ fontWeight: 600 }}>{f.witness}</span>, {f.occupation}, of ______, Lagos, do hereby state on oath as follows:</p>
        <ol className="list-decimal pl-8 space-y-4 mt-4">
          <li>That my name is {f.witness}. I am a {f.occupation} by profession.</li>
          <li>That I am familiar with the facts and circumstances of this case.</li>
          <li>That {f.testimony}</li>
          <li>That I have documents in my possession which I shall rely upon at the trial of this matter. Copies of the said documents are attached hereto and marked as Exhibits.</li>
          <li>That the above facts are within my personal knowledge and are true to the best of my knowledge and belief.</li>
        </ol>
        <DeponentBlock />
      </>
    ),
  },

  "Written Address": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Issue for Determination", key: "issue", type: "textarea", defaultValue: "Whether the Applicant has established sufficient grounds for the grant of an interlocutory injunction." },
      { label: "Submission", key: "submission", type: "textarea", defaultValue: "It is humbly submitted that the Applicant has satisfied the conditions for the grant of an interlocutory injunction as laid down in the case of Kotoye v. CBN (1989) 1 NWLR (Pt. 98) 419." },
    ],
    aiSuggestions: ["Add more case authorities", "Strengthen legal arguments", "Add statutory references", "Draft reply on points of law"],
    aiTip: "A well-structured written address should have: Introduction, Issues for Determination, Arguments/Submissions, and Conclusion.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} />
        <div className="text-center underline" style={{ fontWeight: 700 }}>WRITTEN ADDRESS IN SUPPORT OF THE APPLICANT'S MOTION</div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>1.0 INTRODUCTION</p>
          <p className="mt-2">This Written Address is filed in support of the Applicant's Motion on Notice dated ______ and filed on ______. The motion is supported by an Affidavit of ______ paragraphs deposed to by ______.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>2.0 ISSUE FOR DETERMINATION</p>
          <p className="mt-2">{f.issue}</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>3.0 ARGUMENT/SUBMISSION</p>
          <p className="mt-2">{f.submission}</p>
          <p className="mt-4">The Supreme Court in the celebrated case of <span style={{ fontStyle: "italic" }}>American Cyanamid Co. v. Ethicon Ltd (1975) AC 396</span> laid down the guidelines for the grant of interlocutory injunctions.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>4.0 CONCLUSION</p>
          <p className="mt-2">In the light of the foregoing submissions, it is most respectfully urged that this Honourable Court grant the reliefs sought by the Applicant in the interest of justice.</p>
        </div>
        <ProcessFooter role="Applicant" serviceParties={f.respondent} />
      </>
    ),
  },

  "Statement of Defence": {
    fields: [applicantField, respondentField, courtField, stateField, divisionField,
      { label: "Defence Summary", key: "defence", type: "textarea", defaultValue: "The Defendant denies each and every allegation in the Statement of Claim save as expressly admitted herein. The contract was frustrated by force majeure events beyond the Defendant's control." },
    ],
    aiSuggestions: ["Add counterclaim", "Strengthen denials", "Add contributory negligence defence", "Cite force majeure authorities"],
    aiTip: "A defence must traverse (admit, deny, or confess and avoid) each material paragraph of the Statement of Claim.",
    renderDocument: (f) => (
      <>
        <CourtHeader court={f.court} division={f.division} state={f.state} />
        <PartiesBlock applicant={f.applicant} respondent={f.respondent} applicantRole="Claimant" respondentRole="Defendant" />
        <div className="text-center underline" style={{ fontWeight: 700 }}>STATEMENT OF DEFENCE</div>
        <ol className="list-decimal pl-8 space-y-4 mt-4">
          <li>The Defendant admits paragraphs 1 and 2 of the Statement of Claim only insofar as they relate to the identities of the parties.</li>
          <li>{f.defence}</li>
          <li>The Defendant avers that even if there was any breach (which is denied), the Claimant contributed to the loss by its failure to mitigate damages.</li>
          <li>The Defendant shall rely on all documents pleaded herein at the trial of this suit.</li>
        </ol>
        <p className="mt-8">WHEREFORE the Defendant urges this Honourable Court to dismiss the Claimant's suit with substantial costs.</p>
        <ProcessFooter role="Defendant" serviceParties={f.applicant} serviceRole="Claimant" />
      </>
    ),
  },

  // ─── INTELLECTUAL PROPERTY ──────────────────────────────────────────

  "Trademark Application": {
    fields: [
      { label: "Applicant / Owner", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Trademark Name / Mark", key: "mark", type: "text", defaultValue: "TECHFLOW" },
      { label: "Class of Goods/Services", key: "classNo", type: "text", defaultValue: "Class 9 — Computer software and applications" },
      { label: "Description of Mark", key: "description", type: "textarea", defaultValue: "The mark consists of the word 'TECHFLOW' in stylized uppercase letters in teal (#22B8C7) with a circuit-board motif integrated into the letter 'O'." },
      { label: "Date of First Use", key: "firstUse", type: "text", defaultValue: "1st June 2024" },
    ],
    aiSuggestions: ["Check trademark availability", "Add more classes", "Strengthen distinctiveness", "Add goods/services specification"],
    aiTip: "Conduct a trademark search before filing. Ensure the mark is distinctive and not merely descriptive of the goods/services.",
    renderDocument: (f) => (
      <>
        <div className="text-center uppercase" style={{ fontWeight: 700 }}>
          <p>TRADEMARKS, PATENTS AND DESIGNS REGISTRY</p>
          <p>FEDERAL MINISTRY OF INDUSTRY, TRADE AND INVESTMENT</p>
          <p className="mt-2">TRADE MARKS ACT, CAP T13, LFN 2004</p>
        </div>
        <div className="text-center underline mt-6" style={{ fontWeight: 700 }}>APPLICATION FOR REGISTRATION OF A TRADE MARK</div>
        <div className="mt-6 space-y-4">
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Application Date:</span><span>______ 2026</span></div>
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Applicant:</span><span>{f.applicant}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Address:</span><span>______, Lagos, Nigeria</span></div>
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Nationality:</span><span>Nigerian</span></div>
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Trade Mark:</span><span style={{ fontWeight: 700 }}>{f.mark}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Class:</span><span>{f.classNo}</span></div>
          <div className="flex items-start"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>Description:</span><span>{f.description}</span></div>
          <div className="flex"><span className="w-[200px] shrink-0" style={{ fontWeight: 600 }}>First Use:</span><span>{f.firstUse}</span></div>
        </div>
        <div className="mt-8 p-6 border-2 border-dashed border-[#D1D5DB] rounded-lg text-center text-[#6B7280] min-h-[150px] flex items-center justify-center">
          [Representation of Mark]
        </div>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>DECLARATION:</p>
          <p className="mt-2">I/We hereby declare that the trade mark is being used by me/us or with my/our consent in relation to the goods/services mentioned above and I/We claim to be the proprietor(s) thereof.</p>
        </div>
        <SignatureBlock title="Applicant / Authorized Agent" />
      </>
    ),
  },

  "Cease and Desist Letter": {
    fields: [
      { label: "Sender (Rights Holder)", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Recipient (Infringer)", key: "respondent", type: "text", defaultValue: "CopyTech Systems Ltd" },
      { label: "IP Right Infringed", key: "ipRight", type: "text", defaultValue: "Registered Trademark 'TECHFLOW' (Registration No. NG/TM/2024/5678)" },
      { label: "Infringing Activity", key: "activity", type: "textarea", defaultValue: "The unauthorized use of the mark 'TECHFLO' on your website, marketing materials, and product packaging, which is confusingly similar to our client's registered trademark." },
      { label: "Deadline (Days)", key: "deadline", type: "text", defaultValue: "14" },
    ],
    aiSuggestions: ["Strengthen infringement claims", "Add damages calculation", "Cite relevant IP statutes", "Add alternative dispute options"],
    aiTip: "A cease and desist letter is a pre-litigation tool. Be firm but professional. Always offer a resolution path before threatening litigation.",
    renderDocument: (f) => (
      <>
        <div className="text-right" style={{ fontSize: "14px" }}>
          <p>[Letterhead]</p>
          <p className="mt-2">______ 2026</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 600 }}>PRIVATE & CONFIDENTIAL</p>
          <p className="mt-2">The Managing Director</p>
          <p>{f.respondent}</p>
          <p>______</p>
          <p>Lagos, Nigeria</p>
        </div>
        <p className="mt-6">Dear Sir/Madam,</p>
        <div className="text-center underline my-4" style={{ fontWeight: 700 }}>RE: CEASE AND DESIST — INFRINGEMENT OF {f.ipRight.toUpperCase()}</div>
        <p>We are solicitors to <span style={{ fontWeight: 600 }}>{f.applicant}</span> (hereinafter referred to as "our Client") and write on the express instructions of our Client.</p>
        <p className="mt-4">Our Client is the registered proprietor of {f.ipRight}.</p>
        <p className="mt-4">It has come to our Client's attention that your company has been engaged in {f.activity}</p>
        <p className="mt-4">The above acts constitute an infringement of our Client's intellectual property rights under the Trade Marks Act, Cap T13, LFN 2004 and other applicable laws.</p>
        <p className="mt-4" style={{ fontWeight: 600 }}>DEMAND:</p>
        <p>We hereby demand that you:</p>
        <ol className="list-decimal pl-8 space-y-3 mt-3">
          <li>Immediately cease and desist from all use of the infringing mark.</li>
          <li>Remove all infringing materials from your website, products, and marketing materials within <span style={{ fontWeight: 600 }}>{f.deadline} days</span>.</li>
          <li>Provide a written undertaking that you will not use the infringing mark in the future.</li>
          <li>Account for all profits made from the unauthorized use of the mark.</li>
        </ol>
        <p className="mt-4">Failure to comply with the above demands within <span style={{ fontWeight: 600 }}>{f.deadline} days</span> of receipt of this letter will leave our Client with no alternative but to institute legal proceedings against your company without further notice.</p>
        <p className="mt-6">Yours faithfully,</p>
        <SignatureBlock title="[Firm Name]\nSolicitors to TechCorp Solutions Ltd" />
      </>
    ),
  },

  // ─── CORPORATE ──────────────────────────────────────────────────────

  "Board Resolution": {
    fields: [
      { label: "Company Name", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "RC Number", key: "rcNumber", type: "text", defaultValue: "RC 1234567" },
      { label: "Meeting Date", key: "meetingDate", type: "text", defaultValue: "15th March 2026" },
      { label: "Resolution Subject", key: "subject", type: "text", defaultValue: "Approval of the acquisition of 60% equity stake in DataStream Analytics Ltd" },
      { label: "Resolution Details", key: "details", type: "textarea", defaultValue: "The Board hereby approves the acquisition of 60% equity stake in DataStream Analytics Ltd for a total consideration of ₦500,000,000 subject to satisfactory due diligence and regulatory approvals." },
      { label: "Chairman", key: "chairman", type: "text", defaultValue: "Chief Adewale Johnson" },
    ],
    aiSuggestions: ["Add CAMA compliance check", "Insert voting record", "Add conflict of interest disclosure", "Draft shareholders' resolution"],
    aiTip: "Ensure quorum requirements under CAMA 2020 are met. Directors with conflicts of interest must declare and abstain from voting.",
    renderDocument: (f) => (
      <>
        <div className="text-center" style={{ fontWeight: 700 }}>
          <p className="uppercase">{f.applicant}</p>
          <p style={{ fontSize: "13px" }}>({f.rcNumber})</p>
        </div>
        <div className="text-center underline mt-6" style={{ fontWeight: 700 }}>RESOLUTION OF THE BOARD OF DIRECTORS</div>
        <div className="mt-6 space-y-3">
          <p><span style={{ fontWeight: 600 }}>Date:</span> {f.meetingDate}</p>
          <p><span style={{ fontWeight: 600 }}>Venue:</span> Conference Room, Head Office, Lagos</p>
          <p><span style={{ fontWeight: 600 }}>Present:</span></p>
          <ol className="list-decimal pl-8 space-y-1">
            <li>{f.chairman} — Chairman</li>
            <li>______ — Director</li>
            <li>______ — Director</li>
            <li>______ — Company Secretary</li>
          </ol>
        </div>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>RE: {f.subject.toUpperCase()}</p>
          <p className="mt-4">After due deliberation, IT WAS RESOLVED as follows:</p>
          <ol className="list-decimal pl-8 space-y-4 mt-4">
            <li>{f.details}</li>
            <li>That the Managing Director and Company Secretary be and are hereby authorized to execute all necessary documents and take all steps required to give effect to this resolution.</li>
            <li>That the Company Secretary shall file the necessary returns with the Corporate Affairs Commission.</li>
          </ol>
        </div>
        <p className="mt-8">There being no further business, the meeting was brought to a close.</p>
        <div className="mt-12 flex justify-between">
          <div className="w-[200px] border-t border-[#0F172A] pt-2">
            <p style={{ fontSize: "13px" }}>Chairman</p>
            <p style={{ fontSize: "12px" }}>{f.chairman}</p>
          </div>
          <div className="w-[200px] border-t border-[#0F172A] pt-2">
            <p style={{ fontSize: "13px" }}>Company Secretary</p>
          </div>
        </div>
      </>
    ),
  },

  "Memorandum of Understanding": {
    fields: [
      { label: "First Party", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Second Party", key: "respondent", type: "text", defaultValue: "Global Logistics Inc." },
      { label: "Purpose", key: "purpose", type: "textarea", defaultValue: "To establish a strategic partnership for the joint development and deployment of an integrated supply chain management platform." },
      { label: "Duration (Months)", key: "duration", type: "text", defaultValue: "24" },
      { label: "Key Terms", key: "terms", type: "textarea", defaultValue: "Each party shall contribute equally to the development costs. Revenue shall be shared in the ratio of 60:40 in favour of the First Party." },
    ],
    aiSuggestions: ["Add confidentiality clause", "Insert dispute resolution", "Add termination provisions", "Clarify IP ownership"],
    aiTip: "An MOU can be binding or non-binding. Clearly state the intention. If non-binding, include an express 'no legal obligation' clause.",
    renderDocument: (f) => (
      <>
        <div className="text-center underline" style={{ fontWeight: 700 }}>MEMORANDUM OF UNDERSTANDING</div>
        <p className="mt-6">This Memorandum of Understanding (hereinafter referred to as "MOU") is made this ______ day of ______________ 2026.</p>
        <p className="mt-4" style={{ fontWeight: 700 }}>BETWEEN:</p>
        <p><span style={{ fontWeight: 600 }}>{f.applicant}</span>, a company incorporated under the laws of the Federal Republic of Nigeria (hereinafter referred to as "the First Party")</p>
        <p className="mt-3" style={{ fontWeight: 700 }}>AND</p>
        <p><span style={{ fontWeight: 600 }}>{f.respondent}</span>, a company incorporated under the laws of the Federal Republic of Nigeria (hereinafter referred to as "the Second Party")</p>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>1. PURPOSE</p>
          <p className="mt-2">{f.purpose}</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>2. DURATION</p>
          <p className="mt-2">This MOU shall be valid for a period of {f.duration} months from the date of execution, unless terminated earlier by either party upon 30 days' written notice.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>3. KEY TERMS</p>
          <p className="mt-2">{f.terms}</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>4. CONFIDENTIALITY</p>
          <p className="mt-2">Both parties agree to keep confidential all information shared in the course of this partnership and not to disclose same to third parties without prior written consent.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>5. GOVERNING LAW</p>
          <p className="mt-2">This MOU shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
        </div>
        <div className="mt-12 flex justify-between">
          <div>
            <p style={{ fontWeight: 600 }}>For the First Party:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2">
              <p style={{ fontSize: "13px" }}>Authorized Signatory</p>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>For the Second Party:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2">
              <p style={{ fontSize: "13px" }}>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </>
    ),
  },

  // ─── PROPERTY ───────────────────────────────────────────────────────

  "Lease Agreement": {
    fields: [
      { label: "Landlord", key: "applicant", type: "text", defaultValue: "Premium Properties Ltd" },
      { label: "Tenant", key: "respondent", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Property Address", key: "property", type: "textarea", defaultValue: "Suite 401, Admiralty Towers, Plot 15, Admiralty Way, Lekki Phase 1, Lagos" },
      { label: "Annual Rent (₦)", key: "rent", type: "text", defaultValue: "12,000,000.00" },
      { label: "Lease Duration (Years)", key: "duration", type: "text", defaultValue: "3" },
      { label: "Commencement Date", key: "startDate", type: "text", defaultValue: "1st April 2026" },
    ],
    aiSuggestions: ["Add break clause", "Insert rent review provision", "Add repair obligations", "Check Lagos Tenancy Law compliance"],
    aiTip: "Ensure compliance with the Lagos State Tenancy Law 2011. Include provisions on rent review, repair obligations, and permitted use.",
    renderDocument: (f) => (
      <>
        <div className="text-center underline" style={{ fontWeight: 700 }}>LEASE AGREEMENT</div>
        <p className="mt-6">THIS LEASE AGREEMENT is made this ______ day of ______________ 2026.</p>
        <p className="mt-4" style={{ fontWeight: 700 }}>BETWEEN:</p>
        <p><span style={{ fontWeight: 600 }}>{f.applicant}</span> (hereinafter referred to as "the Landlord")</p>
        <p className="mt-3" style={{ fontWeight: 700 }}>AND</p>
        <p><span style={{ fontWeight: 600 }}>{f.respondent}</span> (hereinafter referred to as "the Tenant")</p>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>1. PROPERTY</p>
          <p className="mt-2">The Landlord hereby demises unto the Tenant ALL THAT property known as and situate at {f.property}.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>2. TERM</p>
          <p className="mt-2">The term of this Lease shall be {f.duration} year(s) commencing from {f.startDate}.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>3. RENT</p>
          <p className="mt-2">The Tenant shall pay an annual rent of ₦{f.rent} payable in advance on or before the commencement of each year of the tenancy.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>4. USE OF PREMISES</p>
          <p className="mt-2">The premises shall be used solely for office/commercial purposes and for no other purpose without the prior written consent of the Landlord.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>5. REPAIRS AND MAINTENANCE</p>
          <p className="mt-2">The Tenant shall keep the interior of the premises in good and tenantable repair. The Landlord shall be responsible for structural repairs and external maintenance.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>6. TERMINATION</p>
          <p className="mt-2">Either party may terminate this Lease by giving not less than six (6) months' written notice to the other party.</p>
        </div>
        <div className="mt-12 flex justify-between">
          <div>
            <p style={{ fontWeight: 600 }}>LANDLORD:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2">
              <p style={{ fontSize: "13px" }}>Signature & Stamp</p>
            </div>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>TENANT:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2">
              <p style={{ fontSize: "13px" }}>Signature & Stamp</p>
            </div>
          </div>
        </div>
      </>
    ),
  },

  "Deed of Assignment": {
    fields: [
      { label: "Assignor", key: "applicant", type: "text", defaultValue: "Chief Olumide Bakare" },
      { label: "Assignee", key: "respondent", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Property Description", key: "property", type: "textarea", defaultValue: "All that piece or parcel of land measuring approximately 2,500 square metres situate, lying and being at Plot 25, Lekki Peninsula Scheme II, Lagos State, covered by Survey Plan No. LS/D/LA/2024/001." },
      { label: "Purchase Price (₦)", key: "price", type: "text", defaultValue: "250,000,000.00" },
      { label: "Certificate of Occupancy No.", key: "cofo", type: "text", defaultValue: "LAS/2020/00456" },
    ],
    aiSuggestions: ["Add Governor's consent clause", "Insert survey plan reference", "Add encumbrance warranty", "Check Land Use Act compliance"],
    aiTip: "Under the Land Use Act, all assignments require the Governor's consent. Failure to obtain consent renders the transaction void. S.22 Land Use Act.",
    renderDocument: (f) => (
      <>
        <div className="text-center underline" style={{ fontWeight: 700 }}>DEED OF ASSIGNMENT</div>
        <p className="mt-6">THIS DEED OF ASSIGNMENT is made this ______ day of ______________ 2026.</p>
        <p className="mt-4" style={{ fontWeight: 700 }}>BETWEEN:</p>
        <p><span style={{ fontWeight: 600 }}>{f.applicant}</span> of ______, Lagos (hereinafter referred to as "the Assignor")</p>
        <p className="mt-3" style={{ fontWeight: 700 }}>AND</p>
        <p><span style={{ fontWeight: 600 }}>{f.respondent}</span> of ______, Lagos (hereinafter referred to as "the Assignee")</p>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>RECITALS:</p>
          <ol className="list-upper-alpha pl-8 space-y-3 mt-3">
            <li>The Assignor is the holder of the right of occupancy over {f.property} by virtue of Certificate of Occupancy No. {f.cofo}.</li>
            <li>The Assignor has agreed to assign all his right, title and interest in the said property to the Assignee for the sum of ₦{f.price}.</li>
          </ol>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>NOW THIS DEED WITNESSES AS FOLLOWS:</p>
          <ol className="list-decimal pl-8 space-y-4 mt-3">
            <li>In consideration of the sum of ₦{f.price} paid by the Assignee to the Assignor (the receipt of which the Assignor hereby acknowledges), the Assignor hereby assigns and transfers all his right, title and interest in the property to the Assignee.</li>
            <li>The Assignor covenants that he has good title to the property and that the property is free from all encumbrances.</li>
            <li>This Assignment is subject to the consent of the Governor of Lagos State pursuant to Section 22 of the Land Use Act, Cap L5, LFN 2004.</li>
          </ol>
        </div>
        <div className="mt-12 flex justify-between">
          <div>
            <p style={{ fontWeight: 600 }}>ASSIGNOR:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Signature</p></div>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>ASSIGNEE:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Signature & Stamp</p></div>
          </div>
        </div>
        <div className="mt-8 text-center border-t border-[#D1D5DB] pt-6">
          <p style={{ fontWeight: 700 }}>WITNESSES:</p>
          <div className="flex justify-between mt-6">
            <div className="w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Witness 1</p></div>
            <div className="w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Witness 2</p></div>
          </div>
        </div>
      </>
    ),
  },

  // ─── EMPLOYMENT ─────────────────────────────────────────────────────

  "Employment Contract": {
    fields: [
      { label: "Employer", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Employee Name", key: "respondent", type: "text", defaultValue: "Adebola Fasanya" },
      { label: "Position / Title", key: "position", type: "text", defaultValue: "Senior Software Engineer" },
      { label: "Annual Salary (₦)", key: "salary", type: "text", defaultValue: "18,000,000.00" },
      { label: "Start Date", key: "startDate", type: "text", defaultValue: "1st May 2026" },
      { label: "Probation Period (Months)", key: "probation", type: "text", defaultValue: "6" },
    ],
    aiSuggestions: ["Add benefits package", "Insert non-compete clause", "Add IP assignment clause", "Check Labour Act compliance"],
    aiTip: "Ensure compliance with the Nigerian Labour Act. Include provisions on probation, notice period, and statutory deductions (pension, NHF, PAYE).",
    renderDocument: (f) => (
      <>
        <div className="text-center" style={{ fontWeight: 700 }}>
          <p className="uppercase">{f.applicant}</p>
        </div>
        <div className="text-center underline mt-4" style={{ fontWeight: 700 }}>CONTRACT OF EMPLOYMENT</div>
        <p className="mt-6">This Contract of Employment is made this ______ day of ______________ 2026.</p>
        <p className="mt-4" style={{ fontWeight: 700 }}>BETWEEN:</p>
        <p><span style={{ fontWeight: 600 }}>{f.applicant}</span> (hereinafter referred to as "the Employer")</p>
        <p className="mt-3" style={{ fontWeight: 700 }}>AND</p>
        <p><span style={{ fontWeight: 600 }}>{f.respondent}</span> (hereinafter referred to as "the Employee")</p>

        <div className="mt-8 space-y-6">
          <div><p style={{ fontWeight: 700 }}>1. POSITION</p><p className="mt-2">The Employee is hereby employed as <span style={{ fontWeight: 600 }}>{f.position}</span>, reporting to the Head of Department or such other person as may be designated.</p></div>
          <div><p style={{ fontWeight: 700 }}>2. COMMENCEMENT</p><p className="mt-2">Employment shall commence on {f.startDate}.</p></div>
          <div><p style={{ fontWeight: 700 }}>3. PROBATION</p><p className="mt-2">The Employee shall serve a probation period of {f.probation} months. During this period, either party may terminate the employment with two (2) weeks' notice.</p></div>
          <div><p style={{ fontWeight: 700 }}>4. REMUNERATION</p><p className="mt-2">The Employee shall receive a gross annual salary of ₦{f.salary}, payable monthly in arrears, subject to statutory deductions (PAYE, Pension, NHF).</p></div>
          <div><p style={{ fontWeight: 700 }}>5. WORKING HOURS</p><p className="mt-2">The Employee shall work Monday to Friday, 9:00 AM to 5:00 PM, with a one-hour lunch break.</p></div>
          <div><p style={{ fontWeight: 700 }}>6. ANNUAL LEAVE</p><p className="mt-2">The Employee shall be entitled to 20 working days of paid annual leave per calendar year.</p></div>
          <div><p style={{ fontWeight: 700 }}>7. TERMINATION</p><p className="mt-2">After the probation period, either party may terminate this contract by giving three (3) months' written notice or payment of three months' salary in lieu of notice.</p></div>
          <div><p style={{ fontWeight: 700 }}>8. CONFIDENTIALITY</p><p className="mt-2">The Employee shall not, during or after employment, disclose any confidential information belonging to the Employer.</p></div>
          <div><p style={{ fontWeight: 700 }}>9. GOVERNING LAW</p><p className="mt-2">This Contract shall be governed by the laws of the Federal Republic of Nigeria, including the Labour Act and the Employee Compensation Act.</p></div>
        </div>

        <div className="mt-12 flex justify-between">
          <div>
            <p style={{ fontWeight: 600 }}>EMPLOYER:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Authorized Signatory</p></div>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>EMPLOYEE:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>{f.respondent}</p></div>
          </div>
        </div>
      </>
    ),
  },

  "Termination Letter": {
    fields: [
      { label: "Employer", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Employee Name", key: "respondent", type: "text", defaultValue: "Ibrahim Yusuf" },
      { label: "Position", key: "position", type: "text", defaultValue: "Marketing Manager" },
      { label: "Reason for Termination", key: "reason", type: "textarea", defaultValue: "Redundancy due to restructuring of the Marketing Department as part of the company's strategic realignment." },
      { label: "Notice Period", key: "notice", type: "text", defaultValue: "3 months" },
      { label: "Last Working Day", key: "lastDay", type: "text", defaultValue: "30th June 2026" },
    ],
    aiSuggestions: ["Add severance calculation", "Check Labour Act compliance", "Add handover provisions", "Insert non-disparagement clause"],
    aiTip: "Ensure the termination complies with the contract terms and the Labour Act. Provide adequate notice or payment in lieu. Include details on terminal benefits.",
    renderDocument: (f) => (
      <>
        <div className="text-right" style={{ fontSize: "14px" }}>
          <p style={{ fontWeight: 600 }}>{f.applicant}</p>
          <p>______, Lagos</p>
          <p className="mt-2">______ 2026</p>
        </div>
        <div className="mt-6">
          <p>{f.respondent}</p>
          <p>{f.position}</p>
          <p>{f.applicant}</p>
        </div>
        <p className="mt-6">Dear {f.respondent.split(" ")[0]},</p>
        <div className="text-center underline my-4" style={{ fontWeight: 700 }}>RE: TERMINATION OF EMPLOYMENT</div>
        <p>We write to formally notify you that your employment with {f.applicant} as {f.position} is hereby terminated effective {f.lastDay}.</p>
        <p className="mt-4"><span style={{ fontWeight: 600 }}>Reason:</span> {f.reason}</p>
        <p className="mt-4"><span style={{ fontWeight: 600 }}>Notice:</span> In accordance with your contract, you are being given {f.notice} notice. Your last working day will be {f.lastDay}.</p>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>TERMINAL BENEFITS:</p>
          <p className="mt-2">You shall receive the following:</p>
          <ol className="list-decimal pl-8 space-y-2 mt-2">
            <li>Salary up to and including {f.lastDay}</li>
            <li>Payment for any accrued but unused annual leave</li>
            <li>Severance pay as provided by company policy</li>
            <li>A certificate of service upon request</li>
          </ol>
        </div>
        <p className="mt-6">You are required to complete the handover of all company property, documents, and access credentials before your last working day.</p>
        <p className="mt-4">We thank you for your contributions to the company and wish you well in your future endeavours.</p>
        <p className="mt-6">Yours sincerely,</p>
        <SignatureBlock title="Head of Human Resources" />
      </>
    ),
  },

  // ─── DISPUTE RESOLUTION / ADR ───────────────────────────────────────

  "Settlement Agreement": {
    fields: [
      { label: "First Party", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Second Party", key: "respondent", type: "text", defaultValue: "Global Logistics Inc." },
      { label: "Dispute Description", key: "dispute", type: "textarea", defaultValue: "A dispute arising from the Supply Agreement dated 10th February 2025 regarding the delivery of 500 units of industrial generators." },
      { label: "Settlement Amount (₦)", key: "amount", type: "text", defaultValue: "45,000,000.00" },
      { label: "Payment Terms", key: "payment", type: "textarea", defaultValue: "The Second Party shall pay the settlement sum in two equal instalments: the first within 30 days and the second within 60 days of execution." },
    ],
    aiSuggestions: ["Add confidentiality clause", "Insert release and discharge", "Add non-admission clause", "Draft consent judgment"],
    aiTip: "Include a full and final settlement clause with mutual releases. Consider filing Terms of Settlement in court if litigation is pending.",
    renderDocument: (f) => (
      <>
        <div className="text-center underline" style={{ fontWeight: 700 }}>SETTLEMENT AGREEMENT</div>
        <p className="mt-6">THIS SETTLEMENT AGREEMENT is made this ______ day of ______________ 2026.</p>
        <p className="mt-4" style={{ fontWeight: 700 }}>BETWEEN:</p>
        <p><span style={{ fontWeight: 600 }}>{f.applicant}</span> (hereinafter referred to as "the First Party")</p>
        <p className="mt-3" style={{ fontWeight: 700 }}>AND</p>
        <p><span style={{ fontWeight: 600 }}>{f.respondent}</span> (hereinafter referred to as "the Second Party")</p>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>RECITALS:</p>
          <ol className="list-upper-alpha pl-8 space-y-3 mt-3">
            <li>{f.dispute}</li>
            <li>The parties have agreed to settle the dispute amicably on the terms set out below.</li>
          </ol>
        </div>
        <div className="mt-8 space-y-6">
          <div><p style={{ fontWeight: 700 }}>1. SETTLEMENT SUM</p><p className="mt-2">The Second Party shall pay to the First Party the total sum of ₦{f.amount} as full and final settlement of all claims arising from the dispute.</p></div>
          <div><p style={{ fontWeight: 700 }}>2. PAYMENT TERMS</p><p className="mt-2">{f.payment}</p></div>
          <div><p style={{ fontWeight: 700 }}>3. MUTUAL RELEASE</p><p className="mt-2">Upon receipt of the full settlement sum, both parties hereby release and forever discharge each other from all claims, demands, and causes of action arising from the dispute.</p></div>
          <div><p style={{ fontWeight: 700 }}>4. NON-ADMISSION</p><p className="mt-2">This agreement shall not be construed as an admission of liability by either party.</p></div>
          <div><p style={{ fontWeight: 700 }}>5. CONFIDENTIALITY</p><p className="mt-2">The terms of this Settlement Agreement shall be kept strictly confidential by both parties.</p></div>
          <div><p style={{ fontWeight: 700 }}>6. GOVERNING LAW</p><p className="mt-2">This Agreement shall be governed by the laws of the Federal Republic of Nigeria.</p></div>
        </div>
        <div className="mt-12 flex justify-between">
          <div>
            <p style={{ fontWeight: 600 }}>FIRST PARTY:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Authorized Signatory</p></div>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>SECOND PARTY:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Authorized Signatory</p></div>
          </div>
        </div>
      </>
    ),
  },

  "Arbitration Notice": {
    fields: [
      { label: "Claimant", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Respondent", key: "respondent", type: "text", defaultValue: "Global Logistics Inc." },
      { label: "Arbitration Institution", key: "institution", type: "text", defaultValue: "Lagos Court of Arbitration (LCA)" },
      { label: "Dispute Summary", key: "dispute", type: "textarea", defaultValue: "Breach of a Supply Agreement dated 10th February 2025 arising from the Respondent's failure to deliver 500 units of industrial generators as agreed." },
      { label: "Amount in Dispute (₦)", key: "amount", type: "text", defaultValue: "150,000,000.00" },
    ],
    aiSuggestions: ["Cite arbitration clause", "Add relief calculation", "Check Arbitration Act compliance", "Draft Terms of Reference"],
    aiTip: "Ensure the arbitration clause in the underlying contract supports the chosen institution and rules. Reference the Arbitration and Mediation Act 2023.",
    renderDocument: (f) => (
      <>
        <div className="text-center uppercase" style={{ fontWeight: 700 }}>
          <p>{f.institution}</p>
        </div>
        <div className="text-center underline mt-6" style={{ fontWeight: 700 }}>NOTICE OF ARBITRATION</div>
        <div className="mt-6 space-y-3">
          <div className="flex"><span className="w-[180px] shrink-0" style={{ fontWeight: 600 }}>Date:</span><span>______ 2026</span></div>
          <div className="flex"><span className="w-[180px] shrink-0" style={{ fontWeight: 600 }}>Claimant:</span><span>{f.applicant}</span></div>
          <div className="flex"><span className="w-[180px] shrink-0" style={{ fontWeight: 600 }}>Respondent:</span><span>{f.respondent}</span></div>
        </div>
        <p className="mt-6">The Claimant hereby gives notice, pursuant to the Arbitration and Mediation Act 2023 and the Rules of the {f.institution}, of its intention to commence arbitration proceedings against the Respondent.</p>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>1. THE PARTIES</p>
          <p className="mt-2"><span style={{ fontWeight: 600 }}>Claimant:</span> {f.applicant}, ______, Lagos, Nigeria</p>
          <p className="mt-2"><span style={{ fontWeight: 600 }}>Respondent:</span> {f.respondent}, ______, Lagos, Nigeria</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>2. THE DISPUTE</p>
          <p className="mt-2">{f.dispute}</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>3. AMOUNT IN DISPUTE</p>
          <p className="mt-2">The total amount in dispute is ₦{f.amount}.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>4. RELIEFS SOUGHT</p>
          <ol className="list-decimal pl-8 space-y-3 mt-3">
            <li>Payment of the sum of ₦{f.amount} as damages for breach of contract.</li>
            <li>Interest on the above sum at a rate to be determined by the Tribunal.</li>
            <li>Costs of the arbitration.</li>
          </ol>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>5. ARBITRATOR</p>
          <p className="mt-2">The Claimant proposes that the arbitration be conducted by a sole arbitrator appointed in accordance with the rules of the {f.institution}.</p>
        </div>
        <SignatureBlock title="Counsel to the Claimant" />
      </>
    ),
  },
};

// ─── Fallback for templates without specific config ─────────────────
function getDefaultConfig(name: string): TemplateConfig {
  return {
    fields: [
      { label: "Party A", key: "applicant", type: "text", defaultValue: "TechCorp Solutions Ltd" },
      { label: "Party B", key: "respondent", type: "text", defaultValue: "Global Logistics Inc." },
      { label: "Key Details", key: "details", type: "textarea", defaultValue: `Details for the ${name} document.` },
    ],
    aiSuggestions: ["Refine legal language", "Check compliance", "Add supporting clauses", "Review formatting"],
    aiTip: `Review the ${name} template for completeness and ensure all required fields are filled.`,
    renderDocument: (f) => (
      <>
        <div className="text-center underline" style={{ fontWeight: 700 }}>{name.toUpperCase()}</div>
        <p className="mt-6">This document is made this ______ day of ______________ 2026.</p>
        <p className="mt-4" style={{ fontWeight: 700 }}>BETWEEN:</p>
        <p><span style={{ fontWeight: 600 }}>{f.applicant}</span> (hereinafter referred to as "Party A")</p>
        <p className="mt-3" style={{ fontWeight: 700 }}>AND</p>
        <p><span style={{ fontWeight: 600 }}>{f.respondent}</span> (hereinafter referred to as "Party B")</p>
        <div className="mt-8">
          <p style={{ fontWeight: 700 }}>1. DETAILS</p>
          <p className="mt-2">{f.details}</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>2. TERMS AND CONDITIONS</p>
          <p className="mt-2">The parties hereby agree to the terms and conditions as set out in this document and any schedules attached hereto.</p>
        </div>
        <div className="mt-6">
          <p style={{ fontWeight: 700 }}>3. GOVERNING LAW</p>
          <p className="mt-2">This document shall be governed by and construed in accordance with the laws of the Federal Republic of Nigeria.</p>
        </div>
        <div className="mt-12 flex justify-between">
          <div>
            <p style={{ fontWeight: 600 }}>PARTY A:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Authorized Signatory</p></div>
          </div>
          <div>
            <p style={{ fontWeight: 600 }}>PARTY B:</p>
            <div className="mt-8 w-[200px] border-t border-[#0F172A] pt-2"><p style={{ fontSize: "13px" }}>Authorized Signatory</p></div>
          </div>
        </div>
      </>
    ),
  };
}

export function getTemplateConfig(name: string): TemplateConfig {
  if (name === "Notice of Appearance") return templates["Memorandum of Appearance"];
  return templates[name] || getDefaultConfig(name);
}
