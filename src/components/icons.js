import { Briefcase, Cog, Wallet, Users, Cpu, Compass } from "lucide-react";

export const DEPARTMENT_ICONS = {
  Briefcase,
  Cog,
  Wallet,
  Users,
  Cpu,
  Compass,
};

export function getDepartmentIcon(iconKey) {
  return DEPARTMENT_ICONS[iconKey] || Briefcase;
}
