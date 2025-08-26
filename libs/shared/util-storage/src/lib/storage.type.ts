/**
 * Base storage class for storing entity-like collection (mostly for mock purposes)
 */
export abstract class Storage<TKey, T> {
  public abstract search(props: { [key in keyof T]: any }): Promise<T[]>;
  public abstract get(key: TKey): Promise<T | null>;
  public abstract getAllKeys(): Promise<TKey[]>;
  public abstract add(entity: T): Promise<void>;
  public abstract hydrate(initialState: T[]): Promise<void>;
  public abstract update(id: TKey, partialUpdate: Partial<T>): Promise<T>;
  public abstract delete(id: TKey): Promise<void>;
}
