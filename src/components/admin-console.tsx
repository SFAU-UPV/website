"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { AlertDialog, Button, Dropdown } from "@heroui/react";
import {
  changeAnnouncementStateAction,
  changeProgramStateAction,
  saveAnnouncementAction,
  saveCycleAction,
  saveProgramAction,
  type AdminActionState,
} from "@/src/lib/admin";

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
const nested = (row: RecordValue, key: string) =>
  row[key] && typeof row[key] === "object" ? (row[key] as RecordValue) : {};

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
  const [isOpen, setIsOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<AdminActionState | null>(null);

  async function confirmAction() {
    const form = new FormData();
    form.set("id", id);
    form.set("next_status", nextStatus);
    setBusy(true);
    try {
      setResult(await action(form));
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
                <p>Are you sure you want to {label.toLowerCase()} this {subject}?</p>
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

function ProgramForm({
  program,
  services,
  categories,
  onDone,
  onSaved,
}: {
  program?: RecordValue;
  services: RecordValue[];
  categories: RecordValue[];
  onDone: () => void;
  onSaved: (program: RecordValue, message: string) => void;
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
      action={async (form) => {
        setBusy(true);
        try {
          const result = await saveProgramAction(initialState, form);
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
          <input name="name" required defaultValue={value(program ?? {}, "name")} />
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
          onChange={setPublicationStatus}
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
            onChange={setCategorySlugs}
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
        <label>
          Degree programs <small>One item per line</small>
          <textarea
            name="degree_programs"
            rows={5}
            defaultValue={
              Array.isArray(program?.degree_programs)
                ? (program?.degree_programs as string[]).join("\n")
                : ""
            }
          />
        </label>
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
      <label>
        Application link <small>Use the program’s HTTPS application destination.</small>
        <input
          name="application_url"
          type="url"
          placeholder="https://..."
          defaultValue={
            Array.isArray(program?.application_cycles) &&
            program.application_cycles[0] &&
            typeof program.application_cycles[0] === "object"
              ? value(program.application_cycles[0] as RecordValue, "external_url")
              : ""
          }
        />
      </label>
      <label className="checkbox-label">
        <input name="featured" type="checkbox" defaultChecked={Boolean(program?.featured)} />{" "}
        Feature on the public home page
      </label>
      <div className="admin-actions">
        <Button variant="primary" type="submit" isDisabled={busy}>
          {busy ? "Saving..." : program ? "Save changes" : "Save draft"}
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

function CycleForm({ programs }: { programs: RecordValue[] }) {
  const [state, action] = useActionState(saveCycleAction, initialState);
  return (
    <form
      className="admin-form"
      action={async (form) => {
        await action(form);
      }}
    >
      <div className="admin-form-grid">
        <label>
          Program
          <select name="program_id" required>
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
          <input name="academic_year" placeholder="2026–2027" />
        </label>
        <label>
          Cycle label
          <input name="cycle_label" placeholder="First semester" />
        </label>
        <label>
          Opens
          <input name="verified_open_at" type="date" />
        </label>
        <label>
          Closes
          <input name="close_at" type="date" />
        </label>
        <label>
          Link type
          <select name="link_type">
            <option value="">None</option>
            <option value="official-portal">Official portal</option>
            <option value="google-form">Google Form</option>
            <option value="other">Other HTTPS link</option>
          </select>
        </label>
        <label>
          Hold / close override
          <select name="admin_override">
            <option value="">None</option>
            <option value="upcoming">Upcoming</option>
            <option value="closed">Closed</option>
            <option value="suspended">Suspended</option>
          </select>
        </label>
      </div>
      <label>
        Application URL
        <input name="external_url" type="url" placeholder="https://..." />
      </label>
      <div className="admin-actions">
        <Button variant="primary" type="submit">
          Create cycle
        </Button>
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

function AnnouncementForm({
  announcement,
  onDone,
}: {
  announcement?: RecordValue;
  onDone?: () => void;
}) {
  const [state, action] = useActionState(saveAnnouncementAction, initialState);
  return (
    <form
      className="admin-form"
      action={async (form) => {
        await action(form);
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
        <label>
          Publish timestamp
          <input name="published_at" type="datetime-local" />
        </label>
      </div>
      <label className="checkbox-label">
        <input name="pinned" type="checkbox" defaultChecked={Boolean(announcement?.pinned)} /> Pin
        announcement
      </label>
      <div className="admin-actions">
        <Button variant="primary" type="submit">
          {announcement ? "Save changes" : "Save announcement"}
        </Button>
        {onDone ? (
          <Button variant="outline" type="button" onPress={onDone}>
            Cancel
          </Button>
        ) : null}
      </div>
      <ActionFeedback state={state} />
    </form>
  );
}

function programCategorySlugs(program: RecordValue) {
  const links = Array.isArray(program.program_category_links)
    ? (program.program_category_links as RecordValue[])
    : [];
  return links.map((link) => value(nested(link, "scholarship_categories"), "slug"));
}
function programApplicationStatus(program: RecordValue) {
  const cycles = Array.isArray(program.application_cycles)
    ? (program.application_cycles as RecordValue[])
    : [];
  const cycle = cycles.find((item) => !value(item, "archived_at"));
  if (!cycle) return "unverified";
  if (value(cycle, "admin_override")) return value(cycle, "admin_override");
  const today = new Date().toISOString().slice(0, 10);
  const opens = value(cycle, "verified_open_at").slice(0, 10);
  const closes = value(cycle, "close_at").slice(0, 10);
  if (opens && today < opens) return "upcoming";
  if (closes && today > closes) return "closed";
  return value(cycle, "external_url") ? "open" : "unverified";
}

export function AdminConsole({ snapshot }: { snapshot: AdminSnapshot }) {
  const router = useRouter();
  const [tab, setTab] = useState<"programs" | "cycles" | "announcements" | "audit">("programs");
  const [editing, setEditing] = useState<RecordValue | undefined>();
  const [editorRevision, setEditorRevision] = useState(0);
  const [editorMessage, setEditorMessage] = useState("");
  const [editingAnnouncement, setEditingAnnouncement] = useState<RecordValue | undefined>();
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
  const visiblePrograms = filteredPrograms.slice((page - 1) * pageSize, page * pageSize);
  return (
    <div className="admin-console">
      <div className="admin-tabs" role="tablist">
        {(
          [
            ["programs", "Programs"],
            ["cycles", "Application cycles"],
            ["announcements", "Announcements"],
            ["audit", "Audit trail"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            className={tab === key ? "active" : ""}
            role="tab"
            aria-selected={tab === key}
            onClick={() => setTab(key)}
          >
            {label}
          </button>
        ))}
      </div>
      {tab === "programs" ? (
        <section>
          <div className="admin-section-header">
            <div>
              <p className="eyebrow">Content inventory</p>
              <h2>Programs</h2>
            </div>
            <Button variant="primary" onPress={() => {
              setEditorMessage("");
              setEditing({});
            }}>
              Add program
            </Button>
          </div>
          {editing ? (
            <div
              className="admin-modal-backdrop"
              role="presentation"
              onMouseDown={(event) => {
                if (event.target === event.currentTarget) setEditing(undefined);
              }}
            >
              <section
                className="admin-modal"
                role="dialog"
                aria-modal="true"
                aria-labelledby="program-editor-title"
              >
                <div className="admin-modal-header">
                  <div>
                    <p className="eyebrow">Content editor</p>
                    <h3 id="program-editor-title">
                      {value(editing, "id") ? "Edit program" : "New program"}
                    </h3>
                  </div>
                  <Button
                    variant="ghost"
                    isIconOnly
                    type="button"
                    aria-label="Close editor"
                    onPress={() => setEditing(undefined)}
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
                  onDone={() => setEditing(undefined)}
                  onSaved={(savedProgram, message) => {
                    setEditing(savedProgram);
                    setEditorRevision((revision) => revision + 1);
                    setEditorMessage(message);
                    router.refresh();
                  }}
                />
              </section>
            </div>
          ) : null}
          <div className="admin-filters">
            <input
              placeholder="Search programs"
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setPage(1);
              }}
            />
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
            <select value={sort} onChange={(event) => setSort(event.target.value)}>
              <option value="updated">Recently updated</option>
              <option value="name">Alphabetical</option>
            </select>
          </div>
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
                {visiblePrograms.map((program) => (
                  <tr key={value(program, "id")}>
                    <td>
                      <strong>{value(program, "name")}</strong>
                    </td>
                    <td>
                      {value(nested(program, "service_categories"), "name") ||
                        "Scholarship directory"}
                    </td>
                    <td>
                      <span
                        className={`admin-state admin-state-${value(program, "publication_status")}`}
                      >
                        {value(program, "publication_status")}
                      </span>
                    </td>
                    <td>
                      <span className="admin-state">{programApplicationStatus(program)}</span>
                    </td>
                    <td>{value(program, "updated_at").slice(0, 10)}</td>
                    <td>
                      <div className="admin-row-actions">
                        <Button
                          variant="secondary"
                          size="sm"
                          className="admin-action-button admin-action-edit"
                          onPress={() => {
                            setEditorMessage("");
                            setEditing(program);
                          }}
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
            <Button variant="outline" size="sm" isDisabled={page <= 1} onPress={() => setPage(page - 1)}>
              Previous
            </Button>
            <span>
              Page {page} of {pages}
            </span>
            <Button variant="outline" size="sm" isDisabled={page >= pages} onPress={() => setPage(page + 1)}>
              Next
            </Button>
          </div>
        </section>
      ) : null}
      {tab === "cycles" ? (
        <section>
          <div className="admin-section-header">
            <div>
              <p className="eyebrow">Availability controls</p>
              <h2>Application cycles</h2>
            </div>
          </div>
          <p className="admin-note">
            Add an HTTPS application link and dates when available. Publishing a program makes it
            visible in the directory.
          </p>
          <CycleForm programs={snapshot.programs} />
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Program</th>
                  <th>Academic year</th>
                  <th>Window</th>
                  <th>Hold</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.programs.flatMap((program) =>
                  (Array.isArray(program.application_cycles)
                    ? (program.application_cycles as RecordValue[])
                    : []
                  ).map((cycle) => (
                    <tr key={value(cycle, "id")}>
                      <td>{value(program, "name")}</td>
                      <td>{value(cycle, "academic_year") || "—"}</td>
                      <td>
                        {value(cycle, "verified_open_at").slice(0, 10) || "—"} –{" "}
                        {value(cycle, "close_at").slice(0, 10) || "—"}
                      </td>
                      <td>{value(cycle, "admin_override") || "None"}</td>
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
              <p className="eyebrow">Public notices</p>
              <h2>Announcements</h2>
            </div>
          </div>
          {editingAnnouncement ? (
            <div className="admin-editor">
              <h3>Edit announcement</h3>
              <AnnouncementForm
                announcement={editingAnnouncement}
                onDone={() => setEditingAnnouncement(undefined)}
              />
            </div>
          ) : (
            <AnnouncementForm />
          )}{" "}
          {snapshot.announcements.map((announcement) => (
            <article className="admin-list-row" key={value(announcement, "id")}>
              <div>
                <strong>{value(announcement, "title")}</strong>
                <p>{value(announcement, "summary")}</p>
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
                  onPress={() => setEditingAnnouncement(announcement)}
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
              <p className="eyebrow">Traceability</p>
              <h2>Audit trail</h2>
            </div>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Entity</th>
                  <th>Action</th>
                  <th>Actor</th>
                </tr>
              </thead>
              <tbody>
                {snapshot.audits.map((audit) => (
                  <tr key={value(audit, "id")}>
                    <td>{value(audit, "created_at")}</td>
                    <td>
                      {value(audit, "entity_type")}
                      <small>{value(audit, "entity_id")}</small>
                    </td>
                    <td>{value(audit, "action")}</td>
                    <td>{value(audit, "actor_id")}</td>
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
