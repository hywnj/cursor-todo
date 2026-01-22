export interface Todo {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
}