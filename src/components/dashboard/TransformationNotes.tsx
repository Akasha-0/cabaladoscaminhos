"use client";

import { useState, useEffect, useCallback } from "react";

interface TransformationNote {
  id: string;
  title: string;
  before: string;
  after: string;
  category: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "transformation-notes";
const AVAILABLE_CATEGORIES = [
  "Espiritual",
  "Mental",
  "Emocional",
  "Físico",
  "Relacional",
  "Profissional",
  "Caminho Kabbalah",
  "Trilha Ifá",
];

export default function TransformationNotes() {
  const [notes, setNotes] = useState<TransformationNote[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [category, setCategory] = useState(AVAILABLE_CATEGORIES[0]);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setNotes(JSON.parse(stored));
      }
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true);
  }, []);

  const persist = useCallback((updated: TransformationNote[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const resetForm = () => {
    setTitle("");
    setBefore("");
    setAfter("");
    setCategory(AVAILABLE_CATEGORIES[0]);
    setTags([]);
    setTagInput("");
  };

  const openModal = () => {
    resetForm();
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    resetForm();
  };

  const addNote = () => {
    const trimmedTitle = title.trim();
    const trimmedBefore = before.trim();
    const trimmedAfter = after.trim();
    if (!trimmedTitle || !trimmedBefore || !trimmedAfter) return;

    const note: TransformationNote = {
      id: crypto.randomUUID(),
      title: trimmedTitle,
      before: trimmedBefore,
      after: trimmedAfter,
      category,
      tags: [...tags],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [note, ...notes];
    setNotes(updated);
    persist(updated);
    closeModal();
  };

  const updateNote = (id: string) => {
    const trimmedTitle = title.trim();
    const trimmedBefore = before.trim();
    const trimmedAfter = after.trim();
    if (!trimmedTitle || !trimmedBefore || !trimmedAfter) return;

    const updated = notes.map((n) =>
      n.id === id
        ? {
            ...n,
            title: trimmedTitle,
            before: trimmedBefore,
            after: trimmedAfter,
            category,
            tags: [...tags],
            updatedAt: new Date().toISOString(),
          }
        : n
    );
    setNotes(updated);
    persist(updated);
    closeModal();
  };

  const deleteNote = (id: string) => {
    const updated = notes.filter((n) => n.id !== id);
    setNotes(updated);
    persist(updated);
  };

  const editNote = (note: TransformationNote) => {
    setTitle(note.title);
    setBefore(note.before);
    setAfter(note.after);
    setCategory(note.category);
    setTags([...note.tags]);
    setTagInput("");
    setIsModalOpen(true);
  };

  const addTag = () => {
    const trimmed = tagInput.trim().toLowerCase();
    if (!trimmed || tags.includes(trimmed)) {
      setTagInput("");
      return;
    }
    setTags([...tags, trimmed]);
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag();
    }
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatDateTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCategoryColor = (cat: string) => {
    const colors: Record<string, string> = {
      Espiritual: "#9b59b6",
      Mental: "#3498db",
      Emocional: "#e91e63",
      Físico: "#2ecc71",
      Relacional: "#e67e22",
      Profissional: "#1abc9c",
      "Caminho Kabbalah": "#f1c40f",
      "Trilha Ifá": "#8e44ad",
    };
    return colors[cat] || "#6366f1";
  };

  const hasChanges = (note: TransformationNote) => {
    return (
      note.title === title &&
      note.before === before &&
      note.after === after &&
      note.category === category &&
      JSON.stringify([...note.tags].sort()) === JSON.stringify([...tags].sort())
    );
  };

  if (!isLoaded) {
    return (
      <div className="transformation-notes">
        <h2>Notas de Transformação</h2>
        <p>Carregando...</p>
      </div>
    );
  }

  return (
    <div className="transformation-notes">
      <div className="notes-header">
        <h2>Notas de Transformação</h2>
        <button onClick={openModal} className="add-btn">
          + Nova Nota
        </button>
      </div>

      <div className="notes-list">
        {notes.length === 0 ? (
          <div className="notes-empty">
            <p>Nenhuma nota de transformação ainda.</p>
            <p>Registre seu crescimento espiritual registrando estados antes e depois.</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-card-header">
                <h3>{note.title}</h3>
                <span
                  className="category-badge"
                  style={{ backgroundColor: getCategoryColor(note.category) }}
                >
                  {note.category}
                </span>
              </div>

              <div className="state-comparison">
                <div className="state before">
                  <span className="state-label">Antes</span>
                  <p>{note.before}</p>
                </div>
                <div className="state-arrow">→</div>
                <div className="state after">
                  <span className="state-label">Depois</span>
                  <p>{note.after}</p>
                </div>
              </div>

              {note.tags.length > 0 && (
                <div className="note-tags">
                  {note.tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="note-meta">
                <span>Criado em {formatDateTime(note.createdAt)}</span>
                {note.updatedAt !== note.createdAt && (
                  <span>Atualizado em {formatDateTime(note.updatedAt)}</span>
                )}
              </div>

              <div className="note-actions">
                <button onClick={() => editNote(note)} className="edit-btn">
                  Editar
                </button>
                <button onClick={() => deleteNote(note.id)} className="delete-btn">
                  Excluir
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{title ? "Editar Nota" : "Nova Nota de Transformação"}</h3>

            <div className="form-group">
              <label>Título</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Primeiro contato com a Árvore da Vida"
              />
            </div>

            <div className="form-group">
              <label>Categoria</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {AVAILABLE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Estado Antes</label>
              <textarea
                value={before}
                onChange={(e) => setBefore(e.target.value)}
                placeholder="Descreva seu estado, pensamento ou situação antes da transformação..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Estado Depois</label>
              <textarea
                value={after}
                onChange={(e) => setAfter(e.target.value)}
                placeholder="Descreva como você se sente, pensa ou age após a transformação..."
                rows={3}
              />
            </div>

            <div className="form-group">
              <label>Tags</label>
              <div className="tags-input-container">
                <input
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Adicione tags (pressione Enter)"
                />
                <button onClick={addTag} type="button">
                  +
                </button>
              </div>
              {tags.length > 0 && (
                <div className="tags-preview">
                  {tags.map((tag) => (
                    <span key={tag} className="tag">
                      #{tag}
                      <button onClick={() => removeTag(tag)} aria-label={`Remover tag ${tag}`}>
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="modal-actions">
              <button onClick={closeModal} className="cancel-btn">
                Cancelar
              </button>
              <button
                onClick={title ? updateNote : addNote}
                disabled={
                  !title.trim() ||
                  !before.trim() ||
                  !after.trim() ||
                  (title && hasChanges(notes.find((n) => n.title === title) || { id: "", title: "", before: "", after: "", category: "", tags: [], createdAt: "", updatedAt: "" }))
                }
                className="save-btn"
              >
                {title ? "Atualizar" : "Salvar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .transformation-notes {
          padding: 1.5rem;
        }
        .notes-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        h2 {
          margin: 0;
          color: var(--foreground);
        }
        .add-btn {
          padding: 0.5rem 1rem;
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }
        .notes-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .notes-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--muted-foreground);
        }
        .notes-empty p:first-child {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
        }
        .note-card {
          padding: 1.25rem;
          background: var(--card);
          border: 1px solid var(--border);
          border-radius: 12px;
        }
        .note-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 0.5rem;
        }
        .note-card-header h3 {
          margin: 0;
          color: var(--foreground);
          font-size: 1.1rem;
        }
        .category-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          color: white;
          font-size: 0.75rem;
          font-weight: 500;
          white-space: nowrap;
        }
        .state-comparison {
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          gap: 0.75rem;
          align-items: center;
          margin-bottom: 1rem;
        }
        .state {
          padding: 1rem;
          border-radius: 8px;
          background: var(--background);
        }
        .state.before {
          border-left: 3px solid #ef4444;
        }
        .state.after {
          border-left: 3px solid #22c55e;
        }
        .state-label {
          display: block;
          font-size: 0.7rem;
          text-transform: uppercase;
          font-weight: 600;
          margin-bottom: 0.35rem;
          color: var(--muted-foreground);
        }
        .state p {
          margin: 0;
          color: var(--foreground);
          font-size: 0.9rem;
          line-height: 1.5;
        }
        .state-arrow {
          color: var(--muted-foreground);
          font-size: 1.25rem;
        }
        .note-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .tag {
          padding: 1px 8px;
          background: var(--muted);
          color: var(--muted-foreground);
          border-radius: 12px;
          font-size: 0.75rem;
        }
        .tag button {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          padding: 0;
          margin-left: 4px;
          font-size: 1rem;
          line-height: 1;
        }
        .note-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          font-size: 0.75rem;
          color: var(--muted-foreground);
          margin-bottom: 1rem;
        }
        .note-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }
        .note-actions button {
          padding: 0.35rem 0.75rem;
          border-radius: 6px;
          font-size: 0.8rem;
          cursor: pointer;
          border: none;
        }
        .edit-btn {
          background: var(--muted);
          color: var(--foreground);
        }
        .delete-btn {
          background: transparent;
          color: #ef4444;
        }
        .modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }
        .modal-content {
          background: var(--background);
          border-radius: 16px;
          padding: 1.5rem;
          max-width: 550px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
        }
        .modal-content h3 {
          margin: 0 0 1.25rem;
          color: var(--foreground);
        }
        .form-group {
          margin-bottom: 1rem;
        }
        .form-group label {
          display: block;
          margin-bottom: 0.35rem;
          font-size: 0.85rem;
          font-weight: 500;
          color: var(--foreground);
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 0.65rem;
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--card);
          color: var(--foreground);
          font-family: inherit;
          font-size: 0.9rem;
          box-sizing: border-box;
        }
        .form-group textarea {
          resize: vertical;
        }
        .tags-input-container {
          display: flex;
          gap: 0.5rem;
        }
        .tags-input-container input {
          flex: 1;
        }
        .tags-input-container button {
          padding: 0.65rem 1rem;
          background: var(--muted);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
        }
        .tags-preview {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .tags-preview .tag {
          background: var(--muted);
          color: var(--foreground);
        }
        .modal-actions {
          display: flex;
          gap: 0.75rem;
          justify-content: flex-end;
          margin-top: 1.5rem;
        }
        .cancel-btn {
          padding: 0.6rem 1.2rem;
          background: var(--muted);
          color: var(--foreground);
          border: 1px solid var(--border);
          border-radius: 8px;
          cursor: pointer;
        }
        .save-btn {
          padding: 0.6rem 1.2rem;
          background: var(--primary);
          color: var(--primary-foreground);
          border: none;
          border-radius: 8px;
          cursor: pointer;
        }
        .save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}
