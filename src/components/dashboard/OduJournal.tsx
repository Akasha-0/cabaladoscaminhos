"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import {
  BookOpen,
  Plus,
  Trash2,
  Calendar,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Eye,
  Heart,
  Star,
  Moon,
  Sun,
  Flame,
  Shield,
  Save,
  Edit3,
  X,
} from "lucide-react";

interface OduReading {
  id: string;
  oduName: string;
  oduIcon: string;
  data: string;
  pergunta: string;
  reflexao: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface OduJournalEntry {
  id: string;
  reading: OduReading;
  reflexaoPessoal: string;
  acao: string;
  createdAt: string;
  updatedAt: string;
}

const STORAGE_KEY = "odu-journal-entries";

const ODUS = [
  { name: "Ogunda", icon: "Shield", element: "Fogo" },
  { name: "Ejioko", icon: "Star", element: "Aether" },
  { name: "Orossi", icon: "Sun", element: "Terra" },
  { name: "Irosun", icon: "Eye", element: "Agua" },
  { name: "Oxum", icon: "Moon", element: "Agua" },
  { name: "Xango", icon: "Flame", element: "Fogo" },
  { name: "Obaluaiê", icon: "Sparkles", element: "Terra" },
  { name: "Ori", icon: "Heart", element: "Aether" },
];

const ICON_MAP: Record<string, React.ReactNode> = {
  Shield: <Shield className="w-4 h-4" />,
  Star: <Star className="w-4 h-4" />,
  Sun: <Sun className="w-4 h-4" />,
  Eye: <Eye className="w-4 h-4" />,
  Moon: <Moon className="w-4 h-4" />,
  Flame: <Flame className="w-4 h-4" />,
  Sparkles: <Sparkles className="w-4 h-4" />,
  Heart: <Heart className="w-4 h-4" />,
};

export default function OduJournal() {
  const [entries, setEntries] = useState<OduJournalEntry[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state for new entry
  const [selectedOdu, setSelectedOdu] = useState(ODUS[0]);
  const [pergunta, setPergunta] = useState("");
  const [reflexaoPessoal, setReflexaoPessoal] = useState("");
  const [acao, setAcao] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

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

  const persist = useCallback((updated: OduJournalEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {
      // ignore storage errors
    }
  }, []);

  const addEntry = () => {
    if (!pergunta.trim()) return;

    const now = new Date().toISOString();
    const entry: OduJournalEntry = {
      id: `odu-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      reading: {
        id: `reading-${Date.now()}`,
        oduName: selectedOdu.name,
        oduIcon: selectedOdu.icon,
        data: now,
        pergunta: pergunta.trim(),
        reflexao: "",
        tags: tags,
        createdAt: now,
        updatedAt: now,
      },
      reflexaoPessoal: reflexaoPessoal.trim(),
      acao: acao.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [entry, ...entries];
    setEntries(updated);
    persist(updated);
    resetForm();
  };

  const updateEntry = (id: string) => {
    const updated = entries.map((entry) =>
      entry.id === id
        ? {
            ...entry,
            reflexaoPessoal,
            acao,
            tags,
            updatedAt: new Date().toISOString(),
          }
        : entry
    );
    setEntries(updated);
    persist(updated);
    setEditingId(null);
    resetForm();
  };

  const deleteEntry = (id: string) => {
    const updated = entries.filter((entry) => entry.id !== id);
    setEntries(updated);
    persist(updated);
  };

  const startEdit = (entry: OduJournalEntry) => {
    setEditingId(entry.id);
    setReflexaoPessoal(entry.reflexaoPessoal);
    setAcao(entry.acao);
    setTags(entry.reading.tags);
  };

  const cancelEdit = () => {
    setEditingId(null);
    resetForm();
  };

  const resetForm = () => {
    setIsModalOpen(false);
    setSelectedOdu(ODUS[0]);
    setPergunta("");
    setReflexaoPessoal("");
    setAcao("");
    setTags([]);
    setTagInput("");
  };

  const addTag = () => {
    const trimmed = tagInput.trim();
    if (trimmed && !tags.includes(trimmed)) {
      setTags([...tags, trimmed]);
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
      month: "2-digit",
      year: "numeric",
    });
  };

  const formatTime = (iso: string) => {
    const date = new Date(iso);
    return date.toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatRelativeTime = (iso: string) => {
    const date = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "agora";
    if (diffMins < 60) return `${diffMins}min atrás`;
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return formatDate(iso);
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (!isLoaded) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            Diário dos Odu
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-20 bg-muted rounded-lg" />
            <div className="h-20 bg-muted rounded-lg" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="odu-journal w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              Diário dos Odu
            </CardTitle>
            <CardDescription>
              Registre suas consultas e reflexões
            </CardDescription>
          </div>
          <Button
            onClick={() => setIsModalOpen(true)}
            className="gap-2"
            disabled={isModalOpen}
          >
            <Plus className="w-4 h-4" />
            Nova Consulta
          </Button>
        </div>
      </CardHeader>

      {isModalOpen && (
        <CardContent className="border-t pt-4 space-y-4">
          <div className="space-y-3">
            <label className="text-sm font-medium">Odu</label>
            <div className="grid grid-cols-4 gap-2">
              {ODUS.map((odu) => (
                <button
                  key={odu.name}
                  onClick={() => setSelectedOdu(odu)}
                  className={`p-3 rounded-lg border text-center transition-all ${
                    selectedOdu.name === odu.name
                      ? "border-primary bg-primary/10"
                      : "border-border hover:border-primary/50"
                  }`}
                >
                  <div className="flex justify-center mb-1">
                    {ICON_MAP[odu.icon]}
                  </div>
                  <span className="text-xs">{odu.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Pergunta ou Intenção</label>
            <Textarea
              value={pergunta}
              onChange={(e) => setPergunta(e.target.value)}
              placeholder="Qual é a sua pergunta ou intenção para esta consulta?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Reflexão Pessoal</label>
            <Textarea
              value={reflexaoPessoal}
              onChange={(e) => setReflexaoPessoal(e.target.value)}
              placeholder="Como esta leitura ressoa com você?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Ação ou Compromisso</label>
            <Textarea
              value={acao}
              onChange={(e) => setAcao(e.target.value)}
              placeholder="Que ação você compromete-se a tomar?"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addTag();
                  }
                }}
                placeholder="Adicionar tag..."
              />
              <Button onClick={addTag} variant="secondary" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="gap-1 cursor-pointer"
                    onClick={() => removeTag(tag)}
                  >
                    {tag}
                    <X className="w-3 h-3" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-2 justify-end pt-2">
            <Button variant="ghost" onClick={resetForm}>
              Cancelar
            </Button>
            <Button onClick={addEntry} disabled={!pergunta.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Salvar
            </Button>
          </div>
        </CardContent>
      )}

      <CardContent>
        {entries.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium mb-2">Nenhum registro ainda</p>
            <p className="text-sm">
              Clique em &quot;Nova Consulta&quot; para começar seu diário
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-3">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="border rounded-lg overflow-hidden bg-gradient-to-br from-card to-card/80"
                >
                  <button
                    onClick={() => toggleExpand(entry.id)}
                    className="w-full p-4 text-left hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div className="p-2 rounded-lg bg-primary/10 text-primary">
                          {ICON_MAP[entry.reading.oduIcon]}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-semibold">
                              {entry.reading.oduName}
                            </span>
                            {entry.reading.tags.map((tag) => (
                              <Badge key={tag} variant="outline" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {entry.reading.pergunta}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(entry.createdAt)}
                        </span>
                        {expandedId === entry.id ? (
                          <ChevronUp className="w-4 h-4 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  </button>

                  {expandedId === entry.id && (
                    <div className="px-4 pb-4 pt-0 space-y-4 border-t">
                      <div className="pt-4 space-y-3">
                        <div>
                          <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                            <MessageSquare className="w-4 h-4" />
                            Reflexão Pessoal
                          </h4>
                          {editingId === entry.id ? (
                            <div className="space-y-2 mt-2">
                              <Textarea
                                value={reflexaoPessoal}
                                onChange={(e) => setReflexaoPessoal(e.target.value)}
                                rows={3}
                                placeholder="Sua reflexão..."
                              />
                              <div>
                                <label className="text-sm font-medium">
                                  Ação ou Compromisso
                                </label>
                                <Textarea
                                  value={acao}
                                  onChange={(e) => setAcao(e.target.value)}
                                  rows={2}
                                  className="mt-1"
                                  placeholder="Sua ação..."
                                />
                              </div>
                              <div className="flex gap-2">
                                <Input
                                  value={tagInput}
                                  onChange={(e) => setTagInput(e.target.value)}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      e.preventDefault();
                                      addTag();
                                    }
                                  }}
                                  placeholder="Adicionar tag..."
                                  className="flex-1"
                                />
                                <Button onClick={addTag} variant="secondary" size="sm">
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {tags.length > 0 && (
                                <div className="flex flex-wrap gap-1">
                                  {tags.map((tag) => (
                                    <Badge
                                      key={tag}
                                      variant="secondary"
                                      className="gap-1 cursor-pointer"
                                      onClick={() => removeTag(tag)}
                                    >
                                      {tag}
                                      <X className="w-3 h-3" />
                                    </Badge>
                                  ))}
                                </div>
                              )}
                              <div className="flex gap-2 justify-end">
                                <Button variant="ghost" size="sm" onClick={cancelEdit}>
                                  Cancelar
                                </Button>
                                <Button size="sm" onClick={() => updateEntry(entry.id)}>
                                  <Save className="w-4 h-4 mr-1" />
                                  Salvar
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <>
                              <p className="mt-1 text-sm">
                                {entry.reflexaoPessoal || (
                                  <span className="text-muted-foreground italic">
                                    Sem reflexão registrada
                                  </span>
                                )}
                              </p>
                              {entry.acao && (
                                <div className="mt-3">
                                  <h4 className="text-sm font-medium flex items-center gap-2 text-muted-foreground">
                                    <Sparkles className="w-4 h-4" />
                                    Ação
                                  </h4>
                                  <p className="mt-1 text-sm">{entry.acao}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Calendar className="w-3 h-3" />
                            {formatDate(entry.createdAt)} às {formatTime(entry.createdAt)}
                          </div>
                          <div className="flex gap-1">
                            {editingId !== entry.id && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEdit(entry)}
                              >
                                <Edit3 className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => deleteEntry(entry.id)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
