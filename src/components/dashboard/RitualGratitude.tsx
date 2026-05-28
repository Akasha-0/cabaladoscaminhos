"use client";

import { useState, useEffect, useCallback, useMemo } from "react";

export type RitualType =
  | "meditation"
  | "gratitude"
  | "breathing"
  | "prayer"
  | "manifestation"
  | "moon"
  | "chakra"
  | " affirmation";

interface RitualGratitudeEntry {
  id: string;
  text: string;
  ritualType: RitualType;
  createdAt: string;
}

interface StreakInfo {
  current: number;
  longest: number;
  lastDate: string | null;
}

const RITUAL_TYPES: { value: RitualType; label: string; icon: string }[] = [
  { value: "gratitude", label: "Gratidão", icon: "🙏" },
  { value: "meditation", label: "Meditação", icon: "🧘" },
  { value: "prayer", label: "Prece", icon: "✨" },
  { value: "manifestation", label: "Manifestação", icon: "🌟" },
  { value: "breathing", label: "Respiração", icon: "🌬️" },
  { value: "moon", label: "Lua", icon: "🌙" },
  { value: "chakra", label: "Chakra", icon: "🔮" },
  { value: " affirmation", label: "Afirmação", icon: "💫" },
];

const STORAGE_KEY = "ritual-gratitude-entries";

function getDateKey(date: Date): string {
  return date.toISOString().split("T")[0];
}

function formatDisplayDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatDisplayTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function calculateStreak(entries: RitualGratitudeEntry[]): StreakInfo {
  if (entries.length === 0) {
    return { current: 0, longest: 0, lastDate: null };
  }

  const today = new Date();
  const todayKey = getDateKey(today);

  const uniqueDates = [...new Set(entries.map((e) => getDateKey(new Date(e.createdAt))))].sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  const lastDate = uniqueDates[0] || null;

  let current = 0;
  let longest = 0;
  let tempStreak = 0;

  const checkDate = new Date(today);
  for (let i = 0; i < 365; i++) {
    const dateKey = getDateKey(checkDate);
    if (uniqueDates.includes(dateKey)) {
      tempStreak++;
      if (i === 0 || current > 0) {
        current = tempStreak;
      }
      longest = Math.max(longest, tempStreak);
    } else {
      if (i === 0) {
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        if (uniqueDates.includes(getDateKey(yesterday))) {
          tempStreak = 1;
          current = 0;
        } else {
          tempStreak = 0;
          current = 0;
          break;
        }
      } else {
        tempStreak = 0;
        if (current > 0) break;
      }
    }
    checkDate.setDate(checkDate.getDate() - 1);
  }

  const todayEntry = entries.find((e) => getDateKey(new Date(e.createdAt)) === todayKey);
  if (todayEntry) {
    current = Math.max(current, 1);
  } else {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (!uniqueDates.includes(getDateKey(yesterday))) {
      current = 0;
    }
  }

  longest = Math.max(longest, current);

  return { current, longest, lastDate };
}

export default function RitualGratitude() {
  const [entries, setEntries] = useState<RitualGratitudeEntry[]>([]);
  const [newText, setNewText] = useState("");
  const [selectedRitual, setSelectedRitual] = useState<RitualType>("gratitude");
  const [filterRitual, setFilterRitual] = useState<RitualType | "all">("all");
  const [isLoaded, setIsLoaded] = useState(false);
  const [showHistory, setShowHistory] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setEntries(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((updated: RitualGratitudeEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const streak = useMemo(() => calculateStreak(entries), [entries]);

  const filteredEntries = useMemo(() => {
    if (filterRitual === "all") return entries;
    return entries.filter((e) => e.ritualType === filterRitual);
  }, [entries, filterRitual]);

  const addEntry = useCallback(() => {
    const trimmed = newText.trim();
    if (!trimmed) return;

    const entry: RitualGratitudeEntry = {
      id: crypto.randomUUID(),
      text: trimmed,
      ritualType: selectedRitual,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    persist(updated);
    setNewText("");
  }, [newText, selectedRitual, entries, persist]);

  const deleteEntry = useCallback(
    (id: string) => {
      const updated = entries.filter((e) => e.id !== id);
      setEntries(updated);
      persist(updated);
    },
    [entries, persist]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      addEntry();
    }
  };

  if (!isLoaded) {
    return (
      <div className="ritual-gratitude">
        <h2>Ritual de Gratidão</h2>
        <p className="loading">Carregando...</p>
        <style jsx>{`
          .ritual-gratitude {
            padding: 1.5rem;
          }
          h2 {
            margin-bottom: 1rem;
            color: var(--foreground);
          }
          .loading {
            color: var(--muted-foreground);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="ritual-gratitude">
      <div className="ritual-header">
        <h2>Ritual de Gratidão</h2>
        <button className="toggle-history" onClick={() => setShowHistory(!showHistory)}>
          {showHistory ? "Ocultar" : "Mostrar"} Histórico
        </button>
      </div>

      <div className="streak-container">
        <div className="streak-item">
          <span className="streak-value">{streak.current}</span>
          <span className="streak-label">Sequência Atual</span>
        </div>
        <div className="streak-divider" />
        <div className="streak-item">
          <span className="streak-value">{streak.longest}</span>
          <span className="streak-label">Maior Sequência</span>
        </div>
        <div className="streak-divider" />
        <div className="streak-item">
          <span className="streak-value">{entries.length}</span>
          <span className="streak-label">Total de Registros</span>
        </div>
      </div>

      <div className="ritual-form">
        <div className="ritual-type-selector">
          <span className="selector-label">Tipo de Ritual:</span>
          <div className="ritual-buttons">
            {RITUAL_TYPES.map((ritual) => (
              <button
                key={ritual.value}
                className={`ritual-btn ${selectedRitual === ritual.value ? "active" : ""}`}
                onClick={() => setSelectedRitual(ritual.value)}
                title={ritual.label}
              >
                <span className="ritual-icon">{ritual.icon}</span>
                <span className="ritual-name">{ritual.label}</span>
              </button>
            ))}
          </div>
        </div>

        <textarea
          value={newText}
          onChange={(e) => setNewText(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Para que você é grato neste momento sagrado?"
          rows={3}
          className="gratitude-textarea"
        />

        <div className="form-actions">
          <span className="hint">Ctrl+Enter para enviar</span>
          <button onClick={addEntry} disabled={!newText.trim()} className="submit-btn">
            Registrar Ritual
          </button>
        </div>
      </div>

      {showHistory && (
        <div className="ritual-history">
          <div className="filter-bar">
            <span className="filter-label">Filtrar por ritual:</span>
            <select
              value={filterRitual}
              onChange={(e) => setFilterRitual(e.target.value as RitualType | "all")}
              className="filter-select"
            >
              <option value="all">Todos</option>
              {RITUAL_TYPES.map((ritual) => (
                <option key={ritual.value} value={ritual.value}>
                  {ritual.icon} {ritual.label}
                </option>
              ))}
            </select>
          </div>

          {filteredEntries.length === 0 ? (
            <p className="empty-state">
              {filterRitual === "all"
                ? "Nenhum ritual registrado ainda. Comece seu primeiro registro acima."
                : `Nenhum ritual do tipo "${RITUAL_TYPES.find((r) => r.value === filterRitual)?.label}" encontrado.`}
            </p>
          ) : (
            <ul className="entries-list">
              {filteredEntries.map((entry) => {
                const ritualInfo = RITUAL_TYPES.find((r) => r.value === entry.ritualType);
                return (
                  <li key={entry.id} className="entry-item">
                    <div className="entry-header">
                      <span className="entry-ritual-badge" title={ritualInfo?.label}>
                        {ritualInfo?.icon}
                      </span>
                      <span className="entry-date">
                        {formatDisplayDate(entry.createdAt)} às {formatDisplayTime(entry.createdAt)}
                      </span>
                    </div>
                    <p className="entry-text">{entry.text}</p>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="delete-btn"
                      aria-label="Excluir registro"
                    >
                      ×
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      <style jsx>{`
        .ritual-gratitude {
          padding: 1.5rem;
          max-width: 700px;
        }
        h2 {
          margin: 0 0 1rem;
          color: var(--foreground);
          font-size: 1.5rem;
        }
        .ritual-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }
        .toggle-history {
          padding: 0.4rem 0.8rem;
          background: transparent;
          border: 1px solid var(--border);
          color: var(--muted-foreground);
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .toggle-history:hover {
          background: var(--accent);
          color: var(--foreground);
        }
        .streak-container {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .streak-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.25rem;
        }
        .streak-value {
          font-size: 2rem;
          font-weight: 700;
          color: var(--spiritual-gold);
          font-family: var(--font-cinzel), serif;
        }
        .streak-label {
          font-size: 0.75rem;
          color: var(--muted-foreground);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .streak-divider {
          width: 1px;
          height: 40px;
          background: var(--border);
        }
        .ritual-form {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        .ritual-type-selector {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .selector-label {
          font-size: 0.85rem;
          color: var(--muted-foreground);
        }
        .ritual-buttons {
          display: flex;
          flex-wrap: wrap;
          gap: 0.4rem;
        }
        .ritual-btn {
          display: flex;
          align-items: center;
          gap: 0.3rem;
          padding: 0.4rem 0.7rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--muted-foreground);
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .ritual-btn:hover {
          border-color: var(--spiritual-gold);
          color: var(--foreground);
        }
        .ritual-btn.active {
          background: var(--spiritual-gold-muted);
          border-color: var(--spiritual-gold);
          color: var(--spiritual-gold);
        }
        .ritual-icon {
          font-size: 1rem;
        }
        .ritual-name {
          font-weight: 500;
        }
        .gratitude-textarea {
          width: 100%;
          padding: 0.9rem;
          border: 1px solid var(--border);
          border-radius: 10px;
          resize: vertical;
          font-family: inherit;
          font-size: 0.95rem;
          background: var(--background);
          color: var(--foreground);
          transition: border-color 0.2s;
        }
        .gratitude-textarea:focus {
          outline: none;
          border-color: var(--spiritual-gold);
        }
        .gratitude-textarea::placeholder {
          color: var(--muted-foreground);
        }
        .form-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .hint {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
        .submit-btn {
          padding: 0.6rem 1.2rem;
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover:not(:disabled) {
          background: var(--spiritual-gold);
          color: var(--background);
        }
        .submit-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .ritual-history {
          border-top: 1px solid var(--border);
          padding-top: 1rem;
        }
        .filter-bar {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }
        .filter-label {
          font-size: 0.85rem;
          color: var(--muted-foreground);
        }
        .filter-select {
          padding: 0.4rem 0.75rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 6px;
          color: var(--foreground);
          font-size: 0.85rem;
          cursor: pointer;
        }
        .empty-state {
          text-align: center;
          padding: 2rem;
          color: var(--muted-foreground);
          font-size: 0.9rem;
        }
        .entries-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .entry-item {
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 10px;
          position: relative;
          transition: border-color 0.2s;
        }
        .entry-item:hover {
          border-color: var(--spiritual-gold-muted);
        }
        .entry-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        .entry-ritual-badge {
          font-size: 1.2rem;
          line-height: 1;
        }
        .entry-date {
          font-size: 0.75rem;
          color: var(--muted-foreground);
        }
        .entry-text {
          margin: 0;
          color: var(--foreground);
          line-height: 1.6;
        }
        .delete-btn {
          position: absolute;
          top: 0.6rem;
          right: 0.6rem;
          width: 24px;
          height: 24px;
          padding: 0;
          background: transparent;
          color: var(--muted-foreground);
          font-size: 1.2rem;
          line-height: 1;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          opacity: 0;
          transition: all 0.2s;
        }
        .entry-item:hover .delete-btn {
          opacity: 1;
        }
        .delete-btn:hover {
          background: var(--destructive);
          color: white;
        }
      `}</style>
    </div>
  );
}