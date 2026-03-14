export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string | null;
          full_name: string | null;
          avatar_url: string | null;
          daily_goal_minutes: number;
          preferred_locale: string;
          created_at: string;
        };
        Insert: {
          id: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          daily_goal_minutes?: number;
          preferred_locale?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string | null;
          full_name?: string | null;
          avatar_url?: string | null;
          daily_goal_minutes?: number;
          preferred_locale?: string;
          created_at?: string;
        };
      };
      subscriptions: {
        Row: {
          id: string;
          user_id: string;
          lemonsqueezy_subscription_id: string | null;
          status: 'trialing' | 'active' | 'cancelled' | 'expired' | 'paused' | 'gifted';
          plan_name: string;
          current_period_start: string | null;
          current_period_end: string | null;
          trial_ends_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          lemonsqueezy_subscription_id?: string | null;
          status?: 'trialing' | 'active' | 'cancelled' | 'expired' | 'paused' | 'gifted';
          plan_name?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          lemonsqueezy_subscription_id?: string | null;
          status?: 'trialing' | 'active' | 'cancelled' | 'expired' | 'paused' | 'gifted';
          plan_name?: string;
          current_period_start?: string | null;
          current_period_end?: string | null;
          trial_ends_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      subjects: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          color: string;
          icon: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          color?: string;
          icon?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          color?: string;
          icon?: string | null;
          created_at?: string;
        };
      };
      topics: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          name: string;
          status: 'not_started' | 'in_progress' | 'completed';
          notes: string | null;
          order_index: number;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          name: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          name?: string;
          status?: 'not_started' | 'in_progress' | 'completed';
          notes?: string | null;
          order_index?: number;
          created_at?: string;
          completed_at?: string | null;
        };
      };
      study_sessions: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string | null;
          duration_minutes: number;
          session_type: string;
          started_at: string;
          ended_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id?: string | null;
          duration_minutes: number;
          session_type?: string;
          started_at: string;
          ended_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string | null;
          duration_minutes?: number;
          session_type?: string;
          started_at?: string;
          ended_at?: string | null;
        };
      };
      schedules: {
        Row: {
          id: string;
          user_id: string;
          subject_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          subject_id: string;
          day_of_week: number;
          start_time: string;
          end_time: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          subject_id?: string;
          day_of_week?: number;
          start_time?: string;
          end_time?: string;
          created_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          content: string;
          subject_id: string | null;
          topic_id: string | null;
          is_pinned: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          content?: string;
          subject_id?: string | null;
          topic_id?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          content?: string;
          subject_id?: string | null;
          topic_id?: string | null;
          is_pinned?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          category: 'daily' | 'weekly' | 'general';
          subject_id: string | null;
          target_date: string | null;
          priority: 'low' | 'medium' | 'high';
          progress_type: 'checkbox' | 'numeric';
          progress_current: number;
          progress_target: number;
          is_completed: boolean;
          note: string | null;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          category?: 'daily' | 'weekly' | 'general';
          subject_id?: string | null;
          target_date?: string | null;
          priority?: 'low' | 'medium' | 'high';
          progress_type?: 'checkbox' | 'numeric';
          progress_current?: number;
          progress_target?: number;
          is_completed?: boolean;
          note?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          category?: 'daily' | 'weekly' | 'general';
          subject_id?: string | null;
          target_date?: string | null;
          priority?: 'low' | 'medium' | 'high';
          progress_type?: 'checkbox' | 'numeric';
          progress_current?: number;
          progress_target?: number;
          is_completed?: boolean;
          note?: string | null;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}

// Convenience types
export type Profile = Database['public']['Tables']['profiles']['Row'];
export type Subscription = Database['public']['Tables']['subscriptions']['Row'];
export type Subject = Database['public']['Tables']['subjects']['Row'];
export type Topic = Database['public']['Tables']['topics']['Row'];
export type StudySession = Database['public']['Tables']['study_sessions']['Row'];
export type Schedule = Database['public']['Tables']['schedules']['Row'];
export type Goal = Database['public']['Tables']['goals']['Row'];
export type Note = Database['public']['Tables']['notes']['Row'];

export type SubscriptionStatus = Subscription['status'];
export type TopicStatus = Topic['status'];
