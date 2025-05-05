export class AuthenticationError extends Error {
  public code?: string;
  constructor(message: string, options?: ErrorOptions) {
    super(`Auth Error: ${message}`);
    this.code = "auth-error";
    this.cause = options?.cause;
  }
}

export class DatabaseError extends Error {
  public code?: string;
  constructor(message: string, options?: ErrorOptions) {
    super(`DB Error: ${message}`);
    this.code = "database-error";
    this.cause = options?.cause;
  }
}

export class HTTPError extends Error {
  public code?: string;
  constructor(message: string, options?: ErrorOptions) {
    super(`HTTP Error: ${message}`);
    this.code = "http-error";
    this.cause = options?.cause;
  }
}

export class BucketError extends Error {
  public code?: string;
  constructor(message: string, options?: ErrorOptions) {
    super(`Bucket Error: ${message}`);
    this.code = "bucket-error";
    this.cause = options?.cause;
  }
}
