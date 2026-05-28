"use client";

import { useState, useEffect, useCallback } from "react";

interface GratitudeEntry {
  id: string;
  text: string;
  createdAt: string;
}

const STORAGE_KEY = "gratitude-entries";

export default function GratitudeJournal() {
  const [entries, setEntries] = useState<GratitudeEntry[]>([]);
  const [newEntry, setNewEntry] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

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

  const persist = useCallback((updated: GratitudeEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const addEntry = () => {
    const trimmed = newEntry.trim();
    if (!trimmed) return;

    const entry: GratitudeEntry = {
      id: crypto.randomUUID(),
      text: trimmed,
      createdAt: new Date().toISOString(),
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    persist(updated);
    setNewEntry("");
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    persist(updated);
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (!isLoaded) {
    return (
      <div className="gratitude-journal">
        <h2>Diário de Gratidão</h2>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="gratitude-journal">
      <h2>Diário de Gratidão</h2>

      <div className="gratitude-form">
        <textarea
          value={newEntry}
          onChange={(e) => setNewEntry(e.target.value)}
          placeholder="O que você é grato hoje?"
          rows={3}
        />
        <button onClick={addEntry} disabled={!newEntry.trim()}>
          Registrar
        </button>
      </div>

      <div className="gratitude-history">
        <h3>Histórico</h3>
        {entries.length === 0 ? (
          <p className="gratitude-empty">Nenhum registro ainda.</p>
        ) : (
          <ul>
            {entries.map((entry) => (
              <li key={entry.id}>
                <p>{entry.text}</p>
                <span>{formatDate(entry.createdAt)}</span>
                <button
                  onClick={() => deleteEntry(entry.id)}
                  className="delete-btn"
                  aria-label="Excluir"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .gratitude-journal {
          padding: 1.5rem;
          max-width: 600px;
        }
        h2 {
          margin-bottom: 1rem;
          color: var(--foreground);
        }
        .gratitude-form {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }
        textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          resize: vertical;
          font-family: inherit;
          background: var(--background);
          color: var(--foreground);
        }
        button {
          align-self: flex-end;
          padding: 0.5rem 1rem;
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .gratitude-history h3 {
          margin-bottom: 0.75rem;
        }
        ul {
          list-style: none;
          padding: 0;
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        li {
          padding: 1rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 8px;
          position: relative;
        }
        li p {
          margin: 0 0 0.5rem;
          color: var(--foreground);
        }
        li span {
          font-size: 0.8rem;
          color: var(--muted-foreground);
        }
        .delete-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.25rem 0.5rem;
          background: transparent;
          color: var(--muted-foreground);
          font-size: 1.2rem;
          line-height: 1;
        }
        .gratitude-empty {
          color: var(--muted-foreground);
        }
      `}</style>
    </div>
  );
}