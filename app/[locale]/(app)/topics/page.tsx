'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Plus, Trash2, ChevronRight, Check, Circle, Clock } from 'lucide-react';
import type { Subject, Topic, TopicStatus } from '@/types/database';

const SUBJECT_COLORS = [
  '#6366f1', '#ec4899', '#f59e0b', '#10b981',
  '#3b82f6', '#8b5cf6', '#ef4444', '#14b8a6',
];

const statusCycle: Record<TopicStatus, TopicStatus> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started',
};


export default function TopicsPage() {
  const t = useTranslations('topics');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [topics, setTopics] = useState<Topic[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | 'all'>('all');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [showAddTopic, setShowAddTopic] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newSubjectColor, setNewSubjectColor] = useState(SUBJECT_COLORS[0]);
  const [newTopicName, setNewTopicName] = useState('');
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [noteValues, setNoteValues] = useState<Record<string, string>>({});
  const supabase = createClient();

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const [{ data: subs }, { data: tops }] = await Promise.all([
      supabase.from('subjects').select('*').eq('user_id', user.id).order('created_at'),
      supabase.from('topics').select('*').eq('user_id', user.id).order('order_index'),
    ]);

    setSubjects(subs || []);
    setTopics(tops || []);

    const notes: Record<string, string> = {};
    tops?.forEach((t: { id: string; notes: string | null }) => { notes[t.id] = t.notes || ''; });
    setNoteValues(notes);
  };

  const addSubject = async () => {
    if (!newSubjectName.trim()) return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('subjects').insert({
      user_id: user.id,
      name: newSubjectName.trim(),
      color: newSubjectColor,
    }).select().single();

    if (data) {
      setSubjects((prev) => [...prev, data]);
      setSelectedSubjectId(data.id);
    }
    setNewSubjectName('');
    setShowAddSubject(false);
  };

  const deleteSubject = async (id: string) => {
    await supabase.from('subjects').delete().eq('id', id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
    setTopics((prev) => prev.filter((t) => t.subject_id !== id));
    if (selectedSubjectId === id) setSelectedSubjectId('all');
  };

  const addTopic = async () => {
    if (!newTopicName.trim() || selectedSubjectId === 'all') return;
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase.from('topics').insert({
      user_id: user.id,
      subject_id: selectedSubjectId,
      name: newTopicName.trim(),
      order_index: topics.filter((t) => t.subject_id === selectedSubjectId).length,
    }).select().single();

    if (data) setTopics((prev) => [...prev, data]);
    setNewTopicName('');
    setShowAddTopic(false);
  };

  const deleteTopic = async (id: string) => {
    await supabase.from('topics').delete().eq('id', id);
    setTopics((prev) => prev.filter((t) => t.id !== id));
  };

  const cycleStatus = async (topic: Topic) => {
    const newStatus = statusCycle[topic.status];
    await supabase.from('topics').update({
      status: newStatus,
      completed_at: newStatus === 'completed' ? new Date().toISOString() : null,
    }).eq('id', topic.id);
    setTopics((prev) => prev.map((t) => t.id === topic.id ? { ...t, status: newStatus } : t));
  };

  const saveNote = async (topicId: string) => {
    await supabase.from('topics').update({ notes: noteValues[topicId] }).eq('id', topicId);
  };

  const filteredTopics = selectedSubjectId === 'all'
    ? topics
    : topics.filter((t) => t.subject_id === selectedSubjectId);

  const getProgress = (subjectId: string) => {
    const subTopics = topics.filter((t) => t.subject_id === subjectId);
    if (subTopics.length === 0) return 0;
    const completed = subTopics.filter((t) => t.status === 'completed').length;
    return Math.round((completed / subTopics.length) * 100);
  };

  const statusIcon: Record<TopicStatus, React.ReactNode> = {
    not_started: <Circle className="h-4 w-4 text-muted-foreground" />,
    in_progress: <Clock className="h-4 w-4 text-yellow-500" />,
    completed: <Check className="h-4 w-4 text-green-500" />,
  };

  const statusBadgeVariant: Record<TopicStatus, 'secondary' | 'outline' | 'default'> = {
    not_started: 'outline',
    in_progress: 'secondary',
    completed: 'default',
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Subjects Sidebar */}
        <div className="md:col-span-1 space-y-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-muted-foreground">{t('allSubjects')}</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowAddSubject(true)}>
              <Plus className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* All subjects option */}
          <button
            onClick={() => setSelectedSubjectId('all')}
            className={cn(
              'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
              selectedSubjectId === 'all' ? 'bg-primary text-primary-foreground' : 'hover:bg-accent text-muted-foreground'
            )}
          >
            {t('allSubjects')} ({topics.length})
          </button>

          {subjects.map((subject) => {
            const progress = getProgress(subject.id);
            const count = topics.filter((t) => t.subject_id === subject.id).length;
            return (
              <div key={subject.id} className="group relative">
                <button
                  onClick={() => setSelectedSubjectId(subject.id)}
                  className={cn(
                    'w-full text-left px-3 py-2 rounded-lg text-sm transition-all',
                    selectedSubjectId === subject.id ? 'bg-primary text-primary-foreground' : 'hover:bg-accent'
                  )}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: subject.color }} />
                    <span className="truncate font-medium">{subject.name}</span>
                  </div>
                  <div className="text-xs opacity-70 ml-4.5">{progress}% · {t('topicCount', { n: count })}</div>
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1 h-5 w-5 opacity-0 group-hover:opacity-100"
                  onClick={() => deleteSubject(subject.id)}
                >
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            );
          })}
        </div>

        {/* Topics List */}
        <div className="md:col-span-3 space-y-3">
          <div className="flex items-center justify-between">
            {selectedSubjectId !== 'all' && (
              <div className="flex-1">
                <Progress value={getProgress(selectedSubjectId)} className="h-1.5" />
                <p className="text-xs text-muted-foreground mt-1">
                  {t('completedOf', {
                    completed: filteredTopics.filter((t) => t.status === 'completed').length,
                    total: filteredTopics.length,
                  })}
                </p>
              </div>
            )}
            {selectedSubjectId !== 'all' && (
              <Button size="sm" onClick={() => setShowAddTopic(true)} className="ml-4">
                <Plus className="mr-1 h-3.5 w-3.5" />
                {t('addTopic')}
              </Button>
            )}
          </div>

          {filteredTopics.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground text-sm">
              {selectedSubjectId === 'all' ? t('allSubjects') : t('addTopic')}
            </div>
          ) : (
            filteredTopics.map((topic) => {
              const isExpanded = expandedTopicId === topic.id;
              return (
                <Card key={topic.id} className="border-border/50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => cycleStatus(topic)} className="flex-shrink-0">
                        {statusIcon[topic.status]}
                      </button>
                      <span className={cn(
                        'flex-1 text-sm',
                        topic.status === 'completed' && 'line-through text-muted-foreground'
                      )}>
                        {topic.name}
                      </span>
                      <Badge variant={statusBadgeVariant[topic.status]} className="text-xs">
                        {t(`status.${topic.status}`)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setExpandedTopicId(isExpanded ? null : topic.id)}
                      >
                        <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', isExpanded && 'rotate-90')} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => deleteTopic(topic.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-destructive/60 hover:text-destructive" />
                      </Button>
                    </div>

                    {isExpanded && (
                      <div className="mt-3 ml-7 space-y-2">
                        <Label className="text-xs">{t('addNote')}</Label>
                        <Textarea
                          placeholder={t('notePlaceholder')}
                          className="text-sm min-h-[80px]"
                          value={noteValues[topic.id] || ''}
                          onChange={(e) => setNoteValues((prev) => ({ ...prev, [topic.id]: e.target.value }))}
                          onBlur={() => saveNote(topic.id)}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Add Subject Modal */}
      <Dialog open={showAddSubject} onOpenChange={setShowAddSubject}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('addSubject')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('subjectName')}</Label>
              <Input
                value={newSubjectName}
                onChange={(e) => setNewSubjectName(e.target.value)}
                placeholder={t('subjectNamePlaceholder')}
                onKeyDown={(e) => e.key === 'Enter' && addSubject()}
              />
            </div>
            <div className="space-y-2">
              <Label>{t('color')}</Label>
              <div className="flex gap-2 flex-wrap">
                {SUBJECT_COLORS.map((c) => (
                  <button
                    key={c}
                    className={cn('w-7 h-7 rounded-full transition-all', newSubjectColor === c && 'ring-2 ring-offset-2 ring-primary')}
                    style={{ backgroundColor: c }}
                    onClick={() => setNewSubjectColor(c)}
                  />
                ))}
              </div>
            </div>
            <Button onClick={addSubject} className="w-full">{t('addSubject')}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add Topic Modal */}
      <Dialog open={showAddTopic} onOpenChange={setShowAddTopic}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('addTopic')}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <div className="space-y-2">
              <Label>{t('topicName')}</Label>
              <Input
                value={newTopicName}
                onChange={(e) => setNewTopicName(e.target.value)}
                placeholder={t('topicNamePlaceholder')}
                onKeyDown={(e) => e.key === 'Enter' && addTopic()}
              />
            </div>
            <Button onClick={addTopic} className="w-full">{t('addTopic')}</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
