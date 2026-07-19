// Typed content model for the Learn experience. Lessons are authored as
// structured blocks (not markdown) so rendering stays consistent with the
// design system and content can be validated in unit tests.

export type LessonBlock =
  | { kind: "p"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[]; ordered?: boolean }
  | { kind: "code"; code: string; caption?: string }
  | { kind: "formula"; formula: string; explanation?: string }
  | { kind: "table"; headers: string[]; rows: string[][] }
  | {
      kind: "callout";
      tone: "insight" | "warning" | "definition";
      title?: string;
      text: string;
    };

export interface QuizQuestion {
  id: string;
  prompt: string;
  options: string[];
  /** Index into options. */
  answer: number;
  explanation: string;
}

export interface PracticeLink {
  slug: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
}

export interface Lesson {
  slug: string;
  title: string;
  /** Rough reading + quiz time. */
  minutes: number;
  objectives: string[];
  blocks: LessonBlock[];
  quiz: QuizQuestion[];
  practice: PracticeLink[];
}

export interface LearnModule {
  slug: string;
  title: string;
  description: string;
  lessons: Lesson[];
}

export type CourseLevel = "Beginner" | "Intermediate" | "Advanced";

export interface Course {
  slug: string;
  title: string;
  tagline: string;
  level: CourseLevel;
  /** Sidebar-style accent used on cards; a Tailwind gradient class pair. */
  accent: string;
  description: string;
  modules: LearnModule[];
}
