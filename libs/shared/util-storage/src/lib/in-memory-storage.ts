import { buildSearchCriteria, SearchExpr } from '@demo-app/shared/util-search';
import { Storage } from './storage.type';

export class InMemoryStorage<TKey, T> extends Storage<TKey, T> {
  private readonly _storage = new Map<TKey, T>();

  constructor(private readonly config: { keyProp: keyof T }) {
    super();
  }

  public get(key: TKey): Promise<T | null> {
    return Promise.resolve(this._storage.get(key) ?? null);
  }

  public getAllKeys(): Promise<TKey[]> {
    return Promise.resolve(Array.from(this._storage.keys()));
  }

  public async search(props: SearchExpr<T>): Promise<T[]> {
    const hasFilters = Object.keys(props).length > 0;
    const filter = buildSearchCriteria(props);
    const result = Array.from(this._storage.values()).filter((item) => !hasFilters || filter(item));
    return result;
  }

  public async hydrate(initialState: T[]): Promise<void> {
    this._storage.clear();
    for (const entity of initialState) {
      const key = this.resolveKey(entity);
      this._storage.set(key, entity);
    }
  }

  public async add(entity: T): Promise<void> {
    const key = this.resolveKey(entity);
    if (this._storage.has(key)) {
      throw new Error('already-exists');
    }
    this._storage.set(key, entity);
  }

  public async update(key: TKey, update: Partial<T>): Promise<T> {
    const src = this._storage.get(key);
    if (!src) {
      throw new Error('not-found');
    }
    if (!this.resolveKey(src) === key) {
      throw new Error('internal-error');
    }
    const result = { ...src, ...update };
    this._storage.set(key, result);
    return result;
  }

  public async delete(key: TKey): Promise<void> {
    this._storage.delete(key);
  }

  private resolveKey(entity: T): TKey {
    return entity[this.config.keyProp] as TKey;
  }
}
