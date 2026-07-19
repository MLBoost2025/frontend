import { describe, expect, it } from "vitest";
import { COURSES, courseLessons, getLesson, totalLessonCount } from "./index";

describe("Learn curriculum integrity", () => {
  it("has unique course, module, and lesson slugs", () => {
    const courseSlugs = COURSES.map((course) => course.slug);
    expect(new Set(courseSlugs).size).toBe(courseSlugs.length);
    for (const course of COURSES) {
      const moduleSlugs = course.modules.map((module) => module.slug);
      expect(new Set(moduleSlugs).size).toBe(moduleSlugs.length);
      const lessonSlugs = courseLessons(course).map((lesson) => lesson.slug);
      expect(new Set(lessonSlugs).size).toBe(lessonSlugs.length);
    }
  });

  it("every lesson has objectives, content, a real quiz, and practice links", () => {
    for (const course of COURSES) {
      for (const lesson of courseLessons(course)) {
        const label = `${course.slug}/${lesson.slug}`;
        expect(lesson.objectives.length, label).toBeGreaterThanOrEqual(2);
        expect(lesson.blocks.length, label).toBeGreaterThanOrEqual(6);
        expect(lesson.quiz.length, label).toBeGreaterThanOrEqual(4);
        expect(lesson.practice.length, label).toBeGreaterThanOrEqual(1);
        expect(lesson.minutes, label).toBeGreaterThan(0);
      }
    }
  });

  it("every quiz question is well-formed with a valid answer index and explanation", () => {
    const seenIds = new Set<string>();
    for (const course of COURSES) {
      for (const lesson of courseLessons(course)) {
        for (const question of lesson.quiz) {
          const label = `${course.slug}/${lesson.slug}/${question.id}`;
          expect(seenIds.has(label), `duplicate quiz id ${label}`).toBe(false);
          seenIds.add(label);
          expect(question.options.length, label).toBeGreaterThanOrEqual(3);
          expect(question.answer, label).toBeGreaterThanOrEqual(0);
          expect(question.answer, label).toBeLessThan(question.options.length);
          expect(question.explanation.length, label).toBeGreaterThan(20);
        }
      }
    }
  });

  it("practice links carry valid difficulties and slug format", () => {
    for (const course of COURSES) {
      for (const lesson of courseLessons(course)) {
        for (const problem of lesson.practice) {
          expect(["Easy", "Medium", "Hard"]).toContain(problem.difficulty);
          expect(problem.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/);
          expect(problem.title.length).toBeGreaterThan(2);
        }
      }
    }
  });

  it("navigation resolves every lesson with correct prev/next chaining", () => {
    for (const course of COURSES) {
      const flat = courseLessons(course);
      flat.forEach((lesson, index) => {
        const ref = getLesson(course.slug, lesson.slug);
        expect(ref).toBeDefined();
        expect(ref!.previous?.slug).toBe(flat[index - 1]?.slug);
        expect(ref!.next?.slug).toBe(flat[index + 1]?.slug);
      });
    }
  });

  it("spans beginner to advanced with a substantial lesson count", () => {
    const levels = new Set(COURSES.map((course) => course.level));
    expect(levels).toContain("Beginner");
    expect(levels).toContain("Intermediate");
    expect(levels).toContain("Advanced");
    expect(totalLessonCount()).toBeGreaterThanOrEqual(30);
  });
});
