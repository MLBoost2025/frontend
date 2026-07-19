import type { Course, Lesson, LearnModule } from "./types";
import { foundations } from "./content/foundations";
import { dataPreparation } from "./content/dataPreparation";
import { supervisedLearning } from "./content/supervisedLearning";
import { modelEvaluation } from "./content/modelEvaluation";
import { unsupervisedLearning } from "./content/unsupervisedLearning";
import { deepLearning } from "./content/deepLearning";
import { nlp } from "./content/nlp";

// Ordered beginner → advanced; the /learn page renders in this order.
export const COURSES: Course[] = [
  foundations,
  dataPreparation,
  supervisedLearning,
  modelEvaluation,
  unsupervisedLearning,
  deepLearning,
  nlp,
];

export function getCourse(courseSlug: string): Course | undefined {
  return COURSES.find((course) => course.slug === courseSlug);
}

export interface LessonRef {
  course: Course;
  module: LearnModule;
  lesson: Lesson;
  /** Zero-based position of the lesson within the whole course. */
  index: number;
  previous?: { slug: string; title: string };
  next?: { slug: string; title: string };
}

export function courseLessons(course: Course): Lesson[] {
  return course.modules.flatMap((module) => module.lessons);
}

export function getLesson(courseSlug: string, lessonSlug: string): LessonRef | undefined {
  const course = getCourse(courseSlug);
  if (!course) return undefined;
  const flat = courseLessons(course);
  const index = flat.findIndex((lesson) => lesson.slug === lessonSlug);
  if (index === -1) return undefined;
  const owningModule = course.modules.find((candidate) =>
    candidate.lessons.some((lesson) => lesson.slug === lessonSlug)
  )!;
  const previous = flat[index - 1];
  const next = flat[index + 1];
  return {
    course,
    module: owningModule,
    lesson: flat[index],
    index,
    previous: previous ? { slug: previous.slug, title: previous.title } : undefined,
    next: next ? { slug: next.slug, title: next.title } : undefined,
  };
}

export function totalLessonCount(): number {
  return COURSES.reduce((sum, course) => sum + courseLessons(course).length, 0);
}

export function totalQuizCount(): number {
  return COURSES.reduce(
    (sum, course) =>
      sum + courseLessons(course).reduce((inner, lesson) => inner + lesson.quiz.length, 0),
    0
  );
}
