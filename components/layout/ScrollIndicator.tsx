import { ArrowDown } from "@/components/ui/Icons";

export default function ScrollIndicator() {
  return (
    <div className="scroll-indicator" aria-hidden="true">
      <span className="scroll-indicator__mouse">
        <span className="scroll-indicator__dot" />
      </span>
      <ArrowDown className="scroll-indicator__arrow" />
    </div>
  );
}
