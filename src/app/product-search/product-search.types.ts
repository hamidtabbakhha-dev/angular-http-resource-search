export type SortKey = 'title' | 'priceAsc' | 'priceDesc';

export interface SortOption {
  key: SortKey;
  label: string;
}

export interface Product {
  id: number;
  title: string;
  brand: string;
  category: string;
  price: number;
}

export interface SearchResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export const DEFAULT_QUERY = 'keyboard';
export const DEFAULT_LIMIT = 12;

export const SORT_OPTIONS: SortOption[] = [
  { key: 'title', label: 'Title' },
  { key: 'priceAsc', label: 'Price: Low to High' },
  { key: 'priceDesc', label: 'Price: High to Low' },
];

export const EMPTY_SEARCH_RESPONSE: SearchResponse = {
  products: [],
  total: 0,
  skip: 0,
  limit: DEFAULT_LIMIT,
};
