import { Injectable, computed, linkedSignal, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';

import {
  DEFAULT_LIMIT,
  DEFAULT_QUERY,
  EMPTY_SEARCH_RESPONSE,
  Product,
  SearchResponse,
  SortKey,
  SORT_OPTIONS,
} from './product-search.types';

const API_URL = 'https://dummyjson.com/products/search';

function normalizeProduct(value: unknown): Product | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  const source = value as Record<string, unknown>;

  if (
    typeof source['id'] !== 'number' ||
    typeof source['title'] !== 'string' ||
    typeof source['brand'] !== 'string' ||
    typeof source['category'] !== 'string' ||
    typeof source['price'] !== 'number'
  ) {
    return null;
  }

  return {
    id: source['id'],
    title: source['title'],
    brand: source['brand'],
    category: source['category'],
    price: source['price'],
  };
}

function parseSearchResponse(value: unknown): SearchResponse {
  if (typeof value !== 'object' || value === null) {
    return EMPTY_SEARCH_RESPONSE;
  }

  const source = value as Record<string, unknown>;

  const products = Array.isArray(source['products'])
    ? source['products'].map(normalizeProduct).filter((item): item is Product => item !== null)
    : [];

  return {
    products,
    total: typeof source['total'] === 'number' ? source['total'] : products.length,
    skip: typeof source['skip'] === 'number' ? source['skip'] : 0,
    limit: typeof source['limit'] === 'number' ? source['limit'] : products.length,
  };
}

@Injectable()
export class ProductSearchStore {
  readonly sortOptions = SORT_OPTIONS;

  readonly draftQuery = signal(DEFAULT_QUERY);
  readonly query = signal(DEFAULT_QUERY);
  readonly selectedCategory = signal<string>('all');
  readonly sortBy = signal<SortKey>('title');

  readonly results = httpResource(
    () => ({
      url: API_URL,
      params: {
        q: this.query(),
        limit: String(DEFAULT_LIMIT),
      },
    }),
    {
      defaultValue: EMPTY_SEARCH_RESPONSE,
      parse: parseSearchResponse,
    },
  );

  readonly rawProducts = computed<Product[]>(() => {
    if (!this.results.hasValue()) {
      return [];
    }

    return this.results.value().products;
  });

  readonly categories = computed(() => {
    const values = new Set(this.rawProducts().map((product) => product.category));
    return ['all', ...Array.from(values).sort((a, b) => a.localeCompare(b))];
  });

  readonly filteredProducts = computed(() => {
    const category = this.selectedCategory();
    const products = this.rawProducts();

    if (category === 'all') {
      return products;
    }

    return products.filter((product) => product.category === category);
  });

  readonly products = computed(() => {
    const items = [...this.filteredProducts()];

    switch (this.sortBy()) {
      case 'priceAsc':
        return items.sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return items.sort((a, b) => b.price - a.price);
      default:
        return items.sort((a, b) => a.title.localeCompare(b.title));
    }
  });

  readonly totalResults = computed(() => this.products().length);

  readonly averagePrice = computed(() => {
    const items = this.products();

    if (!items.length) {
      return 0;
    }

    const total = items.reduce((sum, item) => sum + item.price, 0);
    return Math.round(total / items.length);
  });

  readonly highestPrice = computed(() => {
    const items = this.products();

    if (!items.length) {
      return 0;
    }

    return Math.max(...items.map((item) => item.price));
  });

  readonly topBrand = computed(() => {
    const items = this.products();

    if (!items.length) {
      return '-';
    }

    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item.brand, (counts.get(item.brand) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  });

  readonly errorMessage = computed(() => {
    const error = this.results.error();

    if (!error) {
      return '';
    }

    if (error instanceof Error) {
      return error.message;
    }

    return 'Something went wrong while loading products.';
  });

  readonly selectedProduct = linkedSignal<Product[], Product | null>({
    source: this.products,
    computation: (products, previous) => {
      if (!products.length) {
        return null;
      }

      const previousId = previous?.value?.id;
      if (previousId !== undefined) {
        const match = products.find((product) => product.id === previousId);
        if (match) {
          return match;
        }
      }

      return products[0];
    },
  });

  search(): void {
    const nextQuery = this.draftQuery().trim() || DEFAULT_QUERY;
    this.query.set(nextQuery);
  }

  setCategory(category: string): void {
    this.selectedCategory.set(category);
  }

  setSort(sort: SortKey): void {
    this.sortBy.set(sort);
  }

  selectProduct(product: Product): void {
    this.selectedProduct.set(product);
  }

  reload(): void {
    this.results.reload();
  }
}
