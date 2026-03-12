'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Pin, Pencil, Trash2, NotebookPen, ChevronDown,
  Search, X, Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { createClient } from '@/lib/supabase/client';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle,
} from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/lib/hooks/use-toast';
import type { Subject, Topic, Note } from '@/types/database';

// ─── Types ────────────────────────────────────────────────────────────────────

type FilterState =
  | { type: 'all' }
  | { type: 'general' }
  | { type: 'subject'; id: string }
  | { type: 'topic'; subjectId: string; id: string };

// ─── Utils ────────────────────────────────────────────────────────────────────

type TFn = (key: string, values?: Record<string, string | number>) => string;

function relativeDate(iso: string, t: TFn, locale: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 2) return t('justNow');
  if (hours < 1) return t('minutesAgo', { n: mins });
  if (days < 1) return t('hoursAgo', { n: hours });
  if (days < 7) return t('daysAgo', { n: days });
  return new Date(iso).toLocaleDateString(locale, { day: 'numeric', month: 'long', year: 'numeric' });
}

function matchesFilter(note: Note, filter: FilterState): boolean {
  if (filter.type === 'all') return true;
  if (filter.type === 'general') return !note.subject_id;
  if (filter.type === 'subject') return note.subject_id === filter.id;
  return note.subject_id === filter.subjectId && note.topic_id === filter.id;
}

function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
}

// ─── Filter Panel ─────────────────────────────────────────────────────────────

function FilterPanel({
  filter, setFilter, notes, subjects, topics,
}: {
  filter: FilterState;
  setFilter: (f: FilterState) => void;
  notes: Note[];
  subjects: Subject[];
  topics: Topic[];
}) {
  const t = useTranslations('notes');
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggle = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const count = (fn: (n: Note) => boolean) => notes.filter(fn).length;

  const isActive = (f: FilterState) => JSON.stringify(filter) === JSON.stringify(f);

  return (
    <div className="w-56 shrink-0 flex flex-col gap-0.5 pr-2">
      <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60 px-3 mb-2">
        {t('filter')}
      </p>

      {/* All */}
      <FilterItem
        label={t('all')}
        count={count(() => true)}
        active={isActive({ type: 'all' })}
        icon={<Layers className="h-3.5 w-3.5" />}
        onClick={() => setFilter({ type: 'all' })}
      />

      {/* General */}
      <FilterItem
        label={t('general')}
        count={count((n) => !n.subject_id)}
        active={isActive({ type: 'general' })}
        icon={<NotebookPen className="h-3.5 w-3.5" />}
        onClick={() => setFilter({ type: 'general' })}
      />

      {subjects.length > 0 && (
        <div className="my-2 h-px bg-border/30 mx-3" />
      )}

      {/* Subjects */}
      {subjects.map((s) => {
        const subjectNotes = notes.filter((n) => n.subject_id === s.id);
        const subjectTopics = topics.filter((t) => t.subject_id === s.id && subjectNotes.some((n) => n.topic_id === t.id));
        const isExpanded = expanded.has(s.id);
        const subjectActive = isActive({ type: 'subject', id: s.id });

        return (
          <div key={s.id}>
            <button
              onClick={() => {
                setFilter({ type: 'subject', id: s.id });
                if (subjectTopics.length > 0) toggle(s.id);
              }}
              className={cn(
                'w-full flex items-center gap-2.5 px-3 py-1.5 rounded-lg text-left transition-all text-sm',
                subjectActive
                  ? 'bg-primary/[0.08] text-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
              <span className="flex-1 font-medium truncate text-xs">{s.name}</span>
              <span className="text-[10px] tabular-nums opacity-60">{subjectNotes.length}</span>
              {subjectTopics.length > 0 && (
                <ChevronDown
                  className={cn('h-3 w-3 transition-transform shrink-0', isExpanded && 'rotate-180')}
                />
              )}
            </button>

            {/* Topics under subject */}
            <AnimatePresence>
              {isExpanded && subjectTopics.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden pl-4"
                >
                  {subjectTopics.map((t) => (
                    <FilterItem
                      key={t.id}
                      label={t.name}
                      count={notes.filter((n) => n.topic_id === t.id).length}
                      active={isActive({ type: 'topic', subjectId: s.id, id: t.id })}
                      onClick={() => setFilter({ type: 'topic', subjectId: s.id, id: t.id })}
                      small
                    />
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function FilterItem({
  label, count, active, icon, onClick, small = false,
}: {
  label: string;
  count: number;
  active: boolean;
  icon?: React.ReactNode;
  onClick: () => void;
  small?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2.5 px-3 rounded-lg text-left transition-all',
        small ? 'py-1' : 'py-1.5',
        active
          ? 'bg-primary/[0.08] text-foreground'
          : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
      )}
    >
      {icon && <span className="shrink-0 opacity-60">{icon}</span>}
      <span className={cn('flex-1 font-medium truncate', small ? 'text-[11px]' : 'text-xs')}>
        {label}
      </span>
      {count > 0 && (
        <span
          className={cn(
            'text-[10px] tabular-nums px-1.5 py-0.5 rounded-md font-medium',
            active ? 'bg-primary/15 text-primary' : 'bg-muted text-muted-foreground',
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────

function NoteCard({
  note, subject, topic, onEdit, onDelete, onTogglePin,
}: {
  note: Note;
  subject?: Subject;
  topic?: Topic;
  onEdit: () => void;
  onDelete: () => void;
  onTogglePin: () => void;
}) {
  const t = useTranslations('notes');
  const locale = useLocale();
  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      transition={{ duration: 0.18 }}
      className={cn(
        'group relative flex flex-col rounded-2xl border bg-card overflow-hidden transition-all duration-200 cursor-pointer',
        note.is_pinned
          ? 'border-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.15)]'
          : 'border-border/40 hover:border-border/70 hover:shadow-md',
      )}
      onClick={onEdit}
      style={
        subject
          ? { background: `linear-gradient(160deg, ${subject.color}08 0%, transparent 50%)` }
          : undefined
      }
    >
      {/* Colored top strip */}
      {subject && (
        <div className="h-[2px] w-full shrink-0" style={{ backgroundColor: subject.color }} />
      )}
      {!subject && note.is_pinned && (
        <div className="h-[2px] w-full shrink-0 bg-amber-500/60" />
      )}

      <div className="flex flex-col flex-1 p-4 gap-2.5">
        {/* Top row: badges + pin */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1 min-w-0">
            {subject && (
              <span
                className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-md font-medium shrink-0"
                style={{ backgroundColor: `${subject.color}18`, color: subject.color }}
              >
                <div className="w-1 h-1 rounded-full" style={{ backgroundColor: subject.color }} />
                {subject.name}
              </span>
            )}
            {topic && (
              <span className="inline-flex items-center text-[10px] px-1.5 py-0.5 rounded-md font-medium bg-muted text-muted-foreground shrink-0">
                {topic.name}
              </span>
            )}
          </div>
          <button
            onClick={(e) => { e.stopPropagation(); onTogglePin(); }}
            className={cn(
              'h-6 w-6 rounded-lg flex items-center justify-center transition-all shrink-0 -mt-0.5',
              note.is_pinned
                ? 'text-amber-500 bg-amber-500/10'
                : 'text-muted-foreground/40 hover:text-amber-500 hover:bg-amber-500/10 opacity-0 group-hover:opacity-100',
            )}
          >
            <Pin className="h-3 w-3" fill={note.is_pinned ? 'currentColor' : 'none'} />
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm text-foreground leading-snug line-clamp-2">
          {note.title}
        </h3>

        {/* Content preview */}
        {note.content && (
          <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed flex-1">
            {note.content}
          </p>
        )}

        {/* Footer */}
        <div className="flex items-center justify-between mt-auto pt-1">
          <span className="text-[10px] text-muted-foreground/60">
            {relativeDate(note.updated_at, t as TFn, locale)}
          </span>
          <div
            className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onEdit}
              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
            >
              <Pencil className="h-3 w-3" />
            </button>
            <button
              onClick={onDelete}
              className="h-6 w-6 rounded-md flex items-center justify-center text-muted-foreground hover:text-red-400 hover:bg-red-400/10 transition-all"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Note Sheet (Create / Edit) ───────────────────────────────────────────────

function NoteSheet({
  open, onClose, note, subjects, topics, userId, onSaved,
}: {
  open: boolean;
  onClose: () => void;
  note: Note | null;
  subjects: Subject[];
  topics: Topic[];
  userId: string;
  onSaved: (note: Note, isNew: boolean) => void;
}) {
  const supabase = createClient();
  const { toast } = useToast();
  const t = useTranslations('notes');
  const locale = useLocale();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subjectId, setSubjectId] = useState<string | null>(null);
  const [topicId, setTopicId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const titleRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (open) {
      setTitle(note?.title ?? '');
      setContent(note?.content ?? '');
      setSubjectId(note?.subject_id ?? null);
      setTopicId(note?.topic_id ?? null);
      setTimeout(() => (note ? textareaRef.current?.focus() : titleRef.current?.focus()), 80);
    }
  }, [note, open]);

  // When subject changes, clear topic if it doesn't belong to new subject
  useEffect(() => {
    if (topicId) {
      const t = topics.find((t) => t.id === topicId);
      if (!t || t.subject_id !== subjectId) setTopicId(null);
    }
  }, [subjectId, topicId, topics]);

  const availableTopics = topics.filter((t) => t.subject_id === subjectId);

  const handleSave = async () => {
    if (!title.trim()) { titleRef.current?.focus(); return; }
    setSaving(true);
    const now = new Date().toISOString();

    if (note) {
      const { data, error } = await supabase
        .from('notes')
        .update({ title: title.trim(), content, subject_id: subjectId, topic_id: topicId, updated_at: now })
        .eq('id', note.id)
        .eq('user_id', userId)
        .select()
        .single();
      if (!error && data) onSaved(data, false);
      else toast({ title: t('saveError'), variant: 'destructive' });
    } else {
      const { data, error } = await supabase
        .from('notes')
        .insert({ user_id: userId, title: title.trim(), content, subject_id: subjectId, topic_id: topicId })
        .select()
        .single();
      if (!error && data) onSaved(data, true);
      else toast({ title: t('createError'), variant: 'destructive' });
    }
    setSaving(false);
  };

  // Auto-resize textarea
  const autoResize = () => {
    const el = textareaRef.current;
    if (el) { el.style.height = 'auto'; el.style.height = `${el.scrollHeight}px`; }
  };

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full sm:w-[520px] flex flex-col p-0 border-l border-border bg-background"
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-6 pt-5 pb-4 border-b border-border">
          <SheetHeader className="p-0 flex-1 min-w-0">
            <SheetTitle className="text-sm font-semibold text-left">
              {note ? t('editNote') : t('newNote')}
            </SheetTitle>
          </SheetHeader>
        </div>

        {/* Subject / Topic selectors */}
        <div className="flex items-center gap-2 px-6 py-3 border-b border-border bg-muted/40">
          <Select value={subjectId ?? '__none__'} onValueChange={(v) => setSubjectId(v === '__none__' ? null : v)}>
            <SelectTrigger className="h-8 text-xs flex-1 bg-background border-border">
              <SelectValue placeholder={t('selectSubject')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{t('generalNote')}</SelectItem>
              {subjects.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  <span className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0 inline-block" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {subjectId && availableTopics.length > 0 && (
            <Select value={topicId ?? '__none__'} onValueChange={(v) => setTopicId(v === '__none__' ? null : v)}>
              <SelectTrigger className="h-8 text-xs flex-1 bg-background border-border">
                <SelectValue placeholder={t('selectTopic')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{t('noTopic')}</SelectItem>
                {availableTopics.map((topic) => (
                  <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          {/* Title */}
          <input
            ref={titleRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('titlePlaceholder')}
            className="w-full bg-transparent text-xl font-bold text-foreground placeholder:text-muted-foreground/40 focus:outline-none border-none resize-none"
            onKeyDown={(e) => e.key === 'Enter' && textareaRef.current?.focus()}
          />

          <div className="h-px bg-border/30" />

          {/* Content */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => { setContent(e.target.value); autoResize(); }}
            placeholder={t('contentPlaceholder')}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none resize-none leading-relaxed min-h-[280px]"
            style={{ height: 'auto' }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-border/30">
          <div className="text-[11px] text-muted-foreground/50">
            {note ? t('lastEdited', { date: relativeDate(note.updated_at, t as TFn, locale) }) : t('unsaved')}
          </div>
          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {t('cancel')}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSave}
              disabled={saving || !title.trim()}
              className="px-4 py-1.5 rounded-lg btn-gradient text-white text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {saving ? t('saving') : note ? t('save') : t('create')}
            </motion.button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NotesPage() {
  const supabase = createClient();
  const { toast } = useToast();
  const t = useTranslations('notes');

  const [userId, setUserId] = useState('');
  const [notes, setNotes] = useState<Note[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [filter, setFilter] = useState<FilterState>({ type: 'all' });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editNote, setEditNote] = useState<Note | null>(null);

  // ── Load data ──
  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const [notesRes, subjectsRes, topicsRes] = await Promise.all([
        supabase.from('notes').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('subjects').select('*').eq('user_id', user.id).order('name'),
        supabase.from('topics').select('*').eq('user_id', user.id),
      ]);

      setNotes(notesRes.data ?? []);
      setSubjects(subjectsRes.data ?? []);
      setTopics(topicsRes.data ?? []);
      setLoading(false);
    };
    load();
  }, []);

  // ── CRUD ──
  const handleSaved = useCallback((saved: Note, isNew: boolean) => {
    setNotes((prev) =>
      isNew
        ? [saved, ...prev]
        : prev.map((n) => (n.id === saved.id ? saved : n)),
    );
    setSheetOpen(false);
    toast({ title: isNew ? t('savedSuccess') : t('updatedSuccess') });
  }, [toast, t]);

  const handleDelete = useCallback(async (id: string) => {
    await supabase.from('notes').delete().eq('id', id).eq('user_id', userId);
    setNotes((prev) => prev.filter((n) => n.id !== id));
    toast({ title: t('deletedSuccess') });
  }, [userId, supabase, toast, t]);

  const handleTogglePin = useCallback(async (note: Note) => {
    const next = !note.is_pinned;
    await supabase.from('notes').update({ is_pinned: next }).eq('id', note.id).eq('user_id', userId);
    setNotes((prev) => prev.map((n) => (n.id === note.id ? { ...n, is_pinned: next } : n)));
  }, [userId, supabase]);

  const openCreate = () => { setEditNote(null); setSheetOpen(true); };
  const openEdit = (note: Note) => { setEditNote(note); setSheetOpen(true); };

  // ── Filter + search ──
  const displayNotes = sortNotes(
    notes.filter((n) => {
      if (!matchesFilter(n, filter)) return false;
      if (!search) return true;
      const q = search.toLowerCase();
      return n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q);
    }),
  );

  const unpinnedNotes = displayNotes.filter((n) => !n.is_pinned);
  const pinnedNotes = displayNotes.filter((n) => n.is_pinned);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex gap-6 h-full">
      {/* ── Filter panel (desktop only) ── */}
      <div className="hidden lg:block">
        <FilterPanel
          filter={filter}
          setFilter={setFilter}
          notes={notes}
          subjects={subjects}
          topics={topics}
        />
      </div>

      {/* ── Main area ── */}
      <div className="flex-1 min-w-0 space-y-5">
        {/* Top bar */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground/50" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('search')}
              className="w-full pl-8 pr-3 py-2 bg-muted/50 border border-border/40 rounded-xl text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-primary/50 transition-colors"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <span className="text-sm text-muted-foreground ml-auto">
            {t('count', { n: displayNotes.length })}
          </span>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl btn-gradient text-white text-sm font-medium shadow-lg shadow-primary/20 shrink-0"
          >
            <Plus className="h-4 w-4" />
            {t('newNote')}
          </motion.button>
        </div>

        {/* ── Empty state ── */}
        {notes.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-28 gap-5 text-center"
          >
            <div className="relative">
              <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center border border-primary/20">
                <NotebookPen className="h-12 w-12 text-primary" />
              </div>
              <motion.div
                animate={{ scale: [1, 1.12, 1], opacity: [0.4, 0.7, 0.4] }}
                transition={{ repeat: Infinity, duration: 3 }}
                className="absolute inset-0 rounded-3xl bg-primary/10"
              />
            </div>
            <div className="max-w-xs">
              <p className="text-lg font-bold text-foreground">{t('emptyTitle')}</p>
              <p className="text-sm text-muted-foreground mt-1.5">{t('emptyDesc')}</p>
            </div>
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={openCreate}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl btn-gradient text-white text-sm font-medium shadow-lg shadow-primary/25"
            >
              <Plus className="h-4 w-4" />
              {t('createFirst')}
            </motion.button>
          </motion.div>
        )}

        {/* ── No search results ── */}
        {notes.length > 0 && displayNotes.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <Search className="h-8 w-8 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">{t('noResults')}</p>
          </div>
        )}

        {/* ── Pinned notes ── */}
        {pinnedNotes.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Pin className="h-3 w-3 text-amber-500" fill="currentColor" />
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {t('pinned')}
              </p>
            </div>
            <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
              <AnimatePresence mode="popLayout">
                {pinnedNotes.map((note, i) => (
                  <motion.div
                    key={note.id}
                    layout
                    initial={{ opacity: 0, scale: 0.97 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ delay: i * 0.03 }}
                  >
                    <NoteCard
                      note={note}
                      subject={subjects.find((s) => s.id === note.subject_id)}
                      topic={topics.find((t) => t.id === note.topic_id)}
                      onEdit={() => openEdit(note)}
                      onDelete={() => handleDelete(note.id)}
                      onTogglePin={() => handleTogglePin(note)}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </div>
        )}

        {/* Divider between pinned/unpinned */}
        {pinnedNotes.length > 0 && unpinnedNotes.length > 0 && (
          <div className="flex items-center gap-3">
            <div className="h-px flex-1 bg-border/30" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/50 font-medium">
              {t('others')}
            </span>
            <div className="h-px flex-1 bg-border/30" />
          </div>
        )}

        {/* ── Unpinned notes ── */}
        {unpinnedNotes.length > 0 && (
          <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            <AnimatePresence mode="popLayout">
              {unpinnedNotes.map((note, i) => (
                <motion.div
                  key={note.id}
                  layout
                  initial={{ opacity: 0, y: 12, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                >
                  <NoteCard
                    note={note}
                    subject={subjects.find((s) => s.id === note.subject_id)}
                    topic={topics.find((t) => t.id === note.topic_id)}
                    onEdit={() => openEdit(note)}
                    onDelete={() => handleDelete(note.id)}
                    onTogglePin={() => handleTogglePin(note)}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>

      {/* ── Note Sheet ── */}
      {userId && (
        <NoteSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          note={editNote}
          subjects={subjects}
          topics={topics}
          userId={userId}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
