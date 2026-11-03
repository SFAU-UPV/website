"use client";

import { useEffect, useRef } from "react";

const leaveEvent = "sfau:before-leave-editor";

export function requestEditorLeave() {
  return window.dispatchEvent(new Event(leaveEvent, { cancelable: true }));
}

export function useEditorGuard(dirty: boolean, busy: boolean) {
  const state = useRef({ dirty, busy });

  useEffect(() => {
    state.current = { dirty, busy };
  }, [dirty, busy]);

  useEffect(() => {
    let allowUnloadUntil = 0;
    const confirmLeave = (event: Event) => {
      if (state.current.busy) {
        event.preventDefault();
        return;
      }
      if (state.current.dirty && !window.confirm("Discard your unsaved program changes?")) {
        event.preventDefault();
      }
    };
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (Date.now() >= allowUnloadUntil && (state.current.dirty || state.current.busy)) event.preventDefault();
    };
    const followLink = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest("a[href]") : null;
      if (!(link instanceof HTMLAnchorElement) || link.target === "_blank" || link.hasAttribute("download")) return;
      const destination = new URL(link.href, window.location.href);
      if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;
      if (!requestEditorLeave()) {
        event.preventDefault();
        event.stopPropagation();
      } else {
        allowUnloadUntil = Date.now() + 1000;
      }
    };
    const navigation = (window as Window & { navigation?: EventTarget }).navigation;
    const traverse = (event: Event) => {
      if ((event as Event & { navigationType?: string }).navigationType !== "traverse" || !event.cancelable) return;
      if (!requestEditorLeave()) event.preventDefault();
      else allowUnloadUntil = Date.now() + 1000;
    };
    navigation?.addEventListener("navigate", traverse);
    window.addEventListener(leaveEvent, confirmLeave);
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", followLink, true);
    return () => {
      window.removeEventListener(leaveEvent, confirmLeave);
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", followLink, true);
      navigation?.removeEventListener("navigate", traverse);
    };
  }, []);
}
