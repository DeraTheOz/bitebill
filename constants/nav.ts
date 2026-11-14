import {
  BarChart3,
  FileText,
  LayoutDashboard,
  Repeat,
  Settings,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
};

/** Primary workspace navigation destinations rendered in the app sidebar and mobile menu. */
export const navItems: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/clients", label: "Clients", icon: Users },
  { href: "/invoices", label: "Invoices", icon: FileText },
  { href: "/recurring-invoices", label: "Recurring", icon: Repeat },
  { href: "/settings", label: "Settings", icon: Settings },
];
