import Link from "next/link";
import type { Category } from "@/lib/types/category";

type CategoryBreadcrumbProps = {
  locale: string;
  category: Category;
};

function collectParents(category: Category) {
  const parents: Array<Pick<Category, "name" | "slug">> = [];
  let current = category.parent;

  while (current && typeof current !== "string") {
    parents.unshift({ name: current.name, slug: current.slug });
    current = current.parent;
  }

  return parents;
}

export function CategoryBreadcrumb({ locale, category }: CategoryBreadcrumbProps) {
  const parents = collectParents(category);

  return (
    <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm">
      <Link href={`/${locale}`} className="text-slate-600 hover:underline dark:text-slate-300">
        Home
      </Link>
      <span className="text-slate-400">/</span>
      {parents.map((parent) => (
        <span key={parent.slug} className="flex items-center gap-2">
          <Link
            href={`/${locale}/categories/${parent.slug}`}
            className="text-slate-600 hover:underline dark:text-slate-300"
          >
            {parent.name}
          </Link>
          <span className="text-slate-400">/</span>
        </span>
      ))}
      <span className="font-medium text-slate-900 dark:text-slate-100">{category.name}</span>
    </nav>
  );
}
