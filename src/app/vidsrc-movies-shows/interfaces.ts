import { EMediaType } from "./constants";

export interface IMediaInfo {
    id: string;
    title: string;
    media_type: EMediaType;
    release_date: string;
    overview: string;
    poster_path?: string;
    season?: number;
    episode?: number;
    episode_title?: string;
    episode_overview?: string;
}

export interface ISeasonInfo {
    season_number: number;
    name: string;
    episode_count: number;
    episodes: IEpisodeInfo[];
}

export interface IEpisodeInfo {
    episode_number: number;
    name: string;
    overview: string;
}