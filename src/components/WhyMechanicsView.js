"use client";

import { ArrowLeft } from "lucide-react";
import { WhyMechanics } from "./WhyMechanics";

export function WhyMechanicsView({ onBack }) {
  return (
    <div>
      <button className="back-btn" onClick={onBack}>
        <ArrowLeft size={14} /> All systems
      </button>

      <div className="dept-header">
        <div>
          <div className="eyebrow">THE MACHINE</div>
          <h1 className="dept-title">Why Mechanics Matters</h1>
        </div>
      </div>

      <WhyMechanics />
    </div>
  );
}
