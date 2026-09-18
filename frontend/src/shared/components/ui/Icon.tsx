import {
  Search, Heart, ShoppingBag, UserCircle2, SlidersHorizontal,
  ListFilter, ChevronUp, ChevronDown, ChevronRight, ChevronLeft,
  AlertCircle, PackageOpen, Leaf, X, Settings, ArrowUpDown, Check, CheckCircle,
  Minus, Plus, Trash2, MessageCircle, Star, ShoppingCart, Bookmark,
  Info, MapPin, Lock, ShieldCheck, Truck, UserCircle, CreditCard, Wallet,
  ArrowRight, RefreshCw, Package, Pencil, Eye, EyeOff, Images, Landmark,
  Trees, ScanSearch, Crosshair, Layers, SearchX, User, ArrowLeft, Wrench,
  FileText, Image, RotateCcw, AlertTriangle, Receipt, Copy, Mail,
  Save, Link2, House
} from "lucide-react";
import type { LucideProps, LucideIcon } from "lucide-react";

const ICONS: Record<string, LucideIcon> = {
  search: Search,
  favorite: Heart,
  favorite_border: Heart,
  shopping_bag: ShoppingBag,
  account_circle: UserCircle2,
  person: User,
  person_pin: UserCircle,
  tune: SlidersHorizontal,
  filter_list: ListFilter,
  expand_less: ChevronUp,
  expand_more: ChevronDown,
  chevron_right: ChevronRight,
  chevron_left: ChevronLeft,
  arrow_back: ArrowLeft,
  error_outline: AlertCircle,
  inventory_2: PackageOpen,
  spa: Leaf,
  close: X,
  settings: Settings,
  sort: ArrowUpDown,
  check: Check,
  check_circle: CheckCircle,
  done: Check,
  remove: Minus,
  add: Plus,
  delete_outline: Trash2,
  chat_bubble_outline: MessageCircle,
  star: Star,
  shopping_cart_checkout: ShoppingCart,
  bookmark: Bookmark,
  bookmark_border: Bookmark,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
  location_on: MapPin,
  lock: Lock,
  verified_user: ShieldCheck,
  local_shipping: Truck,
  person_outline: UserCircle,
  credit_card: CreditCard,
  account_balance_wallet: Wallet,
  account_balance: Landmark,
  arrow_forward: ArrowRight,
  refresh: RefreshCw,
  replay: RotateCcw,
  package_2: Package,
  edit: Pencil,
  eye: Eye,
  eye_off: EyeOff,
  visibility: Eye,
  eco: Leaf,
  security: ShieldCheck,
  verified: CheckCircle,
  photo_library: Images,
  forest: Trees,
  search_insights: ScanSearch,
  precision_manufacturing: Crosshair,
  texture: Layers,
  search_off: SearchX,
  mail: Mail,
  build: Wrench,
  done_all: CheckCircle,
  delete: Trash2,
  file_download: Package,
  extension: Package,
  inventory: PackageOpen,
  north_east: ArrowRight,
  production_quantity_limits: AlertTriangle,
  filter_alt_off: ListFilter,
  receipt_long: Receipt,
  receipt: Receipt,
  image: Image,
  copy: Copy,
  file_text: FileText,
  save: Save,
  link: Link2,
  home_work: House,
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
