import { PostgrestError, SupabaseClient } from "@supabase/supabase-js";
import { DatabaseError } from "../services";
import { PostgrestFilterBuilder } from "@supabase/postgrest-js";

interface ResponseQuery<T> {
  data: T | null;
  error: PostgrestError | null;
}

export interface QueryOptionsField {
  field: string;
  value: any;
}
interface QueryOrder {
  field: string;
  value: Record<string, boolean>;
}
enum QueryOptionsNames {
  eq = "eq",
  neq = "neq",
  like = "like",
  ilike = "ilike",
  in_ = "in_",
  lt = "lt",
  lte = "lte",
  gt = "gt",
  gte = "gte",
}
interface QueryOptions {
  fields?: string;
  single?: boolean;
  order?: QueryOrder;
  [QueryOptionsNames.eq]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.neq]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.like]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.ilike]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.in_]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.lt]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.lte]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.gt]?: QueryOptionsField | QueryOptionsField[];
  [QueryOptionsNames.gte]?: QueryOptionsField | QueryOptionsField[];
}
interface ISelectQueryPayload {
  client: SupabaseClient<any, "public", any>;
  table: string;
  options?: QueryOptions;
  schema?: string;
  selectStatement?: string;
}

const addOptionToQuery = (
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  key: string,
  value: QueryOptionsField,
) => {
  if (key === QueryOptionsNames.eq) {
    query.eq(value.field, value.value);
  }
  if (key === QueryOptionsNames.neq) {
    query.neq(value.field, value.value);
  }
  if (key === QueryOptionsNames.like) {
    query.like(value.field, value.value);
  }
  if (key === QueryOptionsNames.ilike) {
    query.ilike(value.field, value.value);
  }
  if (key === QueryOptionsNames.in_) {
    query.in(value.field, value.value);
  }
  if (key === QueryOptionsNames.lt) {
    query.lt(value.field, value.value);
  }
  if (key === QueryOptionsNames.lte) {
    query.lte(value.field, value.value);
  }
  if (key === QueryOptionsNames.gt) {
    query.gt(value.field, value.value);
  }
  if (key === QueryOptionsNames.gte) {
    query.gte(value.field, value.value);
  }
};

const buildQueryOptions = (
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  { fields, single, order, ...options }: QueryOptions,
) => {
  Object.entries(options).forEach(
    ([key, value]: [string, QueryOptionsField | QueryOptionsField[]]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => {
          addOptionToQuery(query, key, v);
        });
        return;
      }
      addOptionToQuery(query, key, value);
    },
  );
  return query;
};

const addOptionsToQuery = (
  query: PostgrestFilterBuilder<any, any, any, any, any>,
  options: QueryOptions,
): PostgrestFilterBuilder<any, any, any, any, any> => {
  const queryWithOptions = buildQueryOptions(query, options);

  if (options.single) {
    queryWithOptions.limit(1).single();
  }
  if (options.order) {
    return queryWithOptions.order(options.order.field, options.order.value);
  }
  return queryWithOptions;
};

const selectQueryBase = ({
  client,
  table,
  options,
  schema,
  selectStatement,
}: ISelectQueryPayload) => {
  let fromQuery;
  if (schema) {
    fromQuery = client.schema(schema).from(table);
  } else {
    fromQuery = client.from(table);
  }

  let query = fromQuery.select(
    selectStatement,
  ) as unknown as PostgrestFilterBuilder<any, any, any, any, any>;

  if (options) {
    query = addOptionsToQuery(query, options);
  }
  return query;
};

export const selectQuery = async <T>(
  payload: ISelectQueryPayload,
): Promise<T> => {
  try {
    const query = selectQueryBase(payload);
    const { data, error } = await query.returns<T>();
    if (error) {
      throw new DatabaseError(error.message);
    }

    return data as T;
  } catch (error) {
    throw new DatabaseError("An error occurred selecting rows data", {
      cause: error,
    });
  }
};

export const selectSingleQuery = async <T>(
  payload: ISelectQueryPayload,
): Promise<T | null> => {
  try {
    const query = selectQueryBase(payload);
    const { data, error } = await query.limit(1).maybeSingle<T>();
    if (error) {
      throw new DatabaseError(error.message);
    }

    return data;
  } catch (error) {
    throw new DatabaseError("An error occurred selecting single row data", {
      cause: error,
    });
  }
};

export const insertQuery = async <T>(
  client: SupabaseClient<any, "public", any>,
  table: string,
  payload: Partial<T>,
): Promise<void> => {
  try {
    const { error } = await client.from(table).insert(payload);

    if (error) {
      throw new DatabaseError(error.message);
    }
  } catch (error: unknown) {
    throw new DatabaseError("An error occurred inserting data", {
      cause: error,
    });
  }
};

export const insertQueryAndSelect = async <T>(
  client: SupabaseClient<any, "public", any>,
  table: string,
  payload: Partial<T>,
): Promise<T> => {
  try {
    const { data, error } = await client
      .from(table)
      .insert(payload)
      .select()
      .limit(1)
      .single<T>();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data;
  } catch (error: unknown) {
    throw new DatabaseError("An error occurred inserting data", {
      cause: error,
    });
  }
};

export const upsertQuery = async <T>({
  client,
  payload,
  table,
  schema = "public",
}: {
  client: SupabaseClient<any, "public", any>;
  table: string;
  payload: Partial<T>;
  schema?: string;
}): Promise<T> => {
  try {
    const { data, error } = await client
      .schema(schema)
      .from(table)
      .upsert(payload)
      .select()
      .single<T>();

    if (error) {
      throw new DatabaseError(error.message);
    }

    return data;
  } catch (error) {
    throw new DatabaseError("An error occurred upserting data", {
      cause: error,
    });
  }
};

export const updateQuery = async <T>(
  client: SupabaseClient<any, "public", any>,
  table: string,
  id: string,
  payload: Partial<T>,
): Promise<T> => {
  try {
    const { data, error } = await client
      .from(table)
      .update(payload)
      .eq("id", id)
      .select()
      .single();
    if (error) {
      throw new DatabaseError(error.message);
    }

    return data;
  } catch (error) {
    throw new DatabaseError("An error occurred updating data", {
      cause: error,
    });
  }
};

export const deleteQuery = async (
  client: SupabaseClient<any, "public", any>,
  table: string,
  options?: QueryOptions,
): Promise<void> => {
  try {
    let query = client
      .from(table)
      .delete() as unknown as PostgrestFilterBuilder<any, any, any, any, any>;

    if (options) {
      query = addOptionsToQuery(query, options);
    }
    const { error } = await query;

    if (error) {
      throw new DatabaseError(error.message);
    }
  } catch (error) {
    throw new DatabaseError("An error occurred deleting data", {
      cause: error,
    });
  }
};
