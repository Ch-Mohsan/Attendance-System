import React from "react";

export default function LoaderOverlay({ show, label = "Loading..." }) {
  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[1000] grid place-items-center bg-black/60 backdrop-blur-sm"
      aria-busy="true"
      aria-live="polite"
      role="alert"
    >
      <div className="flex flex-col items-center gap-4">
        <div className="tc-pyramid" aria-hidden="true">
          <div
            className="tc-pyramid-face bg-orange-500"
            style={{ transform: "rotateY(0deg) rotateX(60deg) translateZ(18px)" }}
          />
          <div
            className="tc-pyramid-face bg-black"
            style={{ transform: "rotateY(90deg) rotateX(60deg) translateZ(18px)" }}
          />
          <div
            className="tc-pyramid-face bg-orange-500"
            style={{ transform: "rotateY(180deg) rotateX(60deg) translateZ(18px)" }}
          />
          <div
            className="tc-pyramid-face bg-black"
            style={{ transform: "rotateY(270deg) rotateX(60deg) translateZ(18px)" }}
          />
        </div>

        <div className="text-orange-500 font-semibold tracking-wide">{label}</div>
      </div>
    </div>
  );
}
