import { Injectable, computed, signal } from '@angular/core';
import { httpResource } from '@angular/common/http';
import { Product, SearchResponse } from './product-search.types';

@Injectable()
export class ProductSearchStore {
  readonly draftQuery = signal('keyboard');
  readonly query = signal('keyboard');

  readonly results = httpResource<SearchResponse>(() => ({
    url: 'https://dummyjson.com/products/search',
    params: {
      q: this.query(),
      limit: 8,
    },
  }));

  readonly products = computed<Product[]>(() =>
    this.results.hasValue() ? this.results.value().products : [],
  );

  readonly total = computed(() => (this.results.hasValue() ? this.results.value().total : 0));

  readonly averagePrice = computed(() => {
    const items = this.products();
    if (!items.length) return 0;

    const totalPrice = items.reduce((sum, item) => sum + item.price, 0);
    return Math.round(totalPrice / items.length);
  });

  readonly topBrand = computed(() => {
    const items = this.products();
    if (!items.length) return '-';

    const counts = new Map<string, number>();

    for (const item of items) {
      counts.set(item.brand, (counts.get(item.brand) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1])[0][0];
  });

  search(): void {
    const nextQuery = this.draftQuery().trim() || 'keyboard';
    this.query.set(nextQuery);
  }
}
