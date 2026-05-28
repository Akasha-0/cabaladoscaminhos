"use client";

import { useState, useEffect, useCallback } from "react";

interface TransformationEntry {
  id: string;
  before: string;
  after: string;
  reflection: string;
  createdAt: string;
  tags: string[];
}

const STORAGE_KEY = "transformation-journal-entries";

export default function TransformationJournal() {
  const [entries, setEntries] = useState<TransformationEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [before, setBefore] = useState("");
  const [after, setAfter] = useState("");
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
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

  const persist = useCallback((updated: TransformationEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const addEntry = () => {
    if (!before.trim() || !after.trim()) return;
    
    const newEntry: TransformationEntry = {
      id: Date.now().toString(),
      before: before.trim(),
      after: after.trim(),
      reflection: reflection.trim(),
      createdAt: new Date().toISOString(),
      tags: [...tags],
    };
    
    const updated = [newEntry, ...entries];
    setEntries(updated);
    persist(updated);
    setBefore("");
    setAfter("");
    setReflection("");
    setTags([]);
    setTagInput("");
    setIsModalOpen(false);
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((e) => e.id !== id);
    setEntries(updated);
    persist(updated);
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  };

  const removeTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const formatDate = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (iso: string) => {
    const now = new Date();
    const date = new Date(iso);
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Hoje";
    if (diffDays === 1) return "Ontem";
    if (diffDays < 7) return `${diffDays} dias atrás`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} semanas atrás`;
    return `${Math.floor(diffDays / 30)} meses atrás`;
  };

  if (!isLoaded) {
    return (
      <div className="transformation-journal">
        <div className="journal-loading">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="transformation-journal">
      <div className="journal-header">
        <h3 className="journal-title">Diário de Transformação</h3>
        <button 
          className="journal-add-btn"
          onClick={() => setIsModalOpen(true)}
        >
          + Nova Transformação
        </button>
      </div>

      {entries.length === 0 ? (
        <div className="journal-empty">
          <p>Nenhuma transformação registrada ainda.</p>
          <p>Comece a documentar sua jornada de crescimento pessoal.</p>
          <button 
            className="journal-empty-btn"
            onClick={() => setIsModalOpen(true)}
          >
            Registrar Primeira Transformação
          </button>
        </div>
      ) : (
        <div className="journal-timeline">
          <div className="timeline-line" />
          {entries.map((entry, index) => (
            <div key={entry.id} className="timeline-entry">
              <div className="timeline-marker">
                <div className="timeline-dot" />
                {index < entries.length - 1 && <div className="timeline-connector" />}
              </div>
              <div className="timeline-content">
                <div className="timeline-date">
                  <span className="timeline-relative">{formatRelativeTime(entry.createdAt)}</span>
                  <span className="timeline-absolute">{formatDate(entry.createdAt)}</span>
                </div>
                
                <div className="transformation-card">
                  <div className="transformation-before">
                    <span className="transformation-label">Antes</span>
                    <p className="transformation-text">{entry.before}</p>
                  </div>
                  
                  <div className="transformation-arrow">→</div>
                  
                  <div className="transformation-after">
                    <span className="transformation-label">Depois</span>
                    <p className="transformation-text">{entry.after}</p>
                  </div>
                  
                  {entry.reflection && (
                    <div className="transformation-reflection">
                      <span className="transformation-label">Reflexão</span>
                      <p className="transformation-text">{entry.reflection}</p>
                    </div>
                  )}
                  
                  {entry.tags.length > 0 && (
                    <div className="transformation-tags">
                      {entry.tags.map((tag) => (
                        <span key={tag} className="transformation-tag">{tag}</span>
                      ))}
                    </div>
                  )}
                  
                  <button 
                    className="transformation-delete"
                    onClick={() => deleteEntry(entry.id)}
                    aria-label="Excluir entrada"
                  >
                    ×
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="journal-modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="journal-modal" onClick={(e) => e.stopPropagation()}>
            <div className="journal-modal-header">
              <h3>Nova Transformação</h3>
              <button 
                className="journal-modal-close"
                onClick={() => setIsModalOpen(false)}
              >
                ×
              </button>
            </div>
            
            <div className="journal-modal-body">
              <div className="journal-field">
                <label htmlFor="before">Estado Anterior</label>
                <textarea
                  id="before"
                  value={before}
                  onChange={(e) => setBefore(e.target.value)}
                  placeholder="Descreva sua situação, pensamento ou sentimento antes..."
                  rows={3}
                />
              </div>
              
              <div className="journal-field">
                <label htmlFor="after">Estado Atual</label>
                <textarea
                  id="after"
                  value={after}
                  onChange={(e) => setAfter(e.target.value)}
                  placeholder="Descreva como você está agora, após a transformação..."
                  rows={3}
                />
              </div>
              
              <div className="journal-field">
                <label htmlFor="reflection">Reflexão (opcional)</label>
                <textarea
                  id="reflection"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  placeholder="O que você aprendeu? O que foi significativo nessa transformação?"
                  rows={3}
                />
              </div>
              
              <div className="journal-field">
                <label>Tags (opcional)</label>
                <div className="journal-tags-input">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Adicionar tag e pressionar Enter"
                  />
                  <button type="button" onClick={addTag}>+</button>
                </div>
                {tags.length > 0 && (
                  <div className="journal-tags-list">
                    {tags.map((tag) => (
                      <span key={tag} className="journal-tag">
                        {tag}
                        <button 
                          type="button"
                          onClick={() => removeTag(tag)}
                          aria-label={`Remover tag ${tag}`}
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="journal-modal-footer">
              <button 
                className="journal-cancel-btn"
                onClick={() => setIsModalOpen(false)}
              >
                Cancelar
              </button>
              <button 
                className="journal-save-btn"
                onClick={addEntry}
                disabled={!before.trim() || !after.trim()}
              >
                Salvar Transformação
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .transformation-journal {
          padding: 1rem;
          height: 100%;
          overflow-y: auto;
        }

        .journal-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          height: 200px;
          color: var(--text-secondary, #666);
        }

        .journal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .journal-title {
          font-size: 1.25rem;
          font-weight: 600;
          color: var(--text-primary, #1a1a1a);
          margin: 0;
        }

        .journal-add-btn {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .journal-add-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .journal-empty {
          text-align: center;
          padding: 3rem 1rem;
          color: var(--text-secondary, #666);
        }

        .journal-empty p {
          margin: 0.5rem 0;
        }

        .journal-empty-btn {
          margin-top: 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .journal-timeline {
          position: relative;
          padding-left: 2rem;
        }

        .timeline-line {
          position: absolute;
          left: 6px;
          top: 0;
          bottom: 0;
          width: 2px;
          background: linear-gradient(180deg, #667eea 0%, #764ba2 100%);
          border-radius: 1px;
        }

        .timeline-entry {
          position: relative;
          margin-bottom: 2rem;
        }

        .timeline-marker {
          position: absolute;
          left: -2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .timeline-dot {
          width: 14px;
          height: 14px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 50%;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
          z-index: 1;
        }

        .timeline-connector {
          width: 2px;
          flex: 1;
          background: linear-gradient(180deg, #667eea 0%, #ddd 100%);
          min-height: 20px;
        }

        .timeline-content {
          background: white;
          border-radius: 12px;
          padding: 1rem;
          box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
          position: relative;
        }

        .timeline-date {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .timeline-relative {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-weight: 500;
        }

        .timeline-absolute {
          color: var(--text-secondary, #666);
        }

        .transformation-card {
          position: relative;
        }

        .transformation-before,
        .transformation-after,
        .transformation-reflection {
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 0.5rem;
        }

        .transformation-before {
          background: linear-gradient(135deg, rgba(255, 107, 107, 0.1) 0%, rgba(255, 107, 107, 0.05) 100%);
          border-left: 3px solid #ff6b6b;
        }

        .transformation-after {
          background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(102, 126, 234, 0.05) 100%);
          border-left: 3px solid #667eea;
        }

        .transformation-reflection {
          background: linear-gradient(135deg, rgba(118, 75, 162, 0.1) 0%, rgba(118, 75, 162, 0.05) 100%);
          border-left: 3px solid #764ba2;
          font-style: italic;
        }

        .transformation-label {
          display: block;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.25rem;
        }

        .transformation-before .transformation-label {
          color: #ff6b6b;
        }

        .transformation-after .transformation-label {
          color: #667eea;
        }

        .transformation-reflection .transformation-label {
          color: #764ba2;
        }

        .transformation-text {
          margin: 0;
          color: var(--text-primary, #1a1a1a);
          line-height: 1.5;
        }

        .transformation-arrow {
          text-align: center;
          color: var(--text-secondary, #666);
          font-size: 1.25rem;
          margin: 0.25rem 0;
        }

        .transformation-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .transformation-tag {
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .transformation-delete {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          width: 24px;
          height: 24px;
          border: none;
          background: rgba(255, 107, 107, 0.1);
          color: #ff6b6b;
          border-radius: 50%;
          cursor: pointer;
          font-size: 1rem;
          line-height: 1;
          opacity: 0;
          transition: opacity 0.2s;
        }

        .transformation-card:hover .transformation-delete {
          opacity: 1;
        }

        .transformation-delete:hover {
          background: rgba(255, 107, 107, 0.2);
        }

        .journal-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
        }

        .journal-modal {
          background: white;
          border-radius: 16px;
          width: 100%;
          max-width: 500px;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);
        }

        .journal-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-bottom: 1px solid var(--border-color, #eee);
        }

        .journal-modal-header h3 {
          margin: 0;
          font-size: 1.125rem;
          font-weight: 600;
        }

        .journal-modal-close {
          width: 32px;
          height: 32px;
          border: none;
          background: transparent;
          font-size: 1.5rem;
          cursor: pointer;
          color: var(--text-secondary, #666);
          border-radius: 50%;
          transition: background 0.2s;
        }

        .journal-modal-close:hover {
          background: var(--bg-secondary, #f5f5f5);
        }

        .journal-modal-body {
          padding: 1.25rem;
        }

        .journal-field {
          margin-bottom: 1.25rem;
        }

        .journal-field label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--text-primary, #1a1a1a);
        }

        .journal-field textarea,
        .journal-field input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 8px;
          font-size: 0.9375rem;
          font-family: inherit;
          resize: vertical;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .journal-field textarea:focus,
        .journal-field input:focus {
          outline: none;
          border-color: #667eea;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .journal-tags-input {
          display: flex;
          gap: 0.5rem;
        }

        .journal-tags-input input {
          flex: 1;
        }

        .journal-tags-input button {
          padding: 0.75rem 1rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
        }

        .journal-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.75rem;
        }

        .journal-tag {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.875rem;
        }

        .journal-tag button {
          border: none;
          background: transparent;
          color: #667eea;
          cursor: pointer;
          padding: 0;
          font-size: 1rem;
          line-height: 1;
        }

        .journal-modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1.25rem;
          border-top: 1px solid var(--border-color, #eee);
        }

        .journal-cancel-btn {
          flex: 1;
          padding: 0.75rem;
          background: transparent;
          border: 1px solid var(--border-color, #ddd);
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          color: var(--text-secondary, #666);
          transition: background 0.2s;
        }

        .journal-cancel-btn:hover {
          background: var(--bg-secondary, #f5f5f5);
        }

        .journal-save-btn {
          flex: 2;
          padding: 0.75rem;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 500;
          transition: transform 0.2s, box-shadow 0.2s, opacity 0.2s;
        }

        .journal-save-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }

        .journal-save-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}