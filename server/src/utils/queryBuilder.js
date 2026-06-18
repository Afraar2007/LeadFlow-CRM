import { DEFAULT_PAGE, DEFAULT_LIMIT, MAX_LIMIT } from '../constants/index.js';

class QueryBuilder {
  constructor(model, queryParams) {
    this.model = model;
    this.queryParams = queryParams;
    this.filter = {};
    this.sortOption = {};
    this.fields = '';
    this.page = DEFAULT_PAGE;
    this.limit = DEFAULT_LIMIT;
    this.skip = 0;
    this.searchQuery = null;
  }

  /**
   * Applies a full-text search filter using MongoDB $text search.
   * Falls back to $regex if no text index exists on the model.
   */
  search(searchFields = []) {
    const { search } = this.queryParams;

    if (search && search.trim()) {
      const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      if (
        this.model.schema.indexes().some((idx) =>
          Object.keys(idx[0]).some((key) => key === '$**' || key.endsWith('_text'))
        )
      ) {
        this.filter.$text = { $search: search.trim() };
        this.searchQuery = search.trim();
        this.sortOption = { score: { $meta: 'textScore' }, ...this.sortOption };
      } else {
        const orConditions = searchFields.map((field) => ({
          [field]: { $regex: escapedSearch, $options: 'i' },
        }));
        this.filter.$or = orConditions;
      }
    }

    return this;
  }

  /**
   * Applies exact-match filters from query params.
   */
  filterBy(filterMap = {}) {
    for (const [paramKey, fieldPath] of Object.entries(filterMap)) {
      const value = this.queryParams[paramKey];
      if (value !== undefined && value !== null && value !== '') {
        this.filter[fieldPath] = value;
      }
    }

    return this;
  }

  /**
   * Applies a date range filter on a specified field.
   */
  dateRange(field = 'createdAt') {
    const { startDate, endDate } = this.queryParams;

    if (startDate || endDate) {
      this.filter[field] = {};

      if (startDate) {
        const start = new Date(startDate);
        if (!isNaN(start.getTime())) {
          this.filter[field].$gte = start;
        }
      }

      if (endDate) {
        const end = new Date(endDate);
        if (!isNaN(end.getTime())) {
          end.setHours(23, 59, 59, 999);
          this.filter[field].$lte = end;
        }
      }

      if (Object.keys(this.filter[field]).length === 0) {
        delete this.filter[field];
      }
    }

    return this;
  }

  /**
   * Handles includeDeleted flag for soft-delete visibility.
   */
  includeDeleted() {
    const { includeDeleted } = this.queryParams;

    if (includeDeleted === 'true' || includeDeleted === true) {
      this.filter._includeDeleted = true;
    }

    return this;
  }

  /**
   * Applies sorting based on a sort query param.
   * Supports format: "field" for ascending, "-field" for descending.
   */
  sort(sortMap = {}) {
    const { sort } = this.queryParams;

    if (this.sortOption.score) {
      return this;
    }

    if (sort && sortMap[sort]) {
      this.sortOption = sortMap[sort];
    } else if (sort) {
      const [field, order] = sort.startsWith('-')
        ? [sort.slice(1), -1]
        : [sort, 1];
      this.sortOption = { [field]: order };
    } else {
      this.sortOption = { createdAt: -1 };
    }

    return this;
  }

  /**
   * Selects specific fields to return.
   */
  select(fields = '') {
    this.fields = fields;
    return this;
  }

  /**
   * Applies pagination based on page and limit query params.
   */
  paginate() {
    this.page = parseInt(this.queryParams.page, 10) || DEFAULT_PAGE;
    this.limit = parseInt(this.queryParams.limit, 10) || DEFAULT_LIMIT;

    if (this.page < 1) this.page = 1;
    if (this.limit < 1) this.limit = DEFAULT_LIMIT;
    if (this.limit > MAX_LIMIT) this.limit = MAX_LIMIT;

    this.skip = (this.page - 1) * this.limit;

    return this;
  }

  /**
   * Returns the skip value for aggregation pipelines.
   */
  getSkip() {
    return this.skip;
  }

  /**
   * Returns the limit value.
   */
  getLimit() {
    return this.limit;
  }

  /**
   * Returns the computed page number.
   */
  getPage() {
    return this.page;
  }

  /**
   * Builds and returns the Mongoose query, total count, and pagination info.
   * Uses lean() for performance.
   */
  async exec(populateOptions = null) {
    let query = this.model.find(this.filter);

    if (this.fields) {
      query = query.select(this.fields);
    }

    if (Object.keys(this.sortOption).length > 0) {
      query = query.sort(this.sortOption);
    }

    query = query.skip(this.skip).limit(this.limit).lean();

    if (populateOptions) {
      if (Array.isArray(populateOptions)) {
        populateOptions.forEach((opt) => {
          query = query.populate(opt);
        });
      } else {
        query = query.populate(populateOptions);
      }
    }

    const [data, total] = await Promise.all([
      query.exec(),
      this.model.countDocuments(this.filter),
    ]);

    const totalPages = Math.ceil(total / this.limit);

    return {
      data,
      pagination: {
        page: this.page,
        limit: this.limit,
        total,
        totalPages,
        hasNext: this.page < totalPages,
        hasPrev: this.page > 1,
      },
    };
  }

  /**
   * Returns the built filter object.
   */
  getFilter() {
    return this.filter;
  }

  /**
   * Returns the sort option.
   */
  getSort() {
    return this.sortOption;
  }
}

export default QueryBuilder;