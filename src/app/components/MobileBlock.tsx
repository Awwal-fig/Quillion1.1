import emptyStateImg from "figma:asset/809ecd82052fee700603064b95c5c5dec4db59ba.png";
import { Logo } from "./Logo";

export function MobileBlock() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div className="mb-16">
        <Logo size={36} />
      </div>

      {/* Illustration card */}
      <div className="bg-[#F5F5F5] rounded-2xl border border-[#E8E8E8] p-6 w-full max-w-[320px]">
        <div className="bg-white rounded-2xl px-4 py-10 flex flex-col items-center justify-center">
          <img
            src={emptyStateImg}
            alt=""
            className="w-[80px] h-auto mb-6 opacity-80"
          />
          <h2
            className="text-[#0F172A] mb-2"
            style={{ fontSize: "18px", fontWeight: 700 }}
          >
            Mobile version coming soon
          </h2>
          <p
            className="text-[#9CA3AF] max-w-[240px]"
            style={{ fontSize: "13px", fontWeight: 400, lineHeight: 1.6 }}
          >
            We're working hard to bring Quillon to your mobile device. Please use a desktop browser for now.
          </p>
        </div>
      </div>

      {/* Accent bar */}
      <div className="mt-8 w-12 h-1 rounded-full bg-[#22B8C7]" />
    </div>
  );
}
