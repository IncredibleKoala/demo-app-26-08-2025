type MatchOperator<T = unknown> = { $match: any; caseSensitive?: boolean };

type IncludesOperator<T = unknown> = { $includes: any; caseSensitive?: boolean };

type Operator<T = unknown> = MatchOperator<T> | IncludesOperator<T>;

type AndOperator<T> = { $and: Array<PropCriteria<T> | ConditionOperator<T>> };

type OrOperator<T> = { $or: Array<PropCriteria<T> | ConditionOperator<T>> };

type ConditionOperator<T = unknown> = AndOperator<T> | OrOperator<T>;

type PropCriteria<T> = { [k in keyof Partial<T>]: Operator<T> };

export type SearchExpr<T = unknown> = PropCriteria<T> | ConditionOperator<T>;

function isAndOperator<T>(expr: ConditionOperator<T> | Operator<T> | SearchExpr<T>): expr is AndOperator<T> {
  return expr && '$and' in expr;
}

function isOrOperator<T>(expr: ConditionOperator<T> | Operator<T> | SearchExpr<T>): expr is OrOperator<T> {
  return expr && '$or' in expr;
}

function isConditionOperator<T>(
  expr: ConditionOperator<T> | Operator<T> | SearchExpr<T>
): expr is ConditionOperator<T> {
  return isAndOperator(expr) || isOrOperator(expr);
}

function isMatchOperator<T>(expr: ConditionOperator<T> | Operator<T> | SearchExpr<T>): expr is MatchOperator<T> {
  return expr && '$match' in expr;
}

function isIncludesOperator<T>(expr: ConditionOperator<T> | Operator<T> | SearchExpr<T>): expr is IncludesOperator<T> {
  return expr && '$includes' in expr;
}

function isPropCriteria<T>(expr: ConditionOperator<T> | Operator<T> | SearchExpr<T>): expr is PropCriteria<T> {
  return expr && !Object.keys(expr).some((c) => c.startsWith('$'));
}

function buildPropCriteria<T>(criteria: PropCriteria<T>): (t: T) => boolean {
  criteria = { ...criteria };
  return (t: T): boolean => {
    for (const key in criteria) {
      const k = key as keyof T;
      const val = criteria[k]!;
      if (isIncludesOperator(val)) {
        if (typeof t[k] === 'string' && val.caseSensitive === false) {
          const res = `${t[k]}`.toLowerCase().includes(`${val.$includes}`.toLowerCase());
          if (!res) {
            return false;
          }
        } else if (Array.isArray(t[k])) {
          const res = t[k].some((c) => {
            if (typeof c === 'string' && val.caseSensitive) {
              return c.toLowerCase().includes(`${val.$includes}`.toLowerCase());
            } else {
              return c === val.$includes;
            }
          });
          if (!res) {
            return false;
          }
        } else {
          const res = `${t[k]}`.includes(`${val.$includes}`);
          if (!res) {
            return false;
          }
        }
      } else if (isMatchOperator(val)) {
        if (typeof t[k] === 'string' && val.caseSensitive === false) {
          const res = `${t[k]}`.toLowerCase() == `${val.$match}`.toLowerCase();
          if (!res) {
            return false;
          }
        } else {
          const res = t[k] === val.$match;
          if (!res) {
            return false;
          }
        }
      }
    }
    return true;
  };
}

function buildConditionCriteria<T>(criteria: ConditionOperator<T>): (t: T) => boolean {
  const items = isAndOperator(criteria) ? criteria.$and : criteria.$or;
  const isAnd = isAndOperator(criteria);
  let fn: (t: T) => boolean = () => (isAnd ? true : false);
  const apply = (subfn: (t: T) => boolean) => {
    const oldFn = fn;
    fn = isAnd ? (t: T) => oldFn(t) && subfn(t) : (t: T) => oldFn(t) || subfn(t);
  };
  for (const item of items) {
    if (isConditionOperator(item)) {
      apply(buildConditionCriteria(item));
    } else {
      apply(buildPropCriteria(item));
    }
  }
  return fn;
}

/**
 * Builds dynamic filter function by given criteria.
 * note: May be heavily bugged, since this is a quick and dirty implementation that have not been tested at all :D
 * @example
 * ```
 * const filter = buildSearchCriteria({
 *  $or: [
 *   { name: { $incudes: 'bob' } },
 *   { name: { $match: 'alice' } }
 *  ]
 * });
 * filter({ name: 'alice' }); // returns true;
 * filter({ name: 'alice-2' }); // returns false;
 * filter({ name: 'bob' }); // returns true;
 * filter({ name: 'bobby' }); // returns true;
 * ```
 */
export function buildSearchCriteria<T>(criteria: SearchExpr<T>): (t: T) => boolean {
  if (isPropCriteria(criteria)) {
    return buildPropCriteria(criteria);
  }
  if (isConditionOperator(criteria)) {
    return buildConditionCriteria(criteria);
  }
  throw new Error();
}
