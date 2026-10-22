"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, Button, Dropdown, Modal } from "@heroui/react";
import {
  archiveCycleAction,
  changeAnnouncementStateAction,
  changeProgramStateAction,
  saveAnnouncementAction,
  saveCycleAction,
  saveProgramAction,
  type AdminActionState,
} from "@/src/lib/admin";
import { getPrimaryCycle, resolveApplicationAvailability, undergraduateDegreePrograms, type ApplicationCycle, type Program } from "@/src/types/domain";

type RecordValue = Record<string, unknown>;
type AdminSnapshot = {
  programs: RecordValue[];
  announcements: RecordValue[];
  services: RecordValue[];
  categories: RecordValue[];
  audits: RecordValue[];
};
const initialState: AdminActionState = { ok: false };
const scholarshipDirectoryOption = "scholarship-directory";
const value = (row: RecordValue, key: string) => String(row[key] ?? "");
function ActionFeedback({ state }: { state: AdminActionState }) {
  return state.message || state.error ? (
    <p className={state.ok ? "admin-success" : "admin-error"} role={state.ok ? "status" : "alert"}>
      {state.message ?? state.error}
    </p>
  ) : null;
}
function StateAction({
  id,
  nextStatus,
  action,
  label,
  subject,
}: {
  id: string;
  nextStatus: string;
  action: (form: FormData) => Promise<AdminActionState>;
  label: string;
  subject: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AdminActionState | null>(null);

  async function confirmAction() {
    const form = new FormData();
    form.set("id", id);
    form.set("next_status", nextStatus);
    setBusy(true);
    try {
      const outcome = await action(form);
      setResult(outcome);
      if (outcome.ok) router.refresh();
    } catch {
      setResult({ ok: false, error: "The action could not be completed. Please try again." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <AlertDialog isOpen={isOpen} onOpenChange={(open) => {
      if (busy) return;
      setIsOpen(open);
      if (!open) setResult(null);
    }}>
      <Button
        type="button"
        variant={label === "Archive" ? "danger-soft" : "secondary"}
        size="sm"
        className={`admin-action-button admin-action-${label.toLowerCase()}`}
        onPress={() => setIsOpen(true)}
      >
        {label}
      </Button>
      <AlertDialog.Backdrop>
        <AlertDialog.Container placement="center" size="sm">
          <AlertDialog.Dialog>
            <AlertDialog.Header>
              <AlertDialog.Heading>{result?.ok ? "Action completed" : `${label} ${subject}?`}</AlertDialog.Heading>
            </AlertDialog.Header>
            <AlertDialog.Body>
              {result ? (
                <p className={result.ok ? "admin-success" : "admin-error"} role={result.ok ? "status" : "alert"}>
                  {result.message ?? result.error}
                </p>
              ) : (
                <p>
                  Are you sure you want to {label.toLowerCase()} this {subject}?
                  {label === "Publish" && subject === "program"
                    ? " Publishing program information does not open applications until its cycle is verified."
                    : null}
                </p>
              )}
            </AlertDialog.Body>
            <AlertDialog.Footer>
              <Button type="button" variant="outline" isDisabled={busy} onPress={() => setIsOpen(false)}>
                {result?.ok ? "Close" : "Cancel"}
              </Button>
              {!result?.ok ? (
                <Button
                  type="button"
                  variant={label === "Archive" ? "danger-soft" : "secondary"}
                  className={`admin-action-button admin-action-${label.toLowerCase()}`}
                  isDisabled={busy}
                  onPress={confirmAction}
                >
                  {busy ? "Working..." : label}
                </Button>
              ) : null}
            </AlertDialog.Footer>
          </AlertDialog.Dialog>
        </AlertDialog.Container>
      </AlertDialog.Backdrop>
    </AlertDialog>
  );
}
function AdminDropdown({
  label,
  name,
  value: selectedValue,
  formValue,
  options,
  onChange,
  multiple = false,
}: {
  label: string;
  name: string;
  value: string;
  formValue?: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => void;
  multiple?: boolean;
}) {
  const selectedValues = selectedValue
    ? selectedValue
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];
  const selectedLabels = options
    .filter((option) => selectedValues.includes(option.value))
    .map((option) => option.label);
  return (
    <label>
      {label}
      <Dropdown>
        <Dropdown.Trigger className="admin-dropdown-trigger" type="button">
          {selectedLabels.length ? selectedLabels.join(", ") : `Choose ${label.toLowerCase()}`}
          <span aria-hidden="true">⌄</span>
        </Dropdown.Trigger>
        <Dropdown.Popover>
          <Dropdown.Menu
            aria-label={label}
            selectionMode={multiple ? "multiple" : "single"}
            selectedKeys={new Set(selectedValues)}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              onChange(Array.from(keys).map(String).join(", "));
            }}
          >
            {options.map((option) => (
              <Dropdown.Item key={option.value} id={option.value}>
                {option.label}
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      <input type="hidden" name={name} value={formValue ?? selectedValue} />
    </label>
  );
}

function DegreeProgramsField({
  initialValues,
  onDirty,
}: {
  initialValues: string[];
  onDirty: () => void;
}) {
  const [selected, setSelected] = useState(() => new Set(initialValues));
  const options = Array.from(new Set([...undergraduateDegreePrograms, ...initialValues])).sort((a, b) =>
    a.localeCompare(b),
  );
  const selectedNames = options.filter((degree) => selected.has(degree));
  const selectionLabel = selectedNames.length === 0
    ? "Choose degree programs"
    : selectedNames.length <= 2
      ? selectedNames.join(", ")
      : `${selectedNames.slice(0, 2).join(", ")} +${selectedNames.length - 2} more`;

  return (
    <div className="admin-degree-field">
      <label htmlFor="degree-programs-trigger">
        Degree programs
        <small id="degree-programs-hint">Select all applicable programs.</small>
      </label>
      <Dropdown>
        <Dropdown.Trigger
          id="degree-programs-trigger"
          className="admin-dropdown-trigger"
          type="button"
          aria-describedby="degree-programs-hint"
        >
          <span className="admin-degree-selection" title={selectedNames.join(", ") || undefined}>{selectionLabel}</span>
          <span aria-hidden="true">⌄</span>
        </Dropdown.Trigger>
        <Dropdown.Popover className="admin-degree-popover">
          <Dropdown.Menu
            aria-label="Degree programs"
            selectionMode="multiple"
            selectedKeys={selected}
            onSelectionChange={(keys) => {
              if (keys === "all") return;
              setSelected(new Set(Array.from(keys, String)));
              onDirty();
            }}
          >
            {options.map((degree) => (
              <Dropdown.Item key={degree} id={degree}>
                {degree}
                <Dropdown.ItemIndicator />
              </Dropdown.Item>
            ))}
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>
      {Array.from(selected).map((degree) => (
        <input key={degree} type="hidden" name="degree_programs" value={degree} />
      ))}
    </div>
  );
}

function ProgramForm({
  program,
  services,
  categories,
  onDone,
  onSaved,
  onDirty,
}: {
  program?: RecordValue;
  services: RecordValue[];
  categories: RecordValue[];
  onDone: () => void;
  onSaved: (program: RecordValue, message: string) => void;
  onDirty: () => void;
}) {
  const [state, setState] = useState<AdminActionState>(initialState);
  const [busy, setBusy] = useState(false);
  const [serviceCategory, setServiceCategory] = useState(
    program
      ? value(program, "service_category_id") || scholarshipDirectoryOption
      : "",
  );
  const [publicationStatus, setPublicationStatus] = useState(
    value(program ?? {}, "publication_status") || "draft",
  );
  const [categorySlugs, setCategorySlugs] = useState(
    Array.isArray(program?.category_slugs) ? (program?.category_slugs as string[]).join(", ") : "",
  );
  const isScholarshipService = (selected: string) =>
    selected === scholarshipDirectoryOption ||
    services.some(
      (service) => value(service, "id") === selected && value(service, "slug") === "scholarships",
    );
  return (
    <form
      className="admin-form"
      onChangeCapture={onDirty}
      action={async (form) => {
        setBusy(true);
        try {
          const result = await saveProgramAction(form);
          setState(result);
          if (result.ok && result.program) onSaved(result.program, result.message ?? "Program saved.");
        } catch {
          setState({ ok: false, error: "Program could not be saved. Please try again." });
        } finally {
          setBusy(false);
        }
      }}
    >
      <input type="hidden" name="id" value={value(program ?? {}, "id")} />
      <div className="admin-form-grid">
        <label>
          Name
          <input name="name" required autoFocus defaultValue={value(program ?? {}, "name")} />
        </label>
        <label>
          Slug
          <input
            name="slug"
            required
            pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
            defaultValue={value(program ?? {}, "slug")}
          />
        </label>
        <AdminDropdown
          label="Service"
          name="service_category_id"
          value={serviceCategory}
          formValue={serviceCategory === scholarshipDirectoryOption ? "" : serviceCategory}
          onChange={(selected) => {
            onDirty();
            setServiceCategory(selected);
            if (!isScholarshipService(selected)) setCategorySlugs("");
          }}
          options={[
            { value: scholarshipDirectoryOption, label: "Scholarship directory" },
            ...services.map((item) => ({ value: value(item, "id"), label: value(item, "name") })),
          ]}
        />
        <AdminDropdown
          label="Publication"
          name="publication_status"
          value={publicationStatus}
          onChange={(selected) => { onDirty(); setPublicationStatus(selected); }}
          options={[
            { value: "draft", label: "Draft" },
            { value: "published", label: "Published" },
          ]}
        />
        {isScholarshipService(serviceCategory) ? (
          <AdminDropdown
            label="Categories"
            name="category_slugs"
            value={categorySlugs}
            onChange={(selected) => { onDirty(); setCategorySlugs(selected); }}
            multiple
            options={categories.map((item) => ({
              value: value(item, "slug"),
              label: value(item, "name"),
            }))}
          />
        ) : null}
        <label>
          Display priority
          <input
            name="display_priority"
            type="number"
            min="0"
            defaultValue={value(program ?? {}, "display_priority")}
          />
        </label>
      </div>
      <label>
        Description / overview
        <textarea
          name="description"
          rows={5}
          defaultValue={value(program ?? {}, "description")}
        />
      </label>
      <div className="admin-form-grid">
        <label>
          Eligibility <small>One item per line</small>
          <textarea
            name="eligibility"
            rows={5}
            defaultValue={
              Array.isArray(program?.eligibility)
                ? (program?.eligibility as string[]).join("\n")
                : ""
            }
          />
        </label>
        <label>
          Requirements <small>One item per line</small>
          <textarea
            name="requirements"
            rows={5}
            defaultValue={
              Array.isArray(program?.requirements)
                ? (program?.requirements as string[]).join("\n")
                : ""
            }
          />
        </label>
        <label>
          Benefits <small>One item per line</small>
          <textarea
            name="benefits"
            rows={5}
            defaultValue={
              Array.isArray(program?.benefits) ? (program?.benefits as string[]).join("\n") : ""
            }
          />
        </label>
        <DegreeProgramsField
          initialValues={Array.isArray(program?.degree_programs) ? (program.degree_programs as string[]) : []}
          onDirty={onDirty}
        />
      </div>
      <label>
        Application process <small>One item per line</small>
        <textarea
          name="application_process"
          rows={4}
          defaultValue={
            Array.isArray(program?.application_process)
              ? (program?.application_process as string[]).join("\n")
              : ""
          }
        />
      </label>
      <p className="admin-note">Set application dates, links, and verification in Application cycles after saving this program.</p>
      <label className="checkbox-label">
        <input name="featured" type="checkbox" defaultChecked={Boolean(program?.featured)} />{" "}
        Feature on the public home page
      </label>
      <div className="admin-actions">
        <Button variant="primary" type="submit" isDisabled={busy}>
          {busy ? "Saving..." : program ? "Save changes" : publicationStatus === "published" ? "Save and publish" : "Save draft"}
        </Button>
        <Button
          variant="outline"
          type="button"
          isDisabled={!value(program ?? {}, "id")}
          onPress={() =>
            window.open(
              `/admin/preview/program?id=${encodeURIComponent(value(program ?? {}, "id"))}`,
              "_blank",
              "noopener,noreferrer",
            )
          }
        >
          Preview
        </Button>
        <Button variant="outline" type="button" onPress={onDone}>
          Cancel
        </Button>
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

function CycleForm({
  programs,
  cycle,
  onSaved,
  onCancel,
  onDirty,
}: {
  programs: RecordValue[];
  cycle?: RecordValue;
  onSaved: (message: string) => void;
  onCancel?: () => void;
  onDirty?: () => void;
}) {
  const [state, setState] = useState<AdminActionState>(initialState);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  return (
    <form
      className="admin-form"
      onChangeCapture={() => { setDirty(true); onDirty?.(); }}
      action={async (form) => {
        setBusy(true);
        try {
          const result = await saveCycleAction(form);
          setState(result);
          if (result.ok) onSaved(result.message ?? "Application cycle saved.");
        } catch {
          setState({ ok: false, error: "Application cycle could not be saved. Please try again." });
        } finally {
          setBusy(false);
        }
      }}
    >
      <input type="hidden" name="id" value={value(cycle ?? {}, "id")} />
      <div className="admin-form-grid">
        <label>
          Program
          {cycle ? <input type="hidden" name="program_id" value={value(cycle, "program_id")} /> : null}
          <select name={cycle ? undefined : "program_id"} required disabled={Boolean(cycle)} defaultValue={value(cycle ?? {}, "program_id")}>
            <option value="">Choose program</option>
            {programs.map((program) => (
              <option key={value(program, "id")} value={value(program, "id")}>
                {value(program, "name")}
              </option>
            ))}
          </select>
        </label>
        <label>
          Academic year
          <input name="academic_year" placeholder="2026–2027" defaultValue={value(cycle ?? {}, "academic_year")} />
        </label>
        <label>
          Cycle label
          <input name="cycle_label" placeholder="First semester" defaultValue={value(cycle ?? {}, "cycle_label")} />
        </label>
        <label>
          Opens
          <input name="verified_open_at" type="date" defaultValue={value(cycle ?? {}, "verified_open_at").slice(0, 10)} />
        </label>
        <label>
          Closes
          <input name="close_at" type="date" defaultValue={value(cycle ?? {}, "close_at").slice(0, 10)} />
        </label>
        <label>
          Link type
          <select name="link_type" defaultValue={value(cycle ?? {}, "link_type")}>
            <option value="">None</option>
            <option value="official-portal">Official portal</option>
            <option value="google-form">Google Form</option>
            <option value="other">Other HTTPS link</option>
          </select>
        </label>
        <label>
          Hold / close override
          <select name="admin_override" defaultValue={value(cycle ?? {}, "admin_override")}>
            <option value="">None</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>
      <label>
        Application URL
        <input name="external_url" type="url" placeholder="https://..." defaultValue={value(cycle ?? {}, "external_url")} />
      </label>
      <label className="checkbox-label admin-verify-control">
        <input name="verify_details" type="checkbox" />
        <span>I checked both dates and the application URL against the official source.</span>
      </label>
      <p className="admin-form-hint">
        {cycle && value(cycle, "verification_state") === "verified"
          ? "This cycle is currently verified. Confirm again when saving changes, or it will return to unverified."
          : "Applications remain unavailable until a staff member verifies this cycle."}
      </p>
      <div className="admin-actions">
        <Button variant="primary" type="submit" isDisabled={busy}>
          {busy ? "Saving..." : cycle ? "Save cycle" : "Create cycle"}
        </Button>
        {onCancel ? <Button variant="outline" type="button" onPress={() => {
          if (!dirty || window.confirm("Discard your unsaved cycle changes?")) onCancel();
        }}>Cancel</Button> : null}
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

function AnnouncementForm({
  announcement,
  onDone,
  onSaved,
  onDirty,
}: {
  announcement?: RecordValue;
  onDone?: () => void;
  onSaved: (message: string) => void;
  onDirty?: () => void;
}) {
  const [state, setState] = useState<AdminActionState>(initialState);
  const [busy, setBusy] = useState(false);
  const [dirty, setDirty] = useState(false);
  return (
    <form
      className="admin-form"
      onChangeCapture={() => { setDirty(true); onDirty?.(); }}
      action={async (form) => {
        setBusy(true);
        try {
          const result = await saveAnnouncementAction(form);
          setState(result);
          if (result.ok) onSaved(result.message ?? "Announcement saved.");
        } catch {
          setState({ ok: false, error: "Announcement could not be saved. Please try again." });
        } finally {
          setBusy(false);
        }
      }}
    >
      <input type="hidden" name="id" value={value(announcement ?? {}, "id")} />
      <label>
        Title
        <input
          name="title"
          required
          maxLength={240}
          defaultValue={value(announcement ?? {}, "title")}
        />
      </label>
      <label>
        Summary
        <textarea
          name="summary"
          required
          rows={3}
          defaultValue={value(announcement ?? {}, "summary")}
        />
      </label>
      <label>
        Content
        <textarea name="body" rows={6} defaultValue={value(announcement ?? {}, "body")} />
      </label>
      <div className="admin-form-grid">
        <label>
          Publication
          <select
            name="publication_status"
            defaultValue={value(announcement ?? {}, "publication_status") || "draft"}
          >
            <option value="draft">Draft</option>
            <option value="published">Published</option>
          </select>
        </label>
      </div>
      <label className="checkbox-label">
        <input name="pinned" type="checkbox" defaultChecked={Boolean(announcement?.pinned)} /> Pin
        announcement
      </label>
      <div className="admin-actions">
        <Button variant="primary" type="submit" isDisabled={busy}>
          {busy ? "Saving..." : announcement ? "Save changes" : "Save announcement"}
        </Button>
        {onDone ? (
          <Button variant="outline" type="button" onPress={() => {
            if (!dirty || window.confirm("Discard your unsaved announcement changes?")) onDone();
          }}>
            Cancel
          </Button>
        ) : null}
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

function programCategorySlugs(program: RecordValue) {
  return Array.isArray(program.category_slugs) ? (program.category_slugs as string[]) : [];
}
function auditTime(input: unknown) {
  const date = new Date(String(input ?? ""));
  return Number.isNaN(date.getTime())
    ? "Unknown time"
    : new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Manila" }).format(date);
}
function adminDate(input: unknown) {
  const date = new Date(String(input ?? ""));
  return Number.isNaN(date.getTime())
    ? "—"
    : new Intl.DateTimeFormat("en-PH", { dateStyle: "medium", timeZone: "Asia/Manila" }).format(date);
}
function programApplicationStatus(program: RecordValue) {
  const cycles = Array.isArray(program.application_cycles)
    ? (program.application_cycles as RecordValue[])
    : [];
  const mapped: ApplicationCycle[] = cycles.map((cycle) => ({
    id: value(cycle, "id"),
    programId: value(program, "id"),
    startsOn: value(cycle, "verified_open_at").slice(0, 10) || null,
    endsOn: value(cycle, "close_at").slice(0, 10) || null,
    externalApplicationUrl: value(cycle, "external_url") || undefined,
    linkType: (value(cycle, "link_type") || undefined) as ApplicationCycle["linkType"],
    verificationStatus: value(cycle, "verification_state") === "verified" ? "verified" : "unverified",
    declaredAvailability: "unverified",
    statusOverride: (value(cycle, "admin_override") || undefined) as ApplicationCycle["statusOverride"],
  }));
  return resolveApplicationAvailability(getPrimaryCycle({ cycles: mapped } as Program));
}

export function AdminConsole({ snapshot }: { snapshot: AdminSnapshot }) {
  const router = useRouter();
  const [tab, setTab] = useState<"overview" | "programs" | "cycles" | "announcements" | "audit">("overview");
  const [editing, setEditing] = useState<RecordValue | undefined>();
  const editorTriggerRef = useRef<HTMLElement | null>(null);
  const [editorDirty, setEditorDirty] = useState(false);
  const [editorRevision, setEditorRevision] = useState(0);
  const [editorMessage, setEditorMessage] = useState("");
  const [editingCycle, setEditingCycle] = useState<RecordValue | undefined>();
  const [cycleEditorOpen, setCycleEditorOpen] = useState(false);
  const [cycleDirty, setCycleDirty] = useState(false);
  const cycleEditorHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const cycleEditorTriggerRef = useRef<HTMLElement | null>(null);
  const [cycleRevision, setCycleRevision] = useState(0);
  const [cycleMessage, setCycleMessage] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState<RecordValue | undefined>();
  const [announcementEditorOpen, setAnnouncementEditorOpen] = useState(false);
  const [announcementDirty, setAnnouncementDirty] = useState(false);
  const announcementEditorHeadingRef = useRef<HTMLHeadingElement | null>(null);
  const announcementEditorTriggerRef = useRef<HTMLElement | null>(null);
  const [announcementRevision, setAnnouncementRevision] = useState(0);
  const [announcementMessage, setAnnouncementMessage] = useState("");
  const [query, setQuery] = useState("");
  const [publication, setPublication] = useState("all");
  const [category, setCategory] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [sort, setSort] = useState("updated");
  const [page, setPage] = useState(1);
  const pageSize = 8;
  const filteredPrograms = useMemo(
    () =>
      snapshot.programs
        .filter(
          (program) =>
            (!query ||
              value(program, "name").toLowerCase().includes(query.toLowerCase()) ||
              value(program, "slug").includes(query.toLowerCase())) &&
            (publication === "all" || value(program, "publication_status") === publication) &&
            (category === "all" || programCategorySlugs(program).includes(category)) &&
            (availability === "all" || programApplicationStatus(program) === availability),
        )
        .sort((a, b) =>
          sort === "name"
            ? value(a, "name").localeCompare(value(b, "name"))
            : value(b, "updated_at").localeCompare(value(a, "updated_at")),
        ),
    [snapshot.programs, query, publication, category, availability, sort],
  );
  const pages = Math.max(1, Math.ceil(filteredPrograms.length / pageSize));
  const currentPage = Math.min(page, pages);
  const visiblePrograms = filteredPrograms.slice((currentPage - 1) * pageSize, currentPage * pageSize);
  const hasProgramFilters = Boolean(query || publication !== "all" || category !== "all" || availability !== "all" || sort !== "updated");
  const publishedUnverified = snapshot.programs.filter(
    (program) => value(program, "publication_status") === "published" && programApplicationStatus(program) === "unverified",
  ).length;
  const draftPrograms = snapshot.programs.filter((program) => value(program, "publication_status") === "draft").length;
  const draftAnnouncements = snapshot.announcements.filter((item) => value(item, "publication_status") === "draft").length;
  useEffect(() => {
    if (cycleEditorOpen) cycleEditorHeadingRef.current?.focus();
  }, [cycleEditorOpen, editingCycle]);
  useEffect(() => {
    if (announcementEditorOpen) announcementEditorHeadingRef.current?.focus();
  }, [announcementEditorOpen, editingAnnouncement]);
  useEffect(() => {
    if (!editorDirty && !cycleDirty && !announcementDirty) return;
    const warnBeforeLeaving = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", warnBeforeLeaving);
    return () => window.removeEventListener("beforeunload", warnBeforeLeaving);
  }, [editorDirty, cycleDirty, announcementDirty]);
  function canLeaveCurrentSection() {
    if (tab === "cycles" && cycleDirty) return window.confirm("Discard your unsaved cycle changes?");
    if (tab === "announcements" && announcementDirty) return window.confirm("Discard your unsaved announcement changes?");
    return true;
  }
  function closeProgramEditor() {
    if (editorDirty && !window.confirm("Discard your unsaved program changes?")) return;
    setEditing(undefined);
    setEditorDirty(false);
    window.requestAnimationFrame(() => editorTriggerRef.current?.focus());
  }
  function openProgramEditor(program: RecordValue) {
    editorTriggerRef.current = document.activeElement as HTMLElement;
    setEditorMessage("");
    setEditorDirty(false);
    setEditing(program);
  }
  return (
    <div className="admin-console">
      <nav className="admin-tabs" aria-label="Workspace sections">
        {(
          [
            ["overview", "Overview"],
            ["programs", "Programs"],
            ["cycles", "Application cycles"],
            ["announcements", "Announcements"],
            ["audit", "Audit trail"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            type="button"
            aria-current={tab === key ? "page" : undefined}
            onClick={() => { if (key === tab || canLeaveCurrentSection()) { setCycleDirty(false); setAnnouncementDirty(false); setCycleEditorOpen(false); setAnnouncementEditorOpen(false); setEditingCycle(undefined); setEditingAnnouncement(undefined); setTab(key); } }}
          >
            {label}
          </button>
        ))}
      </nav>
      {tab === "overview" ? (
        <section aria-labelledby="admin-overview-title">
          <div className="admin-section-header">
            <h2 id="admin-overview-title">Needs attention</h2>
          </div>
          <div className="admin-task-list">
            {publishedUnverified === 0 && draftPrograms === 0 && draftAnnouncements === 0 ? (
              <p className="admin-empty-state">No content reviews are pending. Use the tabs to manage programs, application cycles, and announcements.</p>
            ) : null}
            {publishedUnverified > 0 ? <div className="admin-task-row">
              <div><strong>{publishedUnverified} published programs need application details</strong><p>Verify the official link and both dates before students can apply.</p></div>
              <Button variant="secondary" onPress={() => { setAvailability("unverified"); setPublication("published"); setPage(1); setTab("programs"); }}>Review programs</Button>
            </div> : null}
            {draftPrograms > 0 ? <div className="admin-task-row">
              <div><strong>{draftPrograms} program drafts</strong><p>Review content and preview its student view before publishing.</p></div>
              <Button variant="secondary" onPress={() => { setPublication("draft"); setAvailability("all"); setPage(1); setTab("programs"); }}>Review drafts</Button>
            </div> : null}
            {draftAnnouncements > 0 ? <div className="admin-task-row">
              <div><strong>{draftAnnouncements} announcement drafts</strong><p>Finish or publish notices that students should see.</p></div>
              <Button variant="secondary" onPress={() => setTab("announcements")}>Review announcements</Button>
            </div> : null}
          </div>
        </section>
      ) : null}
      {tab === "programs" ? (
        <section>
          <div className="admin-section-header">
            <div>
              <h2>Programs</h2>
            </div>
            <Button variant="primary" onPress={() => openProgramEditor({})}>
              Add program
            </Button>
          </div>
          {editing ? (
            <Modal isOpen onOpenChange={(open) => {
              if (!open) closeProgramEditor();
            }}>
              <Modal.Backdrop className="admin-modal-backdrop">
                <Modal.Container className="admin-modal-container" placement="center">
                  <Modal.Dialog className="admin-modal" aria-labelledby="program-editor-title">
                    <div className="admin-modal-header">
                      <div>
                        <h3 id="program-editor-title">
                          {value(editing, "id") ? "Edit program" : "New program"}
                        </h3>
                      </div>
                      <Button
                        variant="ghost"
                        isIconOnly
                        type="button"
                        aria-label="Close editor"
                        onPress={closeProgramEditor}
                      >
                        ×
                      </Button>
                    </div>
                    {editorMessage ? <p className="admin-success" role="status">{editorMessage}</p> : null}
                    <ProgramForm
                      key={`${value(editing, "id")}:${editorRevision}`}
                      program={value(editing, "id") ? editing : undefined}
                      services={snapshot.services}
                      categories={snapshot.categories}
                      onDone={closeProgramEditor}
                      onDirty={() => setEditorDirty(true)}
                      onSaved={(savedProgram, message) => {
                        setEditorDirty(false);
                        setEditing(savedProgram);
                        setEditorRevision((revision) => revision + 1);
                        setEditorMessage(message);
                        router.refresh();
                      }}
                    />
                  </Modal.Dialog>
                </Modal.Container>
              </Modal.Backdrop>
            </Modal>
          ) : null}
          <div className="admin-filters">
            <label>
              <span>Search programs</span>
              <input
                type="search"
                value={query}
                onChange={(event) => {
                  setQuery(event.target.value);
                  setPage(1);
                }}
              />
            </label>
            <label>
              <span>Category</span>
              <select
                value={category}
                onChange={(event) => {
                  setCategory(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All categories</option>
                {snapshot.categories.map((item) => (
                  <option key={value(item, "slug")} value={value(item, "slug")}>
                    {value(item, "name")}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>Publication status</span>
              <select
                value={publication}
                onChange={(event) => {
                  setPublication(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All publication states</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </label>
            <label>
              <span>Application status</span>
              <select
                value={availability}
                onChange={(event) => {
                  setAvailability(event.target.value);
                  setPage(1);
                }}
              >
                <option value="all">All application states</option>
                <option value="open">Open</option>
                <option value="upcoming">Upcoming</option>
                <option value="closed">Closed</option>
                <option value="suspended">Suspended</option>
                <option value="unverified">Unverified</option>
              </select>
            </label>
            <label>
              <span>Sort by</span>
              <select value={sort} onChange={(event) => setSort(event.target.value)}>
                <option value="updated">Recently updated</option>
                <option value="name">Alphabetical</option>
              </select>
            </label>
          </div>
          {hasProgramFilters ? <div className="admin-filter-summary"><span>{filteredPrograms.length} matching program{filteredPrograms.length === 1 ? "" : "s"}</span><Button variant="outline" size="sm" onPress={() => { setQuery(""); setPublication("all"); setCategory("all"); setAvailability("all"); setSort("updated"); setPage(1); }}>Clear filters</Button></div> : null}
          <div className="admin-table-wrap">
            <table className="admin-table admin-program-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Service</th>
                  <th>Publication</th>
                  <th>Application</th>
                  <th>Updated</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visiblePrograms.length === 0 ? (
                  <tr className="admin-empty-row"><td colSpan={6} className="admin-empty-state">{hasProgramFilters ? "No programs match these filters. Clear filters to see all programs." : "No programs yet. Add a program to get started."}</td></tr>
                ) : null}
                {visiblePrograms.map((program) => (
                  <tr key={value(program, "id")}>
                    <td data-label="Name">
                      <strong>{value(program, "name")}</strong>
                    </td>
                    <td data-label="Service">
                      {value(program, "service_name") ||
                        "Scholarship directory"}
                    </td>
                    <td data-label="Publication">
                      <span
                        className={`admin-state admin-state-${value(program, "publication_status")}`}
                      >
                        {value(program, "publication_status")}
                      </span>
                    </td>
                    <td data-label="Application">
                      <span className={`admin-state admin-state-${programApplicationStatus(program)}`}>{programApplicationStatus(program)}</span>
                    </td>
                    <td data-label="Updated">{adminDate(program.updated_at)}</td>
                    <td data-label="Actions">
                      <div className="admin-row-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="admin-action-button admin-action-edit"
                          onPress={() => openProgramEditor(program)}
                        >
                          Edit
                        </Button>
                        {value(program, "publication_status") === "archived" ? (
                          <StateAction
                            id={value(program, "id")}
                            nextStatus="draft"
                            action={changeProgramStateAction}
                            label="Restore"
                            subject="program"
                          />
                        ) : value(program, "publication_status") === "published" ? (
                          <StateAction
                            id={value(program, "id")}
                            nextStatus="draft"
                            action={changeProgramStateAction}
                            label="Unpublish"
                            subject="program"
                          />
                        ) : (
                          <StateAction
                            id={value(program, "id")}
                            nextStatus="published"
                            action={changeProgramStateAction}
                            label="Publish"
                            subject="program"
                          />
                        )}{" "}
                        {value(program, "publication_status") !== "archived" ? (
                          <StateAction
                            id={value(program, "id")}
                            nextStatus="archived"
                            action={changeProgramStateAction}
                            label="Archive"
                            subject="program"
                          />
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="admin-pagination">
            <span>{filteredPrograms.length} result(s)</span>
            <Button variant="outline" size="sm" isDisabled={currentPage <= 1} onPress={() => setPage(currentPage - 1)}>
              Previous
            </Button>
            <span>
              Page {currentPage} of {pages}
            </span>
            <Button variant="outline" size="sm" isDisabled={currentPage >= pages} onPress={() => setPage(currentPage + 1)}>
              Next
            </Button>
          </div>
        </section>
      ) : null}
      {tab === "cycles" ? (
        <section>
          <div className="admin-section-header">
            <div>
              <h2>Application cycles</h2>
            </div>
            <Button variant="primary" isDisabled={snapshot.programs.length === 0} onPress={() => { if (canLeaveCurrentSection()) { cycleEditorTriggerRef.current = document.activeElement as HTMLElement; setCycleDirty(false); setEditingCycle(undefined); setCycleMessage(""); setCycleRevision((revision) => revision + 1); setCycleEditorOpen(true); } }}>Add cycle</Button>
          </div>
          <p className="admin-note">
            Publishing a program makes its information visible. Applications become available only after staff verify both dates and the official HTTPS link.
          </p>
          {cycleMessage ? <p className="admin-success" role="status">{cycleMessage}</p> : null}
          {cycleEditorOpen ? <div className="admin-editor">
            <h3 ref={cycleEditorHeadingRef} tabIndex={-1}>{editingCycle ? "Edit application cycle" : "New application cycle"}</h3>
            <CycleForm
              key={`${value(editingCycle ?? {}, "id")}:${cycleRevision}`}
              programs={snapshot.programs}
              cycle={editingCycle}
              onDirty={() => setCycleDirty(true)}
              onSaved={(message) => {
                setCycleMessage(message);
                setCycleDirty(false);
                setEditingCycle(undefined);
                setCycleEditorOpen(false);
                setCycleRevision((revision) => revision + 1);
                router.refresh();
                window.requestAnimationFrame(() => cycleEditorTriggerRef.current?.focus());
              }}
              onCancel={() => { setCycleDirty(false); setEditingCycle(undefined); setCycleEditorOpen(false); window.requestAnimationFrame(() => cycleEditorTriggerRef.current?.focus()); }}
            />
          </div> : null}
          <div className="admin-table-wrap">
            <table className="admin-table admin-cycle-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Academic year</th>
                  <th>Window</th>
                  <th>Application link</th>
                  <th>Verification</th>
                  <th>Hold</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.programs.every((program) => !Array.isArray(program.application_cycles) || program.application_cycles.length === 0) ? (
                  <tr className="admin-empty-row"><td colSpan={7} className="admin-empty-state">{snapshot.programs.length ? "No application cycles yet. Use Add cycle to create one." : "Add a program before creating its first application cycle."}</td></tr>
                ) : null}
                {snapshot.programs.flatMap((program) =>
                  (Array.isArray(program.application_cycles)
                    ? (program.application_cycles as RecordValue[])
                    : []
                  ).map((cycle) => (
                    <tr key={value(cycle, "id")}>
                      <td data-label="Program">{value(program, "name")}</td>
                      <td data-label="Academic year">{value(cycle, "academic_year") || "—"}</td>
                      <td data-label="Window">
                        {value(cycle, "verified_open_at").slice(0, 10) || "—"} –{" "}
                        {value(cycle, "close_at").slice(0, 10) || "—"}
                      </td>
                      <td data-label="Application link">{value(cycle, "external_url") ? <a className="admin-cycle-link" href={value(cycle, "external_url")} target="_blank" rel="noopener noreferrer">Check destination</a> : "Missing"}</td>
                      <td data-label="Verification"><span className={`admin-state admin-state-${value(cycle, "verification_state")}`}>{value(cycle, "verification_state")}</span></td>
                      <td data-label="Hold">{value(cycle, "admin_override") || "None"}</td>
                      <td data-label="Actions">
                        <div className="admin-row-actions">
                          <Button variant="secondary" size="sm" onPress={() => { if (canLeaveCurrentSection()) { cycleEditorTriggerRef.current = document.activeElement as HTMLElement; setCycleDirty(false); setCycleMessage(""); setEditingCycle(cycle); setCycleEditorOpen(true); } }}>Edit</Button>
                          <StateAction id={value(cycle, "id")} nextStatus="archived" action={archiveCycleAction} label="Archive" subject="application cycle" />
                        </div>
                      </td>
                    </tr>
                  )),
                )}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
      {tab === "announcements" ? (
        <section>
          <div className="admin-section-header">
            <div>
              <h2>Announcements</h2>
            </div>
            <Button variant="primary" onPress={() => { if (canLeaveCurrentSection()) { announcementEditorTriggerRef.current = document.activeElement as HTMLElement; setAnnouncementDirty(false); setEditingAnnouncement(undefined); setAnnouncementMessage(""); setAnnouncementRevision((revision) => revision + 1); setAnnouncementEditorOpen(true); } }}>New announcement</Button>
          </div>
          {announcementMessage ? <p className="admin-success" role="status">{announcementMessage}</p> : null}
          {announcementEditorOpen ? (
            <div className="admin-editor">
              <h3 ref={announcementEditorHeadingRef} tabIndex={-1}>{editingAnnouncement ? "Edit announcement" : "New announcement"}</h3>
              <AnnouncementForm
                key={`${value(editingAnnouncement ?? {}, "id")}:${announcementRevision}`}
                announcement={editingAnnouncement}
                onDirty={() => setAnnouncementDirty(true)}
                onDone={() => { setAnnouncementDirty(false); setEditingAnnouncement(undefined); setAnnouncementEditorOpen(false); window.requestAnimationFrame(() => announcementEditorTriggerRef.current?.focus()); }}
                onSaved={(message) => {
                  setAnnouncementMessage(message);
                  setAnnouncementDirty(false);
                  setEditingAnnouncement(undefined);
                  setAnnouncementEditorOpen(false);
                  setAnnouncementRevision((revision) => revision + 1);
                  router.refresh();
                  window.requestAnimationFrame(() => announcementEditorTriggerRef.current?.focus());
                }}
              />
            </div>
          ) : null}
          {snapshot.announcements.length === 0 ? <p className="admin-empty-state">No announcements yet. Use New announcement to create a draft.</p> : null}
          {snapshot.announcements.map((announcement) => (
            <article className="admin-list-row" key={value(announcement, "id")}>
              <div>
                <strong>{value(announcement, "title")}</strong>
                <p>{value(announcement, "summary")}</p>
                <small className="admin-list-meta">Updated {adminDate(announcement.updated_at)}{announcement.pinned ? " · Pinned" : ""}</small>
              </div>
              <span
                className={`admin-state admin-state-${value(announcement, "publication_status")}`}
              >
                {value(announcement, "publication_status")}
              </span>
              <div className="admin-row-actions">
                <Button
                  variant="secondary"
                  size="sm"
                  className="admin-action-button admin-action-edit"
                  onPress={() => { if (canLeaveCurrentSection()) { announcementEditorTriggerRef.current = document.activeElement as HTMLElement; setAnnouncementDirty(false); setAnnouncementMessage(""); setEditingAnnouncement(announcement); setAnnouncementEditorOpen(true); } }}
                >
                  Edit
                </Button>
                {value(announcement, "publication_status") === "archived" ? (
                  <StateAction
                    id={value(announcement, "id")}
                    nextStatus="draft"
                    action={changeAnnouncementStateAction}
                    label="Restore"
                    subject="announcement"
                  />
                ) : value(announcement, "publication_status") === "published" ? (
                  <StateAction
                    id={value(announcement, "id")}
                    nextStatus="draft"
                    action={changeAnnouncementStateAction}
                    label="Unpublish"
                    subject="announcement"
                  />
                ) : (
                  <StateAction
                    id={value(announcement, "id")}
                    nextStatus="published"
                    action={changeAnnouncementStateAction}
                    label="Publish"
                    subject="announcement"
                  />
                )}{" "}
                {value(announcement, "publication_status") !== "archived" ? (
                  <StateAction
                    id={value(announcement, "id")}
                    nextStatus="archived"
                    action={changeAnnouncementStateAction}
                    label="Archive"
                    subject="announcement"
                  />
                ) : null}
              </div>
            </article>
          ))}
        </section>
      ) : null}
      {tab === "audit" ? (
        <section>
          <div className="admin-section-header">
            <div>
              <h2>Audit trail</h2>
              <p className="admin-section-note">Recent 30 changes · Times shown in Philippine time</p>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table admin-audit-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Entity</th>
                  <th>Action</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.audits.length === 0 ? <tr className="admin-empty-row"><td colSpan={4} className="admin-empty-state">No recorded changes yet.</td></tr> : null}
                {snapshot.audits.map((audit) => (
                  <tr key={value(audit, "id")}>
                    <td data-label="When">{auditTime(audit.created_at)}</td>
                    <td data-label="Entity">
                      {value(audit, "entity_name") || value(audit, "entity_type").replaceAll("_", " ")}
                      <small>{value(audit, "entity_type").replaceAll("_", " ")}{value(audit, "entity_name") ? "" : ` · ${value(audit, "entity_id")}`}</small>
                    </td>
                    <td data-label="Action">{value(audit, "action").replaceAll("_", " ")}</td>
                    <td data-label="Actor">{value(audit, "actor_name") || value(audit, "actor_id")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : null}
    </div>
  );
}
