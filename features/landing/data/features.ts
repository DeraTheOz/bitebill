import {
  BarChart3,
  FileSignature,
  FileText,
  History,
  Lock,
  Repeat,
  Share2,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  description: string;
};

export const features: Feature[] = [
  {
    icon: FileText,
    title: "Smart invoicing",
    description:
      "Draft, pending, paid, with overdue detected automatically the moment a due date passes.",
  },
  {
    icon: Users,
    title: "Client directory",
    description:
      "Reusable profiles with contact details, addresses, and notes, plus a full invoice history per client.",
  },
  {
    icon: FileSignature,
    title: "Branded PDFs",
    description:
      "Classic, Modern, and Corporate templates with your logo, terms, and watermarks",
  },
  {
    icon: Share2,
    title: "Public sharing",
    description:
      "Read-only links your clients can open without an account, view the invoice or grab the PDF.",
  },
  {
    icon: Repeat,
    title: "Recurring billing",
    description:
      "Monthly, quarterly, or annual invoices generated on schedule, so repeat work bills itself.",
  },
  {
    icon: BarChart3,
    title: "Live analytics",
    description:
      "Revenue trends, status metrics, and invoice distribution to see how the business is really doing.",
  },
  {
    icon: History,
    title: "Activity timeline",
    description:
      "Every action created, updated, sent, paid, logged as a permanent audit trail.",
  },
  {
    icon: Lock,
    title: "Private by design",
    description:
      "Per-user data isolation and internal notes that belong to you and nobody else.",
  },
];
