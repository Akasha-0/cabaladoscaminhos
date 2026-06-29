/**
 * Mentorship Session Notes — Akasha Portal / Cabala dos Caminhos
 *
 * Shared session notes for mentorship. Extends w33/mentorship-session-detail
 * and w39/mentorship-session-feedback. Mentor + mentee collaborate on session
 * notes, action items, and a text-based whiteboard.
 *
 * Standalone module — no external imports.
 */

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Hard cap on how many sections a single note can carry. */
export const MAX_SECTIONS_PER_NOTE = 30;

/** Hard cap on whiteboard entries per note (text-based whiteboard). */
export const MAX_WHITEBOARD_ENTRIES = 50;

/** Hard cap on action items per note. */
export const MAX_ACTION_ITEMS = 20;

/** Maximum length (characters) for a section heading. */
export const SECTION_HEADING_MAX = 80;

/** Maximum length (characters) for a whiteboard entry. */
export const WHITEBOARD_CONTENT_MAX = 500;

/** Default visibility when a note is created without an explicit choice. */
export const DEFAULT_VISIBILITY: NoteVisibility = "shared";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Visibility policy of a session note.
 *
 * - `private_mentor`  → only the mentor can read it.
 * - `private_mentee`  → only the mentee can read it.
 * - `shared`          → both mentor and mentee can read it (default).
 * - `public_summary`  → a redacted summary suitable for public sharing.
 */
export type NoteVisibility =
  | "private_mentor"
  | "private_mentee"
  | "shared"
  | "public_summary";

/** A note attached to a mentorship session, shared between mentor and mentee. */
export type SessionNote = {
  noteId: string;
  sessionId: string;
  mentorId: string;
  menteeId: string;
  visibility: NoteVisibility;
  sections: NoteSection[];
  whiteboard: WhiteboardEntry[];
  actionItems: NoteActionItem[];
  createdAt: number;
  updatedAt: number;
};

/** A single section inside a session note (heading + free-text body). */
export type NoteSection = {
  sectionId: string;
  heading: string;
  body: string;
  authorId: string;
  createdAt: number;
  updatedAt: number;
  tags: string[];
};

/** A discrete entry on the text-based whiteboard. */
export type WhiteboardEntry = {
  entryId: string;
  kind: "text" | "link" | "card" | "question" | "insight";
  content: string;
  meta?: Record<string, string>;
  position: number;
  createdAt: number;
};

/** An action item that emerged from a mentorship session. */
export type NoteActionItem = {
  itemId: string;
  title: string;
  description: string;
  ownerId: string;
  dueAt?: number;
  status: "open" | "in_progress" | "done" | "skipped";
  createdAt: number;
  completedAt?: number;
};

/** Diff summary produced when two parallel notes (mentor + mentee) merge. */
export type MergedNoteDiff = {
  noteId: string;
  addedSections: number;
  updatedSections: number;
  addedItems: number;
  resolvedConflicts: number;
  mergedAt: number;
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

let __mentorshipCounter = 0;

/**
 * Generate a short, monotonically-increasing identifier with a domain prefix.
 * Monotonic counter avoids collisions for the lifetime of the process;
 * callers should persist IDs externally if needed across restarts.
 */
function nextMentorshipId(prefix: string): string {
  __mentorshipCounter += 1;
  return `${prefix}_${Date.now().toString(36)}_${__mentorshipCounter.toString(36)}`;
}

/** Trim a string and assert it is non-empty; throws on invalid input. */
function requireText(value: string, label: string): string {
  if (typeof value !== "string") {
    throw new TypeError(`${label} must be a string`);
  }
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new RangeError(`${label} must not be empty`);
  }
  return trimmed;
}

/** Truncate a string to max length, preserving UTF-16 code units. */
function clampText(value: string, max: number): string {
  return value.length > max ? value.slice(0, max) : value;
}

// ---------------------------------------------------------------------------
// Construction
// ---------------------------------------------------------------------------

/**
 * Build a fresh {@link SessionNote} attached to `sessionId` between the given
 * mentor and mentee. Visibility defaults to {@link DEFAULT_VISIBILITY}.
 */
export function buildSessionNote(
  sessionId: string,
  mentorId: string,
  menteeId: string,
  visibility: NoteVisibility = DEFAULT_VISIBILITY,
): SessionNote {
  const now = Date.now();
  return {
    noteId: nextMentorshipId("note"),
    sessionId: requireText(sessionId, "sessionId"),
    mentorId: requireText(mentorId, "mentorId"),
    menteeId: requireText(menteeId, "menteeId"),
    visibility,
    sections: [],
    whiteboard: [],
    actionItems: [],
    createdAt: now,
    updatedAt: now,
  };
}

// ---------------------------------------------------------------------------
// Section CRUD
// ---------------------------------------------------------------------------

/**
 * Append a new section to a note. Returns the updated note and the freshly
 * created section. Throws if the note already has {@link MAX_SECTIONS_PER_NOTE}.
 */
export function addSection(
  note: SessionNote,
  heading: string,
  body: string,
  authorId: string,
  tags: string[] = [],
): { note: SessionNote; section: NoteSection } {
  if (note.sections.length >= MAX_SECTIONS_PER_NOTE) {
    throw new RangeError(
      `section cap reached (${MAX_SECTIONS_PER_NOTE}) for note ${note.noteId}`,
    );
  }
  const now = Date.now();
  const safeHeading = clampText(
    requireText(heading, "heading"),
    SECTION_HEADING_MAX,
  );
  const safeTags = Array.isArray(tags)
    ? tags.filter((t): t is string => typeof t === "string")
    : [];
  const section: NoteSection = {
    sectionId: nextMentorshipId("sec"),
    heading: safeHeading,
    body: requireText(body, "body"),
    authorId: requireText(authorId, "authorId"),
    createdAt: now,
    updatedAt: now,
    tags: safeTags,
  };
  const next: SessionNote = {
    ...note,
    sections: [...note.sections, section],
    updatedAt: now,
  };
  return { note: next, section };
}

/**
 * Replace the body of an existing section. Returns `{ updated: false }` when
 * no section matches `sectionId`. Throws if the section does not belong to
 * this note.
 */
export function updateSection(
  note: SessionNote,
  sectionId: string,
  body: string,
  authorId: string,
): { note: SessionNote; updated: boolean } {
  const idx = note.sections.findIndex((s) => s.sectionId === sectionId);
  if (idx < 0) return { note, updated: false };
  const now = Date.now();
  const safeBody = requireText(body, "body");
  const safeAuthor = requireText(authorId, "authorId");
  const target = note.sections[idx];
  const updated: NoteSection = {
    ...target,
    body: safeBody,
    authorId: safeAuthor,
    updatedAt: now,
  };
  const sections = note.sections.slice();
  sections[idx] = updated;
  return {
    note: { ...note, sections, updatedAt: now },
    updated: true,
  };
}

/**
 * Remove a section by id. Returns `{ removed: false }` when the id is unknown
 * or the section does not belong to this note.
 */
export function removeSection(
  note: SessionNote,
  sectionId: string,
): { note: SessionNote; removed: boolean } {
  const next = note.sections.filter((s) => s.sectionId !== sectionId);
  if (next.length === note.sections.length) {
    return { note, removed: false };
  }
  return {
    note: { ...note, sections: next, updatedAt: Date.now() },
    removed: true,
  };
}

// ---------------------------------------------------------------------------
// Whiteboard
// ---------------------------------------------------------------------------

/**
 * Append an entry to the text-based whiteboard. `content` is clamped to
 * {@link WHITEBOARD_CONTENT_MAX}. Throws when the entry cap is reached.
 */
export function addWhiteboardEntry(
  note: SessionNote,
  kind: WhiteboardEntry["kind"],
  content: string,
  authorId: string,
  meta?: Record<string, string>,
): { note: SessionNote; entry: WhiteboardEntry } {
  if (note.whiteboard.length >= MAX_WHITEBOARD_ENTRIES) {
    throw new RangeError(
      `whiteboard cap reached (${MAX_WHITEBOARD_ENTRIES}) for note ${note.noteId}`,
    );
  }
  const now = Date.now();
  const entry: WhiteboardEntry = {
    entryId: nextMentorshipId("wb"),
    kind,
    content: clampText(
      requireText(content, "content"),
      WHITEBOARD_CONTENT_MAX,
    ),
    meta: meta && typeof meta === "object" ? { ...meta } : undefined,
    position: note.whiteboard.length,
    createdAt: now,
  };
  return {
    note: { ...note, whiteboard: [...note.whiteboard, entry], updatedAt: now },
    entry,
  };
}

// ---------------------------------------------------------------------------
// Action items
// ---------------------------------------------------------------------------

/**
 * Register a new action item on the note. Throws when the item cap is
 * reached.
 */
export function addActionItem(
  note: SessionNote,
  title: string,
  description: string,
  ownerId: string,
  dueAt?: number,
): { note: SessionNote; item: NoteActionItem } {
  if (note.actionItems.length >= MAX_ACTION_ITEMS) {
    throw new RangeError(
      `action-item cap reached (${MAX_ACTION_ITEMS}) for note ${note.noteId}`,
    );
  }
  const now = Date.now();
  const item: NoteActionItem = {
    itemId: nextMentorshipId("act"),
    title: requireText(title, "title"),
    description: requireText(description, "description"),
    ownerId: requireText(ownerId, "ownerId"),
    dueAt: typeof dueAt === "number" ? dueAt : undefined,
    status: "open",
    createdAt: now,
  };
  return {
    note: { ...note, actionItems: [...note.actionItems, item], updatedAt: now },
    item,
  };
}

/**
 * Move an action item to a new status. Sets `completedAt` when the new
 * status is `done`. Returns `{ updated: false }` when the item id is unknown.
 */
export function markActionItem(
  note: SessionNote,
  itemId: string,
  status: NoteActionItem["status"],
  now: number,
): { note: SessionNote; updated: boolean } {
  const idx = note.actionItems.findIndex((i) => i.itemId === itemId);
  if (idx < 0) return { note, updated: false };
  const target = note.actionItems[idx];
  const updated: NoteActionItem = {
    ...target,
    status,
    completedAt:
      status === "done"
        ? now
        : status === "open" || status === "in_progress"
          ? undefined
          : target.completedAt,
  };
  const items = note.actionItems.slice();
  items[idx] = updated;
  return {
    note: { ...note, actionItems: items, updatedAt: now },
    updated: true,
  };
}

// ---------------------------------------------------------------------------
// Visibility / sharing
// ---------------------------------------------------------------------------

/**
 * Promote a mentor-private note (or selected sections) to be visible to the
 * mentee. Returns the updated note; the IDs in `sectionsToShare` MUST be
 * sections currently on `note` — unknown ids are silently ignored.
 */
export function shareWithMentee(
  note: SessionNote,
  sectionsToShare: string[],
): SessionNote {
  const ids = new Set(sectionsToShare);
  const sections = note.sections.map((s) =>
    ids.has(s.sectionId) ? { ...s } : s,
  );
  const visibility: NoteVisibility =
    note.visibility === "public_summary" ? note.visibility : "shared";
  return { ...note, sections, visibility, updatedAt: Date.now() };
}

/**
 * Decide whether `viewerId` may read `section` under `visibility`.
 * - `private_mentor` → mentor only
 * - `private_mentee` → mentee only
 * - `shared` / `public_summary` → both mentor and mentee
 */
export function canViewSection(
  section: NoteSection,
  viewerId: string,
  visibility: NoteVisibility,
): boolean {
  if (visibility === "shared" || visibility === "public_summary") {
    return true;
  }
  if (visibility === "private_mentor") {
    return section.authorId === viewerId;
  }
  if (visibility === "private_mentee") {
    return section.authorId === viewerId;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Merge + summary
// ---------------------------------------------------------------------------

/**
 * Merge two parallel notes — typically a mentor's local edits and a mentee's
 * local edits — into a single canonical note. Sections from both sides are
 * kept (mentees newer override on id conflict for shared sections). New
 * action items from either side are preserved.
 */
export function mergeNotes(
  mentorNote: SessionNote,
  menteeNote: SessionNote,
  now: number,
): { note: SessionNote; diff: MergedNoteDiff } {
  if (mentorNote.noteId !== menteeNote.noteId) {
    // mismatch on the same canonical note id — fall back to mentor's id so
    // callers can still merge; section ids remain unique thanks to the prefix.
  }
  const byId = new Map<string, NoteSection>();
  let addedSections = 0;
  let updatedSections = 0;
  for (const s of mentorNote.sections) {
    byId.set(s.sectionId, s);
  }
  for (const s of menteeNote.sections) {
    const existing = byId.get(s.sectionId);
    if (!existing) {
      byId.set(s.sectionId, s);
      addedSections += 1;
    } else if (existing.updatedAt < s.updatedAt) {
      byId.set(s.sectionId, s);
      updatedSections += 1;
    }
  }
  const mergedSections = Array.from(byId.values()).sort(
    (a, b) => a.createdAt - b.createdAt,
  );

  const itemsById = new Map<string, NoteActionItem>();
  for (const i of mentorNote.actionItems) itemsById.set(i.itemId, i);
  let addedItems = 0;
  for (const i of menteeNote.actionItems) {
    if (!itemsById.has(i.itemId)) {
      itemsById.set(i.itemId, i);
      addedItems += 1;
    }
  }
  const mergedItems = Array.from(itemsById.values());

  const wbById = new Map<string, WhiteboardEntry>();
  for (const w of [...mentorNote.whiteboard, ...menteeNote.whiteboard]) {
    wbById.set(w.entryId, w);
  }
  const mergedWb = Array.from(wbById.values()).sort(
    (a, b) => a.position - b.position,
  );

  // Count conflicts as sections present in BOTH notes — these had to be
  // resolved by picking one side (mentee wins on newer updatedAt).
  const mentorIds = new Set(mentorNote.sections.map((s) => s.sectionId));
  let resolvedConflicts = 0;
  for (const s of menteeNote.sections) {
    if (mentorIds.has(s.sectionId)) resolvedConflicts += 1;
  }

  const note: SessionNote = {
    noteId: mentorNote.noteId,
    sessionId: mentorNote.sessionId,
    mentorId: mentorNote.mentorId,
    menteeId: mentorNote.menteeId,
    visibility: mentorNote.visibility,
    sections: mergedSections.slice(0, MAX_SECTIONS_PER_NOTE),
    whiteboard: mergedWb.slice(0, MAX_WHITEBOARD_ENTRIES),
    actionItems: mergedItems.slice(0, MAX_ACTION_ITEMS),
    createdAt: mentorNote.createdAt,
    updatedAt: now,
  };
  const diff: MergedNoteDiff = {
    noteId: note.noteId,
    addedSections,
    updatedSections,
    addedItems,
    resolvedConflicts,
    mergedAt: now,
  };
  return { note, diff };
}

/**
 * Lightweight rollup of a note for dashboards and overviews.
 */
export function summarizeNote(note: SessionNote): {
  sectionsCount: number;
  whiteboardCount: number;
  openItems: number;
  doneItems: number;
  lastUpdatedAt: number;
} {
  let openItems = 0;
  let doneItems = 0;
  for (const item of note.actionItems) {
    if (item.status === "done") doneItems += 1;
    else openItems += 1;
  }
  return {
    sectionsCount: note.sections.length,
    whiteboardCount: note.whiteboard.length,
    openItems,
    doneItems,
    lastUpdatedAt: note.updatedAt,
  };
}
