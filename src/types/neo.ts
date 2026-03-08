export interface CloseApproachData {
  readonly close_approach_date: string;
  readonly close_approach_date_full: string;
  readonly epoch_date_close_approach: number;
  readonly relative_velocity: {
    readonly kilometers_per_second: string;
    readonly kilometers_per_hour: string;
    readonly miles_per_hour: string;
  };
  readonly miss_distance: {
    readonly astronomical: string;
    readonly lunar: string;
    readonly kilometers: string;
    readonly miles: string;
  };
  readonly orbiting_body: string;
}

export interface EstimatedDiameter {
  readonly estimated_diameter_min: number;
  readonly estimated_diameter_max: number;
}

export interface NeoObject {
  readonly id: string;
  readonly neo_reference_id: string;
  readonly name: string;
  readonly nasa_jpl_url: string;
  readonly absolute_magnitude_h: number;
  readonly estimated_diameter: {
    readonly kilometers: EstimatedDiameter;
    readonly meters: EstimatedDiameter;
    readonly miles: EstimatedDiameter;
    readonly feet: EstimatedDiameter;
  };
  readonly is_potentially_hazardous_asteroid: boolean;
  readonly close_approach_data: readonly CloseApproachData[];
  readonly is_sentry_object: boolean;
}

export interface NeoFeedResponse {
  readonly links: {
    readonly next: string;
    readonly previous: string;
    readonly self: string;
  };
  readonly element_count: number;
  readonly near_earth_objects: Record<string, readonly NeoObject[]>;
}
