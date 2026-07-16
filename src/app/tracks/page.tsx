"use client";

import { BadgeCheck, BriefcaseBusiness, Target } from "lucide-react";
import MainLayout from "../components/MainLayout";
import ComingSoon from "../components/ComingSoon";

export default function TracksPage() {
  return (
    <MainLayout title="Interview Tracks" subtitle="Role-ready ML interview prep">
      <ComingSoon
        icon={BriefcaseBusiness}
        title="Land your ML role with"
        highlight="curated tracks."
        description="Company-style prep paths that bundle the exact problems and skills top machine-learning and data-science interviews demand."
        features={[
          {
            icon: BriefcaseBusiness,
            title: "Role-ready paths",
            body: "Focused sequences that mirror real ML interview loops.",
          },
          {
            icon: Target,
            title: "Company style",
            body: "Practice the patterns top labs and startups actually ask.",
          },
          {
            icon: BadgeCheck,
            title: "Interview-ready",
            body: "Finish a track knowing you can walk in prepared.",
          },
        ]}
        note="Launching soon — build your edge in the arena today."
      />
    </MainLayout>
  );
}
