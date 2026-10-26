type DemandeStatus = "pending" | "approved" | "rejected";
export type DemandeType = {
  id: number;
  title: string;
  description: string;
  date: string;
  status: DemandeStatus;
  type: "absence" | "document" | "administrative" | "other";
};
