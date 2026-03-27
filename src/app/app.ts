import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { ProductSearchStore } from './product-search/product-search.store';

@Component({
  selector: 'app-root',
  imports: [FormsModule],
  providers: [ProductSearchStore],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly store = inject(ProductSearchStore);
}
