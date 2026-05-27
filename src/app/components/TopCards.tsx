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
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
      {/* Card 1 */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden min-h-[248px] flex flex-col">
        <div className="flex justify-end -mr-2 sm:-mr-4 -mt-1 sm:-mt-2 mb-2">
          <img src={docIllustration} alt="" className="w-[96px] sm:w-[120px] lg:w-[140px] h-auto object-contain" />
        </div>
        <h3 className="text-[#0F172A] mb-2 text-base sm:text-lg font-semibold leading-snug">
          Start a new application
        </h3>
        <p className="text-[#6B7280] mb-4 sm:mb-5 text-xs sm:text-[13px] font-normal leading-relaxed">
          Get started on a legal process quickly and easily.
        </p>
        <button
          onClick={() => navigate("/templates")}
          className="mt-auto w-full sm:w-auto bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg px-5 py-3 sm:py-2.5 transition text-sm font-medium min-h-11"
        >
          File an application
        </button>
      </div>

      {/* Card 2 */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden min-h-[248px] flex flex-col">
        <div className="flex justify-end -mr-2 sm:-mr-4 -mt-1 sm:-mt-2 mb-2">
          <img src={docIllustration} alt="" className="w-[96px] sm:w-[120px] lg:w-[140px] h-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mb-2 min-w-0">
          <span
            className="bg-[#22B8C7] text-white rounded-full px-3 py-0.5 text-xs sm:text-[13px] font-semibold shrink-0"
          >
            {completedCount}
          </span>
          <h3 className="text-[#0F172A] italic text-base sm:text-lg font-bold leading-snug break-words">
            Completed Process
          </h3>
        </div>
        <p className="text-[#6B7280] mb-4 sm:mb-5 text-xs sm:text-[13px] font-normal leading-relaxed">
          Total number of documents finalized/exported
        </p>
        <button
          onClick={() => navigate("/documents?status=Finalized")}
          className="mt-auto w-full sm:w-auto bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg px-5 py-3 sm:py-2.5 transition text-sm font-medium min-h-11"
        >
          View process
        </button>
      </div>

      {/* Card 3 */}
      <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 sm:p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] relative overflow-hidden min-h-[248px] flex flex-col">
        <div className="flex justify-end -mr-2 sm:-mr-4 -mt-1 sm:-mt-2 mb-2">
          <img src={docIllustration} alt="" className="w-[96px] sm:w-[120px] lg:w-[140px] h-auto object-contain" />
        </div>
        <div className="flex items-center gap-2 sm:gap-3 mb-2 min-w-0">
          <span
            className="bg-[#22B8C7] text-white rounded-full px-3 py-0.5 text-xs sm:text-[13px] font-semibold shrink-0"
          >
            {templatesCount}
          </span>
          <h3 className="text-[#0F172A] italic text-base sm:text-lg font-bold leading-snug break-words">
            Templates Used
          </h3>
        </div>
        <p className="text-[#6B7280] mb-4 sm:mb-11 text-xs sm:text-[13px] font-normal leading-relaxed">
          Total number of templates used/shared
        </p>
        <button
          className="mt-auto w-full sm:w-auto bg-[#22B8C7] hover:bg-[#1EAAB8] text-white rounded-lg px-5 py-3 sm:py-2.5 transition text-sm font-medium min-h-11"
          onClick={() => navigate("/templates")}
        >
          Select new template
        </button>
      </div>
    </div>
  );
}
