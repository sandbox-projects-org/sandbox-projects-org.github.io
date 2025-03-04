import { EMediaType } from "./constants";

export interface ISearchResults {
	title: string;
	results: IMediaInfo[];
	page: number;
	total_pages: number;
	total_results: number;
}

export interface IMediaInfo {
	id: string;
	title: string;
	media_type: EMediaType;
	release_date: string;
	overview: string;
	poster_path: string;
	season?: number;
	episode?: number;
	episode_title?: string;
	episode_overview?: string;
	genres: string[];
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