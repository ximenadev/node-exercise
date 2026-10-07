import type { Query } from 'mongoose';

type QueryValue = string | string[] | { [key: string]: QueryValue } | undefined;
export type QueryString = Record<string, QueryValue>;

const EXCLUDED_FIELDS = ['page', 'sort', 'limit', 'fields'];
const ALLOWED_OPERATORS = ['gte', 'gt', 'lte', 'lt'];

export class APIFeatures<T> {
  constructor(
    public query: Query<T[], T>,
    private queryString: QueryString,
  ) {}

  private getString(key: string) {
    const value = this.queryString[key];
    return typeof value === 'string' ? value : undefined;
  }

  filter() {
    const filter: Record<string, string | Record<string, string>> = {};

    for (const [field, value] of Object.entries(this.queryString)) {
      if (EXCLUDED_FIELDS.includes(field)) continue;

      if (typeof value === 'string') {
        filter[field] = value;
      } else if (value && !Array.isArray(value)) {
        // Only whitelisted operators with plain string values reach Mongo
        const operators: Record<string, string> = {};
        for (const [op, opValue] of Object.entries(value)) {
          if (ALLOWED_OPERATORS.includes(op) && typeof opValue === 'string') {
            operators[`$${op}`] = opValue;
          }
        }
        if (Object.keys(operators).length) filter[field] = operators;
      }
    }

    this.query = this.query.find(filter);
    return this;
  }

  sort(defaultSort: string = '-createdAt') {
    const sortBy = this.getString('sort')?.split(',').join(' ') ?? defaultSort;
    this.query = this.query.sort(sortBy);
    return this;
  }

  limitFields() {
    const fields = this.getString('fields')?.split(',').join(' ') ?? '-__v';
    this.query = this.query.select(fields);
    return this;
  }

  paginate(maxLimit: number = 100) {
    const page = Math.max(Math.trunc(Number(this.getString('page'))) || 1, 1);
    const limit = Math.min(
      Math.trunc(Number(this.getString('limit'))) || maxLimit,
      maxLimit,
    );
    const skip = (page - 1) * limit;
    this.query = this.query.skip(skip).limit(limit);
    return this;
  }
}
