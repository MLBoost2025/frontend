"use client";

import { Activity, Award, Trophy } from "lucide-react";
import MainLayout from "../components/MainLayout";
import ComingSoon from "../components/ComingSoon";

export default function CompetitionsPage() {
  return (
    <MainLayout
      title="Competitions"
      subtitle="Timed contests designed for ML interview readiness"
    >
      <ComingSoon
        icon={Trophy}
        title="Timed ML contests are"
        highlight="almost here."
        description="Battle the clock on curated ML challenges, climb a live global leaderboard, and prove your edge against solvers around the world."
        features={[
          {
            icon: Trophy,
            title: "Ranked contests",
            body: "Compete in timed rounds built from interview-grade ML problems.",
          },
          {
            icon: Activity,
            title: "Live leaderboards",
            body: "Watch the standings update in real time as submissions land.",
          },
          {
            icon: Award,
            title: "Seasons & prizes",
            body: "Climb recurring seasons with rewards on the line.",
          },
        ]}
        note="Launching soon — sharpen up in the arena today."
      />
    </MainLayout>
  );
}
