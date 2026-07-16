"use client";

import { BookOpen, Code2, TrendingUp } from "lucide-react";
import MainLayout from "../components/MainLayout";
import ComingSoon from "../components/ComingSoon";

export default function LearnPage() {
  return (
    <MainLayout title="Learn" subtitle="Guided paths from concept to code">
      <ComingSoon
        icon={BookOpen}
        title="Guided ML learning,"
        highlight="on the way."
        description="Structured tracks that take you from concept to code — focused lessons wired directly to hands-on problems in the arena."
        features={[
          {
            icon: BookOpen,
            title: "Concept lessons",
            body: "Clear, focused explanations of the ideas behind every technique.",
          },
          {
            icon: Code2,
            title: "Learn by doing",
            body: "Every lesson maps straight to a problem you solve yourself.",
          },
          {
            icon: TrendingUp,
            title: "Track mastery",
            body: "See your understanding grow topic by topic.",
          },
        ]}
        note="Launching soon — start practicing in the arena today."
      />
    </MainLayout>
  );
}
