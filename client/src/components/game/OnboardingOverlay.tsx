"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui";
import { motion, AnimatePresence } from "framer-motion";
import { X, MousePointer, Square, Trophy } from "lucide-react";

const steps = [
  {
    icon: MousePointer,
    title: "Click to Draw Lines",
    description: "Click between any two dots to draw a line. Complete a square to claim it!",
  },
  {
    icon: Square,
    title: "Capture Boxes",
    description: "When you draw the fourth side of a box, you capture it. Capturing gives you another turn.",
  },
  {
    icon: Trophy,
    title: "Win the Game",
    description: "The player with the most boxes when the board is full wins. Good luck!",
  },
];

function shouldShowOnboarding(): boolean {
  if (typeof window === "undefined") return false;
  return !localStorage.getItem("onboarding-seen");
}

export function OnboardingOverlay() {
  const [show, setShow] = useState(shouldShowOnboarding);
  const [step, setStep] = useState(0);

  const handleDismiss = () => {
    localStorage.setItem("onboarding-seen", "true");
    setShow(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-glass-bg backdrop-blur-2xl border border-glass-border rounded-3xl p-8 max-w-sm w-full shadow-elevated"
          >
            <div className="flex justify-between items-start mb-6">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
                {React.createElement(steps[step].icon, { className: "h-6 w-6 text-primary" })}
              </div>
              <button onClick={handleDismiss} className="p-1 rounded-lg text-muted hover:text-foreground" aria-label="Close">
                <X className="h-4 w-4" />
              </button>
            </div>

            <h2 className="text-xl font-bold mb-2">{steps[step].title}</h2>
            <p className="text-muted text-sm mb-8">{steps[step].description}</p>

            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 w-2 rounded-full transition-colors ${i === step ? "bg-primary" : "bg-border"}`}
                  />
                ))}
              </div>
              <div className="flex gap-2">
                {step < steps.length - 1 ? (
                  <>
                    <Button variant="ghost" size="sm" onClick={handleDismiss}>
                      Skip
                    </Button>
                    <Button variant="primary" size="sm" onClick={() => setStep((s) => s + 1)}>
                      Next
                    </Button>
                  </>
                ) : (
                  <Button variant="gradient" size="sm" onClick={handleDismiss}>
                    Got it!
                  </Button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
