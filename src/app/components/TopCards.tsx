import docIllustration from "figma:asset/c41b16f007b87be383cd7587e54b01a48cd72b52.png";
import { useNavigate } from "react-router";
import { useState, useEffect, useCallback } from "react";
import { getCompletedCount, getTemplatesUsedCount } from "./draftStore";

export function TopCards() {
  const navigate = useNavigate();
  const [completedCount, setCompletedCount] = useState(getCompletedCount);
  const [templatesCount, setTemplatesCount] = useState(getTemplatesUsedCount);

  const sync = useCallback(() => {
    setCompletedCount(getCompletedCount());
    setTemplatesCount(getTemplatesUsedCount());
  }, []);

  useEffect(() => {
    window.addEventListener("lexdraft-counters", sync);
    return () => window.removeEventListener("lexdraft-counters", sync);
  }, [sync]);

  return (
    <div className="grid grid-cols-3 gap-5">
      {/* Card 1 */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex justify-end -mr-4 -mt-2 mb-2">
          <img src={docIllustration} alt="" className="w-[140px] h-auto object-contain" />
        </div>
        <h3 className="text-[#0F172A] mb-2" style={{ fontSize: "18px", fontWeight: 600 }}>
          Start a new application
        </h3>
        <p className="text-[#6B7280] mb-5" style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.6 }}>
          Get started on a legal process quickly and easily.
        </p>
        <button
          onClick={() => navigate("/templates")}
          className="bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg px-5 py-2.5 transition"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          File an application
        </button>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex justify-end -mr-4 -mt-2 mb-2">
          <img src={docIllustration} alt="" className="w-[140px] h-auto object-contain" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="bg-[#22B8C7] text-white rounded-full px-3 py-0.5"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {completedCount}
          </span>
          <h3 className="text-[#0F172A] italic" style={{ fontSize: "18px", fontWeight: 700 }}>
            Completed Process
          </h3>
        </div>
        <p className="text-[#6B7280] mb-5" style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.6 }}>
          Total number of documents finalized/exported
        </p>
        <button
          onClick={() => navigate("/documents?status=Finalized")}
          className="bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg px-5 py-2.5 transition"
          style={{ fontSize: "13px", fontWeight: 500 }}
        >
          View process
        </button>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden">
        <div className="flex justify-end -mr-4 -mt-2 mb-2">
          <img src={docIllustration} alt="" className="w-[140px] h-auto object-contain" />
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span
            className="bg-[#22B8C7] text-white rounded-full px-3 py-0.5"
            style={{ fontSize: "13px", fontWeight: 600 }}
          >
            {templatesCount}
          </span>
          <h3 className="text-[#0F172A] italic" style={{ fontSize: "18px", fontWeight: 700 }}>
            Templates Used
          </h3>
        </div>
        <p className="text-[#6B7280] mb-11" style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.6 }}>
          Total number of templates used/shared
        </p>
        <button
          className="bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg px-5 py-2.5 transition"
          style={{ fontSize: "13px", fontWeight: 500 }}
          onClick={() => navigate("/templates")}
        >
          Select new template
        </button>
      </div>
    </div>
  );
}