export interface SavedUser {
  id: string;
  name: string;
  university: string;
  major: string;
  instagram: string;
  bio?: string;
  song?: string;
  images: string[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}