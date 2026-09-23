import {
  LayoutDashboard,
  Users,
  UserRound,
  Building2,
  Wallet,
  Landmark,
  CalendarClock,
  ReceiptText,
  FileText,
  Settings,
} from "lucide-react";

export const sidebarMenu = [
  {
    section: "",
    items: [
      {
        title: "Dashboard",
        path: "/dashboard",
        icon: LayoutDashboard,
      },
    ],
  },

  {
    section: "GROUP MANAGEMENT",
    items: [
      {
        title: "Groups",
        path: "/groups",
        icon: Users,
      },
      {
        title: "Subgroups",
        path: "/subgroups",
        icon: Building2,
      },
      {
        title: "Members",
        path: "/members",
        icon: UserRound,
      },
    ],
  },

  {
    section: "FINANCE",
    items: [
      {
        title: "Savings",
        path: "/savings",
        icon: Wallet,
      },
      {
        title: "Loans",
        path: "/loans",
        icon: Landmark,
      },
      {
        title: "Installments",
        path: "/installments",
        icon: CalendarClock,
      },
      {
        title: "Expenses",
        path: "/expenses",
        icon: ReceiptText,
      },
    ],
  },

  {
    section: "OTHER",
    items: [
      {
        title: "Reports",
        path: "/reports",
        icon: FileText,
      },
      {
        title: "Settings",
        path: "/settings",
        icon: Settings,
      },
    ],
  },
];
