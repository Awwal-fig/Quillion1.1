import { useState, useMemo, useCallback, useRef, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { getTemplateConfig, stateDivisions, parseParties, joinParties } from "./templateData";
import {
  saveDraft,
  incrementCompleted,
  incrementTemplatesUsed,
  addRecentActivity,
  trackTemplateUsage,
  type SavedDraft,
} from "./draftStore";
import { analyzeContext, getTextNearCursor, type AiContext } from "./aiContextEngine";
import { toast } from "sonner";
import {
  Bold, Italic, Underline, Strikethrough,
  AlignLeft, AlignCenter, AlignRight, AlignJustify,
  List, ListOrdered, Undo2, Redo2, Type, Heading1, Heading2,
  Minus, Plus, Trash2, Save, FileDown, CheckCircle2,
  ChevronDown,
} from "lucide-react";
import html2pdf from "html2pdf.js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

/* ───── Constants ───────────────────────────────────────────────────── */

const FONT_FAMILIES = [
  { label: "Space Grotesk", value: "'Space Grotesk', sans-serif" },
  { label: "Times New Roman", value: "'Times New Roman', Times, serif" },
  { label: "Arial", value: "Arial, Helvetica, sans-serif" },
  { label: "Georgia", value: "Georgia, serif" },
  { label: "Garamond", value: "Garamond, serif" },
  { label: "Courier New", value: "'Courier New', Courier, monospace" },
  { label: "Verdana", value: "Verdana, Geneva, sans-serif" },
  { label: "Palatino", value: "'Palatino Linotype', 'Book Antiqua', Palatino, serif" },
  { label: "Cambria", value: "Cambria, Georgia, serif" },
  { label: "Calibri", value: "Calibri, 'Gill Sans', sans-serif" },
];

/* ───── Formatting Toolbar ──────────────────────────────────────────── */

function FormatBtn({
  icon,
  command,
  value,
  title,
  active,
}: {
  icon: React.ReactNode;
  command: string;
  value?: string;
  title: string;
  active?: boolean;
}) {
  const run = (e: React.MouseEvent) => {
    e.preventDefault();
    document.execCommand(command, false, value);
  };
  return (
    <button
      onMouseDown={run}
      title={title}
      className={`p-1.5 rounded transition cursor-pointer ${
        active
          ? "bg-[#E0F7FA] text-[#22B8C7]"
          : "text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#0F172A]"
      }`}
      style={{ fontSize: "14px" }}
    >
      {icon}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-6 bg-[#E5E7EB] mx-1" />;
}

function FormattingToolbar({
  editorRef,
  activeFormats,
}: {
  editorRef: React.RefObject<HTMLDivElement | null>;
  activeFormats: Record<string, boolean>;
}) {
  const [fontSize, setFontSize] = useState(15);
  const [fontFamily, setFontFamily] = useState(FONT_FAMILIES[0].label);
  const [showFontDropdown, setShowFontDropdown] = useState(false);

  const changeFontSize = (delta: number) => {
    const next = Math.min(48, Math.max(8, fontSize + delta));
    setFontSize(next);
    document.execCommand("fontSize", false, "7");
    const sel = window.getSelection();
    if (sel && sel.rangeCount > 0) {
      const range = sel.getRangeAt(0);
      const parent = range.commonAncestorContainer.parentElement;
      if (parent) {
        const fonts = parent.querySelectorAll('font[size="7"]');
        fonts.forEach((el) => {
          (el as HTMLElement).removeAttribute("size");
          (el as HTMLElement).style.fontSize = `${next}px`;
        });
      }
    }
  };

  const applyFont = (font: (typeof FONT_FAMILIES)[number]) => {
    setFontFamily(font.label);
    setShowFontDropdown(false);

    // Apply to selection if exists, otherwise apply to entire editor
    const sel = window.getSelection();
    if (sel && sel.toString().length > 0) {
      document.execCommand("fontName", false, font.value);
    } else if (editorRef.current) {
      editorRef.current.style.fontFamily = font.value;
    }
  };

  return (
    <div className="h-11 bg-white border-b border-[#E5E7EB] px-6 flex items-center gap-1 shrink-0 overflow-visible">
      {/* Font Family Selector */}
      <div className="relative">
        <button
          onMouseDown={(e) => {
            e.preventDefault();
            setShowFontDropdown(!showFontDropdown);
          }}
          className="flex items-center gap-1 px-2 py-1 rounded hover:bg-[#F1F5F9] text-[#0F172A] transition cursor-pointer min-w-[120px] border border-transparent hover:border-[#E5E7EB]"
          style={{ fontSize: "12px" }}
        >
          <span className="truncate">{fontFamily}</span>
          <ChevronDown size={12} className="shrink-0 text-[#6B7280]" />
        </button>
        {showFontDropdown && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowFontDropdown(false)}
            />
            <div className="absolute top-full left-0 mt-1 bg-white border border-[#E5E7EB] rounded-lg shadow-lg z-50 w-[200px] max-h-[280px] overflow-y-auto py-1">
              {FONT_FAMILIES.map((font) => (
                <button
                  key={font.label}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    applyFont(font);
                  }}
                  className={`w-full text-left px-3 py-2 hover:bg-[#F1F5F9] transition cursor-pointer ${
                    fontFamily === font.label ? "bg-[#F0FDFA] text-[#22B8C7]" : "text-[#0F172A]"
                  }`}
                  style={{ fontSize: "13px", fontFamily: font.value }}
                >
                  {font.label}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <Divider />

      {/* Font size controls */}
      <button
        onMouseDown={(e) => { e.preventDefault(); changeFontSize(-1); }}
        title="Decrease font size"
        className="p-1.5 rounded text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition cursor-pointer"
      >
        <Minus size={14} />
      </button>
      <span
        className="text-[#0F172A] min-w-[28px] text-center select-none"
        style={{ fontSize: "12px" }}
      >
        {fontSize}
      </span>
      <button
        onMouseDown={(e) => { e.preventDefault(); changeFontSize(1); }}
        title="Increase font size"
        className="p-1.5 rounded text-[#6B7280] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition cursor-pointer"
      >
        <Plus size={14} />
      </button>

      <Divider />

      <FormatBtn icon={<Bold size={16} />} command="bold" title="Bold (Ctrl+B)" active={activeFormats.bold} />
      <FormatBtn icon={<Italic size={16} />} command="italic" title="Italic (Ctrl+I)" active={activeFormats.italic} />
      <FormatBtn icon={<Underline size={16} />} command="underline" title="Underline (Ctrl+U)" active={activeFormats.underline} />
      <FormatBtn icon={<Strikethrough size={16} />} command="strikeThrough" title="Strikethrough" active={activeFormats.strikeThrough} />

      <Divider />

      <FormatBtn icon={<Heading1 size={16} />} command="formatBlock" value="h1" title="Heading 1" />
      <FormatBtn icon={<Heading2 size={16} />} command="formatBlock" value="h2" title="Heading 2" />
      <FormatBtn icon={<Type size={16} />} command="formatBlock" value="p" title="Normal text" />

      <Divider />

      <FormatBtn icon={<AlignLeft size={16} />} command="justifyLeft" title="Align left" active={activeFormats.justifyLeft} />
      <FormatBtn icon={<AlignCenter size={16} />} command="justifyCenter" title="Align center" active={activeFormats.justifyCenter} />
      <FormatBtn icon={<AlignRight size={16} />} command="justifyRight" title="Align right" active={activeFormats.justifyRight} />
      <FormatBtn icon={<AlignJustify size={16} />} command="justifyFull" title="Justify" active={activeFormats.justifyFull} />

      <Divider />

      <FormatBtn icon={<List size={16} />} command="insertUnorderedList" title="Bullet list" active={activeFormats.insertUnorderedList} />
      <FormatBtn icon={<ListOrdered size={16} />} command="insertOrderedList" title="Numbered list" active={activeFormats.insertOrderedList} />

      <Divider />

      <FormatBtn icon={<Undo2 size={16} />} command="undo" title="Undo (Ctrl+Z)" />
      <FormatBtn icon={<Redo2 size={16} />} command="redo" title="Redo (Ctrl+Y)" />
    </div>
  );
}

/* ───── Multi-Party Input ───────────────────────────────────────────── */

function MultiPartyInput({
  label,
  partyRole,
  value,
  onChange,
}: {
  label: string;
  partyRole: string;
  value: string;
  onChange: (val: string) => void;
}) {
  const parties = parseParties(value);

  const update = (index: number, val: string) => {
    const next = [...parties];
    next[index] = val;
    onChange(joinParties(next));
  };

  const add = () => {
    onChange(joinParties([...parties, ""]));
  };

  const remove = (index: number) => {
    if (parties.length <= 1) return;
    const next = parties.filter((_, i) => i !== index);
    onChange(joinParties(next));
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-[#6B7280]" style={{ fontSize: "12px", fontWeight: 500 }}>
          {label}
        </label>
        <button
          onClick={add}
          className="flex items-center gap-1 text-[#22B8C7] hover:text-[#1EAAB8] bg-transparent border-none cursor-pointer"
          style={{ fontSize: "11px", fontWeight: 500 }}
          title={`Add another ${partyRole}`}
        >
          <Plus size={12} /> Add Party
        </button>
      </div>
      <div className="flex flex-col gap-2">
        {parties.map((party, i) => (
          <div key={i} className="flex items-center gap-2">
            <div className="flex-1 relative">
              {parties.length > 1 && (
                <span
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8] pointer-events-none select-none"
                  style={{ fontSize: "11px" }}
                >
                  {i + 1}.
                </span>
              )}
              <input
                type="text"
                value={party}
                onChange={(e) => update(i, e.target.value)}
                placeholder={`${partyRole} name`}
                className={`w-full py-2.5 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] outline-none focus:border-[#22B8C7] ${
                  parties.length > 1 ? "pl-8 pr-3" : "px-4"
                }`}
                style={{ fontSize: "14px" }}
              />
            </div>
            {parties.length > 1 && (
              <button
                onClick={() => remove(i)}
                className="p-1.5 text-[#EF4444] hover:bg-[#FEF2F2] rounded transition cursor-pointer bg-transparent border-none shrink-0"
                title={`Remove ${partyRole}`}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      {parties.length > 1 && (
        <p className="text-[#94A3B8] mt-1" style={{ fontSize: "11px" }}>
          {parties.length} {partyRole.toLowerCase()}s added
        </p>
      )}
    </div>
  );
}

/* ───── Finalize Confirmation Modal ─────────────────────────────────── */

function FinalizeModal({
  templateName,
  onConfirm,
  onCancel,
}: {
  templateName: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-2xl p-8 max-w-[420px] w-full mx-4 shadow-xl">
        <div className="flex items-center justify-center w-12 h-12 bg-[#F0FDFA] rounded-full mb-4 mx-auto">
          <CheckCircle2 size={24} className="text-[#22B8C7]" />
        </div>
        <h3 className="text-center text-[#0F172A] mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>
          Finalize Document?
        </h3>
        <p className="text-center text-[#6B7280] mb-6" style={{ fontSize: "14px", lineHeight: 1.6 }}>
          This will mark your <span style={{ fontWeight: 600 }}>{templateName}</span> draft as completed. You can still access it from your documents.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2.5 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] hover:bg-[#F9FAFB] transition cursor-pointer"
            style={{ fontSize: "14px" }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2.5 bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg transition cursor-pointer"
            style={{ fontSize: "14px", fontWeight: 500 }}
          >
            Yes, Finalize
          </button>
        </div>
      </div>
    </div>
  );
}

/* ───── Draft Editor ────────────────────────────────────────────────── */

export function DraftEditor() {
  const { templateName } = useParams();
  const navigate = useNavigate();
  const displayName = decodeURIComponent(templateName || "Template");
  const config = useMemo(() => getTemplateConfig(displayName), [displayName]);
  const editorRef = useRef<HTMLDivElement>(null);
  const pdfContainerRef = useRef<HTMLDivElement>(null);
  const draftId = useRef(crypto.randomUUID());

  const [fields, setFields] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    config.fields.forEach((f) => { init[f.key] = f.defaultValue; });
    return init;
  });

  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showFinalizeModal, setShowFinalizeModal] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Record<string, boolean>>({});
  const [aiProcessing, setAiProcessing] = useState<string | null>(null);
  const [aiContext, setAiContext] = useState<AiContext>({
    section: "Getting Started",
    suggestions: config.aiSuggestions,
    tip: config.aiTip,
    confidence: 1,
  });
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const aiDebounceRef = useRef<ReturnType<typeof setTimeout>>();

  // Track active formatting state + AI context on selection change & input
  useEffect(() => {
    const checkFormats = () => {
      setActiveFormats({
        bold: document.queryCommandState("bold"),
        italic: document.queryCommandState("italic"),
        underline: document.queryCommandState("underline"),
        strikeThrough: document.queryCommandState("strikeThrough"),
        justifyLeft: document.queryCommandState("justifyLeft"),
        justifyCenter: document.queryCommandState("justifyCenter"),
        justifyRight: document.queryCommandState("justifyRight"),
        justifyFull: document.queryCommandState("justifyFull"),
        insertUnorderedList: document.queryCommandState("insertUnorderedList"),
        insertOrderedList: document.queryCommandState("insertOrderedList"),
      });
    };
    document.addEventListener("selectionchange", checkFormats);
    return () => document.removeEventListener("selectionchange", checkFormats);
  }, []);

  // Debounced AI context analysis on editor input and cursor movement
  const triggerAiAnalysis = useCallback(() => {
    if (aiDebounceRef.current) clearTimeout(aiDebounceRef.current);
    aiDebounceRef.current = setTimeout(() => {
      const nearCursor = getTextNearCursor();
      const fullText = editorRef.current?.textContent || "";
      if (!nearCursor && !fullText) return;
      setAiAnalyzing(true);
      // Small delay to simulate AI "thinking"
      setTimeout(() => {
        const ctx = analyzeContext(nearCursor, fullText, config.aiSuggestions, config.aiTip);
        setAiContext(ctx);
        setAiAnalyzing(false);
      }, 400);
    }, 600);
  }, [config.aiSuggestions, config.aiTip]);

  useEffect(() => {
    const el = editorRef.current;
    if (!el) return;
    const handler = () => triggerAiAnalysis();
    el.addEventListener("input", handler);
    el.addEventListener("click", handler);
    document.addEventListener("selectionchange", handler);
    return () => {
      el.removeEventListener("input", handler);
      el.removeEventListener("click", handler);
      document.removeEventListener("selectionchange", handler);
    };
  }, [triggerAiAnalysis]);

  // Increment "Templates Used" on first mount (template opened)
  useEffect(() => {
    incrementTemplatesUsed();
    addRecentActivity("Opened template", displayName);
    trackTemplateUsage(displayName);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Force document re-render when sidebar fields change (e.g. court selection)
  const [docVersion, setDocVersion] = useState(0);
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  useEffect(() => {
    setDocVersion((v) => v + 1);
  }, [fields]);

  const updateField = useCallback((key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
  }, []);

  const getTimeSince = () => {
    if (!lastSaved) return "Not saved yet";
    const diff = Math.round((Date.now() - lastSaved.getTime()) / 1000);
    if (diff < 5) return "Just now";
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    return lastSaved.toLocaleTimeString();
  };

  // ─── Button Handlers ──────────────────────────────────────────────

  const handleSave = () => {
    const draft: SavedDraft = {
      id: draftId.current,
      templateName: displayName,
      fields: { ...fields },
      htmlContent: editorRef.current?.innerHTML || "",
      savedAt: new Date().toISOString(),
      finalized: false,
    };
    saveDraft(draft);
    setLastSaved(new Date());
    addRecentActivity("Saved draft", displayName);
    toast.success("Draft saved successfully", {
      description: `${displayName} has been saved to your workspace.`,
    });
  };

  const handleExportPDF = async () => {
    const content = editorRef.current;
    if (!content) {
      toast.error("Nothing to export");
      return;
    }

    if (isExportingPdf) return;

    setIsExportingPdf(true);

    try {
      const waitForNextFrame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      await waitForNextFrame();
      await waitForNextFrame();

      const exportContainer = pdfContainerRef.current;
      if (!exportContainer) throw new Error("PDF container is not available");

      const isVisible = exportContainer.offsetParent !== null;
      if (!isVisible) throw new Error("PDF container is hidden");

      addRecentActivity("Exported PDF", displayName);

      const filename = displayName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");

      await html2pdf()
        .set({
          margin: [12, 12, 12, 12],
          image: { type: "jpeg", quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
          pagebreak: { mode: ["avoid-all", "css", "legacy"], avoid: ["table", "blockquote", "pre"] },
        })
        .from(exportContainer)
        .save(`${filename}.pdf`);

      toast.success("PDF downloaded", {
        description: `${displayName} has been exported as a PDF.`,
      });
    } catch (error) {
      console.error("PDF export failed:", error);
      toast.error("Failed to export PDF", {
        description: "We could not generate your PDF right now. Please try again.",
      });
    } finally {
      setIsExportingPdf(false);
    }
  };

  const handleExportWord = () => {
    const content = editorRef.current;
    if (!content) {
      toast.error("Nothing to export");
      return;
    }

    handleSave();
    addRecentActivity("Exported Word", displayName);

    const filename = displayName.replace(/[^a-zA-Z0-9 ]/g, "").replace(/\s+/g, "_");
    const htmlDoc = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>${displayName}</title></head><body>${content.innerHTML}</body></html>`;

    const blob = new Blob([htmlDoc], {
      type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.docx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.success("Word document downloaded", {
      description: `${displayName} has been exported as a .docx file.`,
    });
  };

  const handleFinalize = () => {
    setShowFinalizeModal(true);
  };

  const confirmFinalize = () => {
    // Save the draft as finalized
    const draft: SavedDraft = {
      id: draftId.current,
      templateName: displayName,
      fields: { ...fields },
      htmlContent: editorRef.current?.innerHTML || "",
      savedAt: new Date().toISOString(),
      finalized: true,
    };
    saveDraft(draft);
    incrementCompleted();
    addRecentActivity("Finalized document", displayName);
    setShowFinalizeModal(false);

    toast.success("Document finalized!", {
      description: `${displayName} has been marked as completed.`,
    });

    // Navigate back to dashboard after a brief delay
    setTimeout(() => navigate("/"), 1500);
  };

  const handleUpdateDraft = () => {
    // Force re-render by saving current state
    setLastSaved(new Date());
    toast.success("Draft updated", {
      description: "All field changes have been applied to the document.",
    });
  };

  const handleAiSuggestion = (suggestion: string) => {
    const editor = editorRef.current;
    if (!editor) return;

    setAiProcessing(suggestion);

    // Map suggestions to actual document modifications
    const aiActions: Record<string, () => void> = {
      "Refine legal language": () => {
        const replacements: [RegExp, string][] = [
          [/\bsaid\b/gi, "aforementioned"],
          [/\bgive\b/gi, "grant"],
          [/\bget\b/gi, "obtain"],
          [/\bask for\b/gi, "pray for"],
          [/\btold\b/gi, "informed"],
          [/\bshow\b/gi, "demonstrate"],
          [/\bbecause of\b/gi, "by reason of"],
          [/\babout\b/gi, "regarding"],
          [/\bbased on\b/gi, "pursuant to"],
          [/\bcan\b/gi, "may"],
        ];
        let html = editor.innerHTML;
        let changed = 0;
        for (const [pattern, replacement] of replacements) {
          const before = html;
          html = html.replace(pattern, (match) => {
            const r = match[0] === match[0].toUpperCase()
              ? replacement.charAt(0).toUpperCase() + replacement.slice(1)
              : replacement;
            return `<span style="background:#CCFBF1;padding:0 2px;border-radius:3px">${r}</span>`;
          });
          if (html !== before) changed++;
        }
        if (changed > 0) {
          editor.innerHTML = html;
        }
        return;
      },
      "Add case law support": () => {
        const caseLaws: Record<string, string> = {
          "Parties & Caption": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Relevant Authority:</p><p style="font-size:14px"><em>Madukolu v. Nkemdilim (1962) 2 SCNLR 341</em> — A court is competent when properly constituted, has jurisdiction over the subject matter, the action is initiated by due process, and all conditions precedent are fulfilled.</p></div>`,
          "Court & Jurisdiction": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Relevant Authority:</p><p style="font-size:14px"><em>NDIC v. Okem Enterprises Ltd (2004) 10 NWLR (Pt. 880) 107</em> — The issue of jurisdiction is fundamental and can be raised at any stage of the proceedings.</p></div>`,
          "Prayer Points & Reliefs": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Relevant Authority:</p><p style="font-size:14px"><em>Akapo v. Hakeem-Habeeb (1992) 6 NWLR (Pt. 247) 266</em> — A court cannot grant a relief not claimed by the parties.</p></div>`,
          "Affidavit & Facts": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Relevant Authority:</p><p style="font-size:14px"><em>Falobi v. Falobi (1976) 1 NMLR 169</em> — An affidavit that contains hearsay evidence, argument, or conclusions of law is liable to be struck out.</p></div>`,
        };
        const caseHtml = caseLaws[aiContext.section] || caseLaws["Court & Jurisdiction"];
        editor.innerHTML += caseHtml;
      },
      "Check compliance": () => {
        const issues: string[] = [];
        const text = editor.textContent || "";
        if (!text.match(/suit\s*no/i)) issues.push("Missing Suit Number");
        if (!text.match(/holden at/i)) issues.push("Missing 'Holden at' clause");
        if (!text.match(/sworn|affirm/i) && text.match(/affidavit/i)) issues.push("Affidavit missing jurat clause");
        if (!text.match(/further order/i)) issues.push("Missing omnibus/general relief clause");
        if (text.length < 200) issues.push("Document appears too short for a complete filing");

        const issueHtml = issues.length > 0
          ? `<div style="margin-top:20px;padding:16px;background:#FEF2F2;border:1px solid #FECACA;border-radius:12px"><p style="font-weight:700;color:#DC2626;font-size:14px;margin-bottom:8px">⚠ Compliance Review (${issues.length} issue${issues.length > 1 ? "s" : ""} found):</p><ul style="padding-left:1.5em;margin:0">${issues.map((i) => `<li style="color:#991B1B;font-size:13px;margin-bottom:4px">${i}</li>`).join("")}</ul></div>`
          : `<div style="margin-top:20px;padding:16px;background:#F0FDF4;border:1px solid #BBF7D0;border-radius:12px"><p style="font-weight:700;color:#16A34A;font-size:14px">✓ Compliance Check Passed</p><p style="font-size:13px;color:#166534">No obvious compliance issues detected.</p></div>`;
        editor.innerHTML += issueHtml;
      },
      "Suggest clauses": () => {
        const clausesBySection: Record<string, string> = {
          "General Editing": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#D97706">Suggested Clause:</p><p style="font-size:14px">"And for such further order(s) as this Honourable Court may deem fit to make in the circumstances of this case."</p></div>`,
          "Contract & Agreement": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#D97706">Suggested Clause — Force Majeure:</p><p style="font-size:14px">"Neither party shall be liable for any failure or delay in performing their obligations where such failure or delay results from circumstances beyond the reasonable control of that party, including but not limited to acts of God, natural disasters, war, terrorism, riots, embargoes, acts of civil or military authorities, fire, floods, accidents, pandemic, strikes, or shortages."</p></div>`,
          "Employment & HR": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#D97706">Suggested Clause — Non-Compete:</p><p style="font-size:14px">"The Employee agrees that for a period of twelve (12) months after termination, the Employee shall not directly or indirectly engage in any business that competes with the Employer within the jurisdiction where the Employer operates."</p></div>`,
          "Property & Real Estate": `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#D97706">Suggested Clause — Governor's Consent:</p><p style="font-size:14px">"This transaction is subject to the obtaining of the Governor's consent as required under Section 22 of the Land Use Act, Cap L5, Laws of the Federation of Nigeria, 2004. The Vendor shall cooperate fully with the Purchaser in obtaining the said consent."</p></div>`,
        };
        const clause = clausesBySection[aiContext.section] || clausesBySection["General Editing"];
        editor.innerHTML += clause;
      },
      "Verify party names match court filings": () => {
        let html = editor.innerHTML;
        const partyNames = [fields.applicant, fields.respondent].filter(Boolean);
        for (const raw of partyNames) {
          const parts = raw.split("|||").map((s) => s.trim()).filter(Boolean);
          for (const name of parts) {
            if (name.length < 3) continue;
            const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            html = html.replace(new RegExp(`(${escaped})`, "g"),
              `<span style="background:#DBEAFE;padding:0 2px;border-radius:3px;border-bottom:2px solid #3B82F6">$1</span>`
            );
          }
        }
        editor.innerHTML = html;
        toast.info("Party names highlighted", { description: "All party name occurrences have been highlighted in blue for verification." });
      },
      "Add party descriptions and addresses": () => {
        const block = `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Party Details (to be completed):</p><p style="font-size:14px"><strong>${fields.applicant?.split("|||")[0] || "Applicant"}</strong> — a company incorporated under the laws of Nigeria with RC Number __________, having its registered office at __________.</p><p style="font-size:14px;margin-top:8px"><strong>${fields.respondent?.split("|||")[0] || "Respondent"}</strong> — a company/individual residing at __________.</p></div>`;
        editor.innerHTML += block;
      },
      "Strengthen prayer points": () => {
        const block = `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#D97706">Additional Prayer Points to Consider:</p><ol style="font-size:14px;padding-left:1.5em"><li>An order of perpetual injunction restraining the Respondent from further breach.</li><li>An order for the payment of general damages in the sum of ₦__________.</li><li>An order for the payment of the cost of this action.</li><li>An order for 10% post-judgment interest on the awarded sum from the date of judgment until final liquidation.</li></ol></div>`;
        editor.innerHTML += block;
      },
      "Ensure reliefs are specific and quantifiable": () => {
        let html = editor.innerHTML;
        html = html.replace(/(damages|compensation|sum|amount)/gi,
          `<span style="background:#FEF3C7;padding:0 2px;border-radius:3px;border-bottom:2px dashed #F59E0B">$1</span>`
        );
        editor.innerHTML = html;
        toast.info("Financial terms highlighted", { description: "All monetary references highlighted in yellow — ensure each is specific with exact amounts." });
      },
      "Verify court has subject-matter jurisdiction": () => {
        const block = `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Jurisdiction Checklist:</p><ul style="font-size:14px;padding-left:1.5em"><li>✓ Court properly constituted as to members</li><li>✓ Subject matter is within court's jurisdiction — <em>see S.251 CFRN 1999 (Federal High Court) / S.272 (State High Court)</em></li><li>☐ Verify pecuniary jurisdiction limits</li><li>☐ Action initiated by due process of law</li><li>☐ All conditions precedent fulfilled</li></ul><p style="font-size:13px;margin-top:8px;color:#6B7280"><em>Authority: Madukolu v. Nkemdilim (1962) 2 SCNLR 341</em></p></div>`;
        editor.innerHTML += block;
      },
      "Cite specific statutory provisions": () => {
        const block = `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">Key Statutory References:</p><ul style="font-size:14px;padding-left:1.5em"><li>Constitution of the Federal Republic of Nigeria 1999 (as amended)</li><li>Evidence Act 2011</li><li>Federal High Court Act, Cap F12 LFN 2004</li><li>Sheriff and Civil Process Act, Cap S6 LFN 2004</li><li>Rules of Professional Conduct for Legal Practitioners 2007</li></ul></div>`;
        editor.innerHTML += block;
      },
      "Formulate issues for determination clearly": () => {
        const block = `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #F59E0B;background:#FFFBEB;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#D97706">Suggested Issues for Determination:</p><ol style="font-size:14px;padding-left:1.5em"><li>Whether this Honourable Court has the jurisdiction to entertain this suit.</li><li>Whether the Applicant/Claimant has established the case to warrant the grant of the reliefs sought.</li><li>Whether the Applicant/Claimant is entitled to the reliefs sought.</li></ol></div>`;
        editor.innerHTML += block;
      },
      "Ensure each paragraph starts with 'That'": () => {
        let html = editor.innerHTML;
        let count = 0;
        // Find paragraphs in affidavit sections that don't start with "That"
        html = html.replace(/<(p|li)([^>]*)>(\s*)(?!That\b)([A-Z])/g, (match, tag, attrs, ws, first) => {
          count++;
          return `<${tag}${attrs}>${ws}<span style="background:#FEF3C7;padding:0 2px;border-radius:3px">That ${first.toLowerCase()}</span>`;
        });
        if (count > 0) {
          editor.innerHTML = html;
          toast.info(`${count} paragraph(s) updated`, { description: "Added 'That' prefix where missing. Review highlighted changes." });
        }
      },
    };

    setTimeout(() => {
      // Try exact match first, then partial match
      const action = aiActions[suggestion] ||
        Object.entries(aiActions).find(([key]) =>
          suggestion.toLowerCase().includes(key.toLowerCase().split(" ").slice(0, 2).join(" "))
        )?.[1];

      if (action) {
        action();
      } else {
        // Generic: append the suggestion as a note block
        const block = `<div style="margin-top:16px;padding:12px 16px;border-left:3px solid #22B8C7;background:#F0FDFA;border-radius:0 8px 8px 0"><p style="font-weight:600;font-size:13px;color:#0D9488">AI Note — ${suggestion}:</p><p style="font-size:14px">This suggestion has been noted. Review your document with this consideration in mind and make the necessary adjustments to strengthen your legal position.</p></div>`;
        editor.innerHTML += block;
      }

      setAiProcessing(null);
      addRecentActivity("Applied AI suggestion", displayName);
      toast.success("AI suggestion applied", {
        description: `"${suggestion}" has been applied. Review the changes in your document.`,
      });
    }, 1500);
  };

  // ─── Render ───────────────────────────────────────────────────────

  return (
    <div className="flex h-[calc(100vh-120px)] bg-[#F8FAFC]">
      {/* LEFT SIDEBAR */}
      <aside className="w-[320px] bg-white border-r border-[#E5E7EB] p-6 flex flex-col gap-6 shrink-0 overflow-y-auto sticky top-0 h-full">
        <div>
          <h2 className="text-[#0F172A]" style={{ fontSize: "18px", fontWeight: 600 }}>
            Template Details
          </h2>
          <p className="text-[#6B7280] mt-1" style={{ fontSize: "14px" }}>
            {displayName}
          </p>
        </div>

        <div className="flex flex-col gap-4">
          {config.fields.map((field) => {
            if (field.showWhen) {
              const depValue = fields[field.showWhen.key];
              const allowed = field.showWhen.value;
              const matches = Array.isArray(allowed) ? allowed.includes(depValue) : depValue === allowed;
              if (!matches) return null;
            }

            const resolvedOptions =
              field.key === "division" && (fields.court === "State High Court" || fields.court === "Magistrate Court")
                ? stateDivisions[fields.state] || field.options || []
                : field.options || [];

            if (field.type === "multiParty") {
              return (
                <MultiPartyInput
                  key={field.key}
                  label={field.label}
                  partyRole={field.partyRole || "Party"}
                  value={fields[field.key] || ""}
                  onChange={(val) => updateField(field.key, val)}
                />
              );
            }

            return (
              <div key={field.key}>
                <label
                  className="block text-[#6B7280] mb-2"
                  style={{ fontSize: "12px", fontWeight: 500 }}
                >
                  {field.label}
                </label>
                {field.type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={fields[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] outline-none focus:border-[#22B8C7] resize-none"
                    style={{ fontSize: "14px" }}
                  />
                ) : field.type === "select" ? (
                  <select
                    value={fields[field.key] || ""}
                    onChange={(e) => {
                      updateField(field.key, e.target.value);
                      if (field.key === "state") {
                        const divs = stateDivisions[e.target.value];
                        if (divs && divs.length > 0) {
                          updateField("division", divs[0]);
                        }
                      }
                    }}
                    className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] outline-none focus:border-[#22B8C7]"
                    style={{ fontSize: "14px" }}
                  >
                    {resolvedOptions.map((opt) => (
                      <option key={opt} value={opt}>{opt}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={fields[field.key] || ""}
                    onChange={(e) => updateField(field.key, e.target.value)}
                    className="w-full px-4 py-3 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] outline-none focus:border-[#22B8C7]"
                    style={{ fontSize: "14px" }}
                  />
                )}
              </div>
            );
          })}
        </div>

        <button
          onClick={handleUpdateDraft}
          className="w-full bg-[#22B8C7] hover:bg-[#1EAAB8] text-white py-3 rounded-lg transition cursor-pointer"
          style={{ fontSize: "14px", fontWeight: 500 }}
        >
          Update Draft
        </button>
      </aside>

      {/* MAIN EDITOR */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP TOOLBAR */}
        <header className="h-16 bg-white border-b border-[#E5E7EB] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/templates")}
              className="text-[#6B7280] hover:text-[#0F172A] bg-transparent border-none cursor-pointer"
              style={{ fontSize: "18px" }}
            >
              &larr;
            </button>
            <div>
              <h1 className="text-[#0F172A]" style={{ fontSize: "16px", fontWeight: 600 }}>
                {displayName} Draft
              </h1>
              <p className="text-[#6B7280]" style={{ fontSize: "12px" }}>
                Last saved: {getTimeSince()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] hover:bg-[#F9FAFB] transition cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              <Save size={14} /> Save
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  disabled={isExportingPdf}
                  className="flex items-center gap-2 px-4 py-2 border border-[#D1D5DB] rounded-lg bg-white text-[#0F172A] hover:bg-[#F9FAFB] transition cursor-pointer"
                  style={{ fontSize: "13px" }}
                >
                  {isExportingPdf ? (
                    <span className="inline-block w-3.5 h-3.5 border-2 border-[#22B8C7] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <FileDown size={14} />
                  )}{" "}
                  {isExportingPdf ? "Generating PDF..." : "Export"} <ChevronDown size={14} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                <DropdownMenuItem
                  onClick={handleExportPDF}
                  disabled={isExportingPdf}
                  className="cursor-pointer"
                >
                  Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportWord} className="cursor-pointer">
                  Download as Word (.docx)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <button
              onClick={handleFinalize}
              className="flex items-center gap-2 px-4 py-2 bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg transition cursor-pointer"
              style={{ fontSize: "13px" }}
            >
              <CheckCircle2 size={14} /> Finalize
            </button>
          </div>
        </header>

        {/* FORMATTING TOOLBAR */}
        <FormattingToolbar editorRef={editorRef} activeFormats={activeFormats} />

        {/* EDITOR BODY */}
        <div className="flex flex-1 overflow-hidden">
          {/* DOCUMENT CANVAS */}
          <section className="flex-1 p-10 overflow-y-auto">
            <div ref={pdfContainerRef} className="max-w-[850px] mx-auto bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.08)] border border-[#E5E7EB] min-h-[1000px] p-16">
              <div
                key={docVersion}
                ref={editorRef}
                contentEditable
                suppressContentEditableWarning
                className="outline-none space-y-8 text-[#0F172A]"
                style={{ fontSize: "15px", lineHeight: 2 }}
              >
                {config.renderDocument(fields)}
              </div>
            </div>
          </section>

          {/* RIGHT AI PANEL */}
          <aside className="w-[320px] bg-white border-l border-[#E5E7EB] p-6 flex flex-col gap-6 shrink-0 overflow-y-auto sticky top-0 h-full">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-[#0F172A]" style={{ fontSize: "16px", fontWeight: 600 }}>
                  AI Assistant
                </h3>
                {aiAnalyzing && (
                  <span className="flex items-center gap-1.5 text-[#22B8C7]" style={{ fontSize: "11px" }}>
                    <span className="inline-block w-3 h-3 border-2 border-[#22B8C7] border-t-transparent rounded-full animate-spin" />
                    Analyzing...
                  </span>
                )}
              </div>
              <p className="text-[#6B7280] mt-1" style={{ fontSize: "14px" }}>
                Improve your legal draft instantly
              </p>
            </div>

            {/* Context Badge */}
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDFA] border border-[#CCFBF1] rounded-full text-[#0D9488]"
                style={{ fontSize: "11px", fontWeight: 600 }}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-[#22B8C7]" />
                {aiContext.section}
              </span>
            </div>

            <div className="flex flex-col gap-3">
              {aiContext.suggestions.map((label) => (
                <button
                  key={label}
                  onClick={() => handleAiSuggestion(label)}
                  disabled={aiProcessing !== null}
                  className={`w-full text-left px-4 py-3 rounded-lg cursor-pointer border transition-all duration-300 ${
                    aiProcessing === label
                      ? "bg-[#22B8C7] text-white border-[#22B8C7]"
                      : "bg-[#F0FDFA] border-[#CCFBF1] text-[#0F172A] hover:bg-[#CCFBF1]"
                  } disabled:opacity-60`}
                  style={{ fontSize: "14px" }}
                >
                  {aiProcessing === label ? (
                    <span className="flex items-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : (
                    label
                  )}
                </button>
              ))}
            </div>

            <div className="p-4 bg-[#F8FAFC] rounded-lg border border-[#E5E7EB] transition-all duration-300">
              <p className="text-[#475569]" style={{ fontSize: "14px", lineHeight: 1.6 }}>
                <span style={{ fontWeight: 600 }}>Suggestion:</span> {aiContext.tip}
              </p>
            </div>
          </aside>
        </div>
      </main>

      {/* Finalize Modal */}
      {showFinalizeModal && (
        <FinalizeModal
          templateName={displayName}
          onConfirm={confirmFinalize}
          onCancel={() => setShowFinalizeModal(false)}
        />
      )}
    </div>
  );
}
