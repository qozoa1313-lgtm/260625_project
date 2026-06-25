import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Category = {
  id: string;
  name: string;
  created_at: string;
};

export type Expense = {
  id: string;
  expense_date: string;
  category_id: string | null;
  category_name: string;
  store_name: string;
  amount: number;
  created_at: string;
};

export type NewExpense = Omit<Expense, 'id' | 'created_at'>;
