// Shapes of the stage 1 database rows (see supabase/migrations/0001_stage1.sql).
export type Profile = {
  id: string; email: string; first_name: string | null; last_name: string | null; mobile: string | null;
  role: "member" | "staff"; member_no: number | null; goal: string | null; holiday_until?: string | null;
};
export type Registration = {
  profile_id: string; fit: "women" | "men" | null; colour: "cream" | "charcoal" | null;
  size: "XS" | "S" | "M" | "L" | "XL" | "2XL" | "3XL" | null; terms_accepted_at: string | null;
  payment_status: "unpaid" | "pending" | "paid" | "refunded"; square_order_id: string | null;
  square_payment_id: string | null; paid_at: string | null; amount_cents: number | null; updated_at?: string;
};

