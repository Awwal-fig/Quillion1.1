/**
 * AI Context Engine
 * Analyzes editor content around the cursor to provide contextual suggestions.
 */

export interface AiContext {
  section: string;
  suggestions: string[];
  tip: string;
  confidence: number; // 0–1, used for transition decisions
}

interface SectionPattern {
  section: string;
  keywords: RegExp[];
  suggestions: string[];
  tip: string;
}

const SECTION_PATTERNS: SectionPattern[] = [
  {
    section: "Parties & Caption",
    keywords: [
      /\b(between|applicant|respondent|claimant|defendant|appellant|plaintiff)\b/i,
      /\bsuit\s*no/i,
      /\b(1st|2nd|3rd|4th|5th)\s+(applicant|respondent|defendant|claimant)/i,
    ],
    suggestions: [
      "Verify party names match court filings",
      "Add party descriptions and addresses",
      "Check proper party designation (Ltd, Plc, Inc.)",
      "Confirm all necessary parties are joined",
    ],
    tip: "Ensure all party names are consistent throughout the document. Misspelled or inconsistent names can lead to objections on the ground of misnomer.",
  },
  {
    section: "Court & Jurisdiction",
    keywords: [
      /\b(federal high court|state high court|court of appeal|supreme court|national industrial court|magistrate)/i,
      /\b(holden at|judicial division|in the)\b/i,
      /\b(jurisdiction|competence|venue)\b/i,
    ],
    suggestions: [
      "Verify court has subject-matter jurisdiction",
      "Check territorial jurisdiction (proper venue)",
      "Cite Madukolu v. Nkemdilim on jurisdiction",
      "Confirm court's pecuniary jurisdiction limits",
    ],
    tip: "A court is competent when: (1) it is properly constituted, (2) the subject matter is within jurisdiction, (3) the action is initiated by due process, (4) conditions precedent are fulfilled — Madukolu v. Nkemdilim (1962).",
  },
  {
    section: "Prayer Points & Reliefs",
    keywords: [
      /\b(pray|order|relief|declaration|injunction|mandatory order|perpetual)\b/i,
      /\b(humbly|honourable court|deemed fit|further order)\b/i,
      /\b(an order|a declaration|an injunction)\b/i,
    ],
    suggestions: [
      "Ensure reliefs are specific and quantifiable",
      "Add alternative/general relief clause",
      "Check prayer aligns with statement of claim",
      "Verify relief is within court's powers",
      "Add interest and costs to monetary claims",
    ],
    tip: "Always include a general/omnibus clause: 'And for such further order(s) as this Honourable Court may deem fit to make.' Reliefs should be clear, specific, and legally enforceable.",
  },
  {
    section: "Grounds & Legal Basis",
    keywords: [
      /\b(grounds?|ground of|pursuant|section|under|by virtue|provision)\b/i,
      /\b(constitution|evidence act|sheriff|rules of court)\b/i,
      /\b(breach|violation|contravention|infringement)\b/i,
    ],
    suggestions: [
      "Cite specific statutory provisions",
      "Add constitutional basis where applicable",
      "Reference relevant Rules of Court",
      "Include recent Supreme Court authorities",
      "Check if grounds are properly particularised",
    ],
    tip: "Each ground should be self-sustaining and clearly tied to a specific legal provision or rule. Avoid vague or omnibus grounds that the court may strike out.",
  },
  {
    section: "Affidavit & Facts",
    keywords: [
      /\b(depos|affidavit|oath|swear|sworn|deponent|make oath|state as follows)\b/i,
      /\b(that i am|that the|to the best of|personal knowledge)\b/i,
      /\b(facts?|verily believe|informed|told)\b/i,
    ],
    suggestions: [
      "Ensure each paragraph starts with 'That'",
      "Separate facts from arguments/conclusions",
      "Add jurat (sworn/affirmed at) clause",
      "Attach relevant exhibits with labels",
      "Check Evidence Act compliance for hearsay",
    ],
    tip: "Affidavit paragraphs must contain only facts, not legal arguments or conclusions. Each paragraph should begin with 'That' and state one fact. Hearsay must identify the source — Evidence Act 2011, S. 115.",
  },
  {
    section: "Written Address & Arguments",
    keywords: [
      /\b(written address|submission|argument|contend|submit|legal issue|formulated)\b/i,
      /\b(issue for determination|learned counsel|authority|precedent)\b/i,
      /\b(ratio|obiter|distinguish|overrule)\b/i,
    ],
    suggestions: [
      "Formulate issues for determination clearly",
      "Add Supreme Court binding authorities",
      "Distinguish opposing authorities",
      "Strengthen analysis with multiple case laws",
      "Add conclusion summarising key arguments",
    ],
    tip: "Issues for determination should flow from the grounds/reliefs. Support each argument with at least 2-3 case authorities. Always start with binding Supreme Court decisions before Court of Appeal decisions.",
  },
  {
    section: "Damages & Compensation",
    keywords: [
      /\b(damages|compensation|quantum|loss|injury|pecuniary|general damages|special damages|exemplary)\b/i,
      /\b(naira|₦|amount|sum of|monetary)\b/i,
    ],
    suggestions: [
      "Itemise and particularise special damages",
      "Cite authorities on measure of damages",
      "Add evidence supporting quantum claimed",
      "Consider aggravated/exemplary damages",
      "Include pre-judgment interest calculation",
    ],
    tip: "Special damages must be specifically pleaded and strictly proved — Neka BBB Manufacturing Co. Ltd v. ACB Ltd (2004). General damages need not be strictly proved but must be reasonable.",
  },
  {
    section: "Service & Process",
    keywords: [
      /\b(service|served|writ|summons|originating|process|filing)\b/i,
      /\b(within.*(days|time)|default|appearance|enter appearance)\b/i,
    ],
    suggestions: [
      "Verify correct mode of service",
      "Check service timeline requirements",
      "Add proof of service details",
      "Confirm proper return date",
    ],
    tip: "Ensure the mode of service complies with the Rules of Court for the specific court. Personal service is generally preferred; substituted service requires a court order.",
  },
  {
    section: "Appeal & Appellate",
    keywords: [
      /\b(appeal|appellant|notice of appeal|cross-appeal|grounds of appeal)\b/i,
      /\b(lower court|trial court|decision|judgment|erred)\b/i,
    ],
    suggestions: [
      "Check appeal is filed within time",
      "Verify grounds cover law, fact, and mixed",
      "Add particulars to each ground of appeal",
      "Consider filing stay of execution",
      "Request for record of proceedings",
    ],
    tip: "Notice of Appeal must be filed within 90 days (as of right) or 14 days (with leave) from the date of judgment. Each ground should be concise and identify the specific error of the lower court.",
  },
  {
    section: "Contract & Agreement",
    keywords: [
      /\b(agreement|contract|memorandum|clause|term|obligation|covenant|warrant|represent)\b/i,
      /\b(party|parties|hereinafter|herein|witnesseth|recital)\b/i,
      /\b(shall|must|agrees to|undertakes)\b/i,
    ],
    suggestions: [
      "Define key terms in definitions clause",
      "Add dispute resolution/arbitration clause",
      "Include force majeure provision",
      "Check governing law clause",
      "Add termination and exit provisions",
    ],
    tip: "Every contract should have clear definitions, obligations, timelines, dispute resolution, and termination clauses. Consider adding a severability clause to protect remaining provisions.",
  },
  {
    section: "Employment & HR",
    keywords: [
      /\b(employment|employer|employee|salary|termination|notice period|probation)\b/i,
      /\b(leave|benefits|duties|responsibilities|confidential)\b/i,
    ],
    suggestions: [
      "Verify compliance with Labour Act",
      "Add non-compete/confidentiality clause",
      "Check notice period requirements",
      "Include gratuity/pension provisions",
      "Add disciplinary procedure reference",
    ],
    tip: "Under Nigerian Labour Act, minimum notice periods apply: 1 day (daily workers), 1 week (weekly), 2 weeks (monthly), 1 month (yearly). Check if the employee falls under the Labour Act or is excluded.",
  },
  {
    section: "Property & Real Estate",
    keywords: [
      /\b(property|land|lease|tenant|landlord|assignment|deed|conveyance|survey)\b/i,
      /\b(rent|title|certificate of occupancy|governor's consent|registered)\b/i,
    ],
    suggestions: [
      "Verify Governor's Consent requirement",
      "Check Land Use Act compliance",
      "Add property description with survey details",
      "Include covenants and restrictions",
      "Confirm title documentation",
    ],
    tip: "Under the Land Use Act, all land in Nigeria is vested in the State Governor. Any assignment, transfer, or mortgage of a statutory right of occupancy requires the Governor's consent — S. 22 Land Use Act.",
  },
  {
    section: "Intellectual Property",
    keywords: [
      /\b(trademark|patent|copyright|intellectual property|infringement|registration)\b/i,
      /\b(cease and desist|licensing|royalt|ip rights)\b/i,
    ],
    suggestions: [
      "Verify trademark/patent registration status",
      "Document evidence of infringement",
      "Add timeline for compliance/cessation",
      "Cite Trademarks Act or Copyright Act",
      "Consider interim injunction application",
    ],
    tip: "For trademark infringement, establish: (1) validity of your mark, (2) use of identical/similar mark by defendant, (3) likelihood of confusion, (4) use in course of trade. Reference the Trademarks Act Cap T13 LFN 2004.",
  },
];

// Fallback / generic suggestions when no specific section is detected
const GENERIC_CONTEXT: AiContext = {
  section: "General Editing",
  suggestions: [
    "Review document for consistency",
    "Check formatting and numbering",
    "Proofread for grammar and typos",
    "Verify all dates and references",
  ],
  tip: "Take a moment to review the overall structure of your document. Ensure headings, numbering, and cross-references are consistent throughout.",
  confidence: 0.3,
};

// Additional contextual tips based on content length/completeness
const COMPLETENESS_TIPS = [
  { minWords: 0, maxWords: 50, tip: "Your document is still quite short. Consider fleshing out the key sections with more detail and supporting authorities." },
  { minWords: 50, maxWords: 200, tip: "Good progress! Make sure each section is fully developed with proper legal citations and factual support." },
  { minWords: 200, maxWords: 500, tip: "Your document is taking shape. Review for internal consistency and ensure all cross-references are accurate." },
  { minWords: 500, maxWords: Infinity, tip: "Comprehensive draft! Consider a final review for clarity, brevity, and removal of any redundant content." },
];

/**
 * Analyze the text near the cursor (or the full editor text) and return
 * contextual AI suggestions.
 */
export function analyzeContext(
  nearCursorText: string,
  fullText: string,
  templateSuggestions: string[],
  templateTip: string
): AiContext {
  if (!nearCursorText && !fullText) {
    return {
      section: "Getting Started",
      suggestions: templateSuggestions,
      tip: templateTip,
      confidence: 1,
    };
  }

  const textToAnalyze = nearCursorText || fullText;

  // Score each section pattern
  let bestMatch: SectionPattern | null = null;
  let bestScore = 0;

  for (const pattern of SECTION_PATTERNS) {
    let score = 0;
    for (const kw of pattern.keywords) {
      const matches = textToAnalyze.match(new RegExp(kw.source, "gi"));
      if (matches) {
        score += matches.length;
      }
    }
    if (score > bestScore) {
      bestScore = score;
      bestMatch = pattern;
    }
  }

  if (bestMatch && bestScore >= 1) {
    // Blend template-specific suggestions with context-specific ones
    // Take 2 from detected context, and 2 from template defaults for variety
    const contextSuggestions = bestMatch.suggestions.slice(0, 3);
    const templateExtras = templateSuggestions
      .filter((s) => !contextSuggestions.includes(s))
      .slice(0, 2);

    return {
      section: bestMatch.section,
      suggestions: [...contextSuggestions, ...templateExtras],
      tip: bestMatch.tip,
      confidence: Math.min(1, bestScore / 3),
    };
  }

  // Fallback: check content length for completeness-based tips
  const wordCount = fullText.split(/\s+/).filter(Boolean).length;
  const completenessTip = COMPLETENESS_TIPS.find(
    (t) => wordCount >= t.minWords && wordCount < t.maxWords
  );

  return {
    ...GENERIC_CONTEXT,
    suggestions: templateSuggestions,
    tip: completenessTip?.tip || templateTip,
  };
}

/**
 * Extract ~300 chars of text around the current cursor position
 * from a contentEditable element.
 */
export function getTextNearCursor(): string {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return "";

  const range = sel.getRangeAt(0);
  const node = range.startContainer;

  // Walk up to find a block-level parent (p, div, li, td, etc.)
  let block: Node | null = node;
  const blockTags = new Set(["P", "DIV", "LI", "TD", "SECTION", "ARTICLE", "H1", "H2", "H3", "H4", "TR", "TBODY"]);
  while (block && block.nodeType !== 1) block = block.parentNode;
  while (block && !(block as Element).tagName) block = block.parentNode;

  // Go up max 3 levels to get broader context
  let contextNode = block;
  for (let i = 0; i < 3 && contextNode?.parentNode; i++) {
    const parent = contextNode.parentNode as Element;
    if (parent.tagName && blockTags.has(parent.tagName)) {
      contextNode = parent;
    } else {
      break;
    }
  }

  if (contextNode) {
    const text = (contextNode as Element).textContent || "";
    // Get surrounding siblings too for broader context
    const prev = (contextNode as Element).previousElementSibling?.textContent || "";
    const next = (contextNode as Element).nextElementSibling?.textContent || "";
    return (prev.slice(-150) + " " + text + " " + next.slice(0, 150)).trim();
  }

  return "";
}
