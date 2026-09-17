import {
  Search, Heart, ShoppingBag, UserCircle2, SlidersHorizontal,
  ListFilter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft,
  AlertCircle, PackageOpen, Leaf, X, Settings, ArrowUpDown, Check, CheckCircle
} from "lucide-react";
import type { LucideProps, LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  search: Search,
  favorite: Heart,
  favorite_border: Heart,
  shopping_bag: ShoppingBag,
  account_circle: UserCircle2,
  tune: SlidersHorizontal,
  filter_list: ListFilter,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  error_outline: AlertCircle,
  inventory_2: PackageOpen,
  spa: Leaf,
  close: X,
  settings: Settings,
  sort: ArrowUpDown,
  check: Check,
  check_circle: CheckCircle,
};

interface IconProps extends Omit<LucideProps, "size"> {
  name: string;
  size?: LucideProps["size"];
}

export function Icon({ name, size = "1em", strokeWidth = 1.8, className = "", ...props }: IconProps) {
  const Cmp = ICONS[name];
  if (!Cmp) {
    if (import.meta.env.DEV) console.warn(`Icon "${name}" has no lucide mapping`);
    return null;
  }
  return <Cmp size={size} strokeWidth={strokeWidth} className={className} {...props} />;
}
