import { programs, services, type Program, type ServiceCategory } from "@/src/types/domain";

export interface AnnouncementFixture {
  id: string;
  title: string;
  summary: string;
  publishedLabel: string;
  fixtureLabel: "STATIC MOCK FIXTURE";
}

const announcements: AnnouncementFixture[] = [
  { id: "mock-announcement-001", title: "SFAU information hub preview", summary: "This announcement row is a static fixture for the public layout and will be replaced by verified SFAU content.", publishedLabel: "Preview fixture", fixtureLabel: "STATIC MOCK FIXTURE" },
  { id: "mock-announcement-002", title: "Application availability requires verification", summary: "Published directory records do not imply an open application cycle.", publishedLabel: "Preview fixture", fixtureLabel: "STATIC MOCK FIXTURE" },
];

export function getPublicServices(): ServiceCategory[] { return services; }
export function getPublicPrograms(): Program[] { return programs.filter((program) => program.publicationStatus === "published"); }
export function getPublicAnnouncements(): AnnouncementFixture[] { return announcements; }
export function searchPublicContent(query: string) { const normalized = query.trim().toLowerCase(); if (!normalized) return []; return getPublicPrograms().filter((program) => `${program.name} ${program.summary}`.toLowerCase().includes(normalized)); }
