/**
 * API error interface for standardized error handling
 */
export interface ApiError {
  readonly message: string;
  readonly statusCode: number | null;
  readonly endpoint: string;
  readonly timestamp: string;
}
