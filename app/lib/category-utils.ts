
export interface CategoryHierarchy {
  id: string;
  name: string;
  slug: string;
  children: CategoryHierarchy[];
}

export class CategoryUtils {
  static parseProductType(productType: string): string[] {
    // Parse product type hierarchy (e.g., "VŠE PRO KONĚ A PONÍKY > ČIŠTĚNÍ KONĚ > Kosmetika pro koně")
    return productType.split('>').map(cat => cat.trim()).filter(Boolean);
  }

  static createSlug(name: string): string {
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-')     // Replace spaces with hyphens
      .trim();
  }

  static buildCategoryTree(categories: any[]): CategoryHierarchy[] {
    const categoryMap = new Map();
    const rootCategories: CategoryHierarchy[] = [];

    // First pass: create all categories
    categories.forEach(cat => {
      categoryMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        children: []
      });
    });

    // Second pass: build hierarchy
    categories.forEach(cat => {
      const category = categoryMap.get(cat.id);
      if (cat.parentId && categoryMap.has(cat.parentId)) {
        categoryMap.get(cat.parentId).children.push(category);
      } else {
        rootCategories.push(category);
      }
    });

    return rootCategories;
  }
}
