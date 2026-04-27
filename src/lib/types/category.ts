export interface Category {
  id: string;
  name: string;
  slug: string;
  description: unknown | null;
  image: {
    id: string;
    url: string;
    alt: string;
  } | null;
  parent: Category | string | null;
  displayOrder: number;
  isActive: boolean;
  meta: {
    title: string | null;
    description: string | null;
  } | null;
}
