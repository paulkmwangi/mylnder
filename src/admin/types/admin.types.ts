export interface SavedUser {
  id: string;
  name: string;
  university: string;
  universityId?: string;
  major: string;
  instagram: string;
  bio?: string;
  song?: string;
  createdAt?: string;
  invoiceNumber?: string;
  isPosted: boolean;
  posterPhotoUrl?: string;
  images: string[];
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
}