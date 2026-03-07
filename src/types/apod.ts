/**
 * NASA APOD (Astronomy Picture of the Day) API response interface
 */
export interface ApodResponse {
  readonly copyright?: string;
  readonly date: string;
  readonly explanation: string;
  readonly hdurl?: string;
  readonly media_type: 'image' | 'video';
  readonly service_version: string;
  readonly title: string;
  readonly url: string;
}
