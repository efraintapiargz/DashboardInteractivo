export interface DonkiFlareResponse {
  readonly flrID: string;
  readonly instruments: readonly {
    readonly displayName: string;
  }[];
  readonly beginTime: string;
  readonly peakTime: string;
  readonly endTime: string | null;
  readonly classType: string;
  readonly sourceLocation: string;
  readonly activeRegionNum: number | null;
  readonly linkedEvents: readonly {
    readonly activityID: string;
  }[] | null;
  readonly link: string;
}

export const FLARE_CLASSES = ['C', 'M', 'X'] as const;
export type FlareClass = (typeof FLARE_CLASSES)[number];
