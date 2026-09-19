export const POCKET_COLORS = [ 
    "RED", "GREEN", "ORANGE", "YELLOW", "BLUE", "PURPLE", 
    "DARKGREEN", "MAROON", "PINK", "BLACK", "WHITE" 
] as const;

export type PocketColor = (typeof POCKET_COLORS)[number];

export interface Pocket {
  pocket_id: number;
  pocket_name: string;
  pocket_balance: number;
  pocket_limit?: number;
  color: PocketColor;
}

export interface Spending {
  pocket_name: string;
  spending: number;
}

export interface Transaction {
  transaction_date: string;
  pocket_name: string;
  transaction_amount: number;
  transaction_message: string;
}

export interface Notification {
  notification_id: number;
  message: string;
  is_read: number | boolean;
  created_at: string;
}

export interface Recipient {
  user_id: number;
  name: string;
  username: string;
  phone: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  username: string;
  total_balance: number;
  pockets: Pocket[];
  spendings: Spending[];
  transactions: Transaction[];
  notifications: Notification[];
}

export interface PocketMutationResult {
  pockets: Pocket[];
  notifications: Notification[];
}

export interface CreatePocketResult {
  createdPocket: Pocket;
  notifications: Notification[];
}

export type ModalKind = "add" | "manage" | "transfer" | "send" | null;
