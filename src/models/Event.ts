/**
 * Model Sự kiện lịch sử
 * Firestore: periods/{periodSlug}/stages/{stageSlug}/events/{eventSlug}
 */

import { FirestoreDateValue } from './Period';

export interface MediaItem {
  content?: string;
  link?: string;
  url?: string;
}

export interface WarSummaryItem {
  detail?: string;
  diadiem?: {
    content?: string;
    latLon?: string[];
  };
  images?: MediaItem[];
}

type SideMap = {
  vn?: string[];
  usAllies?: string[];
  opponent?: string[];
};

export interface StageEventContent {
  result?: {
    vn?: string[];
    usAllies?: string[];
    opponent?: string[];
  };
  forces?: {
    vn?: string[];
    usAllies?: string[];
    opponent?: string[];
  };
  warSummary?: WarSummaryItem[];
}

export interface Event {
  id: string;            // = document ID = slug
  periodSlug: string;
  stageSlug: string;
  title: string;
  smallTitle?: string;
  summary?: string;
  description?: string;
  coverMediaRef: string;
  images?: MediaItem[];
  videos?: (MediaItem | string)[];
  youtubeId?: string;
  startDate: FirestoreDateValue;
  endDate: FirestoreDateValue;
  details?: string[];    // gạch đầu dòng chi tiết
  warCause?: string[];
  object?: SideMap;
  content?: StageEventContent;
  meaning?: string[];
  impactOnPresent?: string;
  sortOrder?: number;
}
