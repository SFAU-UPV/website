"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { Announcement } from "@/src/lib/content";

const storageKey = "osa-sfau-seen-announcements";
const sessionSeenAnnouncementVersions = new Set<string>();

function announcementVersion(announcement: Announcement) {
  return `${announcement.id}:${announcement.publishedAt}`;
}

export function AnnouncementAlert({
  announcements,
}: {
  announcements: Announcement[];
}) {
  const router = useRouter();
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [visibleAnnouncements, setVisibleAnnouncements] = useState<Announcement[]>([]);
  const handledVersions = useRef(new Set<string>());
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      const now = Date.now();
      if (now - lastRefreshAt.current < 1000) return;
      lastRefreshAt.current = now;
      router.refresh();
    };

    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [router]);

  useEffect(() => {
    const pending = announcements.filter(
      (announcement) => !handledVersions.current.has(announcementVersion(announcement)),
    );
    if (pending.length === 0) return;

    const seenVersions = new Set(sessionSeenAnnouncementVersions);
    try {
      const stored = sessionStorage.getItem(storageKey);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      if (Array.isArray(parsed)) {
        parsed
          .filter((id): id is string => typeof id === "string")
          .forEach((id) => seenVersions.add(id));
      }
    } catch {
      // Keep the alert available when session storage is disabled or unavailable.
    }

    const unseen = pending.filter(
      (announcement) => !seenVersions.has(announcementVersion(announcement)),
    );
    pending.forEach((announcement) => handledVersions.current.add(announcementVersion(announcement)));
    if (unseen.length === 0) return;

    unseen.forEach((announcement) => {
      const version = announcementVersion(announcement);
      seenVersions.add(version);
      sessionSeenAnnouncementVersions.add(version);
    });
    try {
      sessionStorage.setItem(storageKey, JSON.stringify([...seenVersions]));
    } catch {
      // The in-memory state still prevents repeats while this page is mounted.
    }
    setVisibleAnnouncements((current) => [
      ...current.filter((currentAnnouncement) =>
        !unseen.some((announcement) => announcement.id === currentAnnouncement.id),
      ),
      ...unseen,
    ]);
  }, [announcements]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (visibleAnnouncements.length > 0 && dialog && !dialog.open) dialog.showModal();
  }, [visibleAnnouncements.length]);

  if (visibleAnnouncements.length === 0) return null;

  return (
    <dialog
      ref={dialogRef}
      className="announcement-dialog"
      aria-labelledby="announcement-dialog-title"
      onClose={() => setVisibleAnnouncements([])}
    >
      <h2 id="announcement-dialog-title">Announcements from OSA-SFAU</h2>
      <div className="announcement-list">
        {visibleAnnouncements.map((announcement) => (
          <article className="announcement-row" key={announcement.id}>
            <div>
              <h3>{announcement.title}</h3>
              {announcement.body ? <p>{announcement.body}</p> : null}
            </div>
            {announcement.publishedAt ? (
              <time dateTime={announcement.publishedAt}>
                {new Intl.DateTimeFormat("en-PH", {
                  dateStyle: "medium",
                  timeZone: "Asia/Manila",
                }).format(new Date(announcement.publishedAt))}
              </time>
            ) : null}
          </article>
        ))}
      </div>
      <div className="announcement-dialog-actions">
        <button
          className="button button-primary"
          type="button"
          onClick={() => dialogRef.current?.close()}
        >
          Close
        </button>
      </div>
    </dialog>
  );
}
