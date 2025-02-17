import { EMediaType } from "./constants";

export interface IMediaInfo {
    id: string;
    title: string;
    media_type: EMediaType;
    release_date: string;
    overview: string;
    poster_path: string;
}