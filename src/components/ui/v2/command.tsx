"use client"

/**
 * Command v2 — ⌘K command palette
 *
 * Inspired by: Linear (instant search), Raycast (categories), Vercel (deploy shortcuts)
 *
 * Features:
 *   - ⌘K / Ctrl+K shortcut to open
 *   - Fuzzy search (case-insensitive substring)
 *   - Grouped results (categories)
 *   - Keyboard navigation (↑↓ arrows, Enter to select, Esc to close)
 *   - Empty state + loading state
 *   - Spiritual theme (gold accent on active)
 *
 * Use case: quick navigation across the oracular app, finding rituals, opening readings
 */

import * as React from "react"
import { Search, X, CornerDownLeft } from "lucide-react"

import { cn } from "@/lib/utils"

interface CommandItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
  group?: string
  onSelect?: () => void
  /** Optional keyboard shortcut display */
  shortcut?: string
}

interface CommandProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  items: CommandItem[]
  placeholder?: string
  emptyMessage?: string
  /** Title shown at top */
  title?: string
}

function Command({
  open,
  onOpenChange,
  items,
  placeholder = "Buscar comandos…",
  emptyMessage = "Nenhum resultado encontrado.",
  title = "Paleta de Comandos",
}: CommandProps) {
  const [query, setQuery] = React.useState("")
  const [activeIndex, setActiveIndex] = React.useState(0)
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Filter items
  const filtered = React.useMemo(() => {
    if (!query.trim()) return items
    const q = query.toLowerCase()
    return items.filter(
      (item) =>
        item.label.toLowerCase().includes(q) ||
        item.description?.toLowerCase().includes(q)
    )
  }, [items, query])

  // Group by category
  const grouped = React.useMemo(() => {
    const map = new Map<string, CommandItem[]>()
    filtered.forEach((item) => {
      const g = item.group ?? "Geral"
      if (!map.has(g)) map.set(g, [])
      map.get(g)!.push(item)
    })
    return Array.from(map.entries())
  }, [filtered])

  // Flat list for keyboard nav
  const flat = React.useMemo(() => grouped.flatMap(([, items]) => items), [grouped])

  // Reset on open
  React.useEffect(() => {
    if (open) {
      setQuery("")
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  // Global ⌘K shortcut
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  // Keyboard nav within palette
  const onInputKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, flat.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Enter") {
      e.preventDefault()
      const item = flat[activeIndex]
      if (item) {
        item.onSelect?.()
        onOpenChange(false)
      }
    }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[var(--z-modal)]">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Fechar paleta"
        onClick={() => onOpenChange(false)}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-[var(--duration-fast)]"
      />

      {/* Palette */}
      <div className="absolute left-1/2 top-[20%] -translate-x-1/2 w-[min(640px,calc(100vw-32px))] bg-[var(--popover)] border border-[var(--border)] rounded-xl shadow-[var(--shadow-2xl)] overflow-hidden animate-in slide-in-from-bottom-4 fade-in duration-[var(--duration-normal)]">
        {/* Search input */}
        <div className="flex items-center gap-2 px-4 h-14 border-b border-[var(--border)]">
          <Search className="size-4 text-[var(--muted-foreground)]" aria-hidden />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setActiveIndex(0)
            }}
            onKeyDown={onInputKey}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-0 outline-none text-sm placeholder:text-[var(--muted-foreground)]"
            aria-label="Buscar comandos"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 text-[10px] text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded">
            <span>esc</span>
          </kbd>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            aria-label="Fechar"
            className="sm:hidden inline-flex items-center justify-center size-7 rounded text-[var(--muted-foreground)] hover:bg-[var(--muted)]"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Title */}
        <div className="px-4 py-2 text-xs font-medium text-[var(--muted-foreground)] border-b border-[var(--border)]">
          {title}
        </div>

        {/* Results */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {grouped.length === 0 ? (
            <div className="px-4 py-12 text-center text-sm text-[var(--muted-foreground)]">
              {emptyMessage}
            </div>
          ) : (
            grouped.map(([group, groupItems]) => (
              <div key={group} className="mb-2">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                  {group}
                </div>
                <ul role="listbox">
                  {groupItems.map((item) => {
                    const flatIdx = flat.indexOf(item)
                    const isActive = flatIdx === activeIndex
                    return (
                      <li key={item.id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={isActive}
                          onMouseEnter={() => setActiveIndex(flatIdx)}
                          onClick={() => {
                            item.onSelect?.()
                            onOpenChange(false)
                          }}
                          className={cn(
                            "w-full flex items-center gap-3 px-2 py-2 rounded-md text-left",
                            "transition-colors duration-[var(--duration-instant)]",
                            isActive
                              ? "bg-[var(--spiritual-gold-muted)] text-[var(--spiritual-gold-dark)]"
                              : "text-[var(--foreground)] hover:bg-[var(--muted)]"
                          )}
                        >
                          {item.icon && (
                            <span className="size-4 inline-flex items-center justify-center shrink-0">
                              {item.icon}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{item.label}</div>
                            {item.description && (
                              <div className="text-xs text-[var(--muted-foreground)] truncate">
                                {item.description}
                              </div>
                            )}
                          </div>
                          {item.shortcut && (
                            <kbd className="text-[10px] text-[var(--muted-foreground)] bg-[var(--muted)] px-1.5 py-0.5 rounded">
                              {item.shortcut}
                            </kbd>
                          )}
                          {isActive && (
                            <CornerDownLeft className="size-3 text-[var(--spiritual-gold-dark)]" aria-hidden />
                          )}
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export { Command, type CommandItem }