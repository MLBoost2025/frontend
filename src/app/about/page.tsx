import type { Metadata } from "next";
import PolicyPage from "../components/PolicyPage";

export const metadata: Metadata = { title: "About", description: "Why Katalume exists and what deliberate ML practice means." };

export default function AboutPage() {
  return (
    <PolicyPage
      title="About Katalume"
      summary="Katalume is the training ground for machine learning—deliberate practice, immediate feedback, and visible progress."
    >
      <section>
        <h2>Why Katalume exists</h2>
        <p>
          Machine learning becomes durable when concepts move from reading into repeated, purposeful practice.
          Katalume combines the rigor of coding challenges with the depth of applied ML work in an in-browser judge.
        </p>
      </section>
      <section>
        <h2>The name</h2>
        <p>
          “Kata” is deliberate practice that forges mastery. “Lume” is light or illumination—the moment a hard
          problem clicks. Together, Katalume represents practice turning into understanding.
        </p>
      </section>
      <section>
        <h2>What you can do</h2>
        <ul>
          <li>Solve real machine-learning problems and receive test-based feedback.</li>
          <li>Learn through structured lessons, quizzes, and linked practice.</li>
          <li>Track progress and prepare for technical interviews and competitions.</li>
        </ul>
      </section>
    </PolicyPage>
  );
}
