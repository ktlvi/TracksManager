export default interface TrackProps {
    id: string;
    title: string;
    artist: string;
    album: string;
    genres: string[];
    slug: string;
    coverImage: string;
    audioFile?: string;
    createdAt: string;
    updatedAt: string;
}
export interface TrackCardProps {
    id: string;
    title: string;
    artist: string;
    album: string;
    genres: string[];
    coverImage: string;
    audioFile?: string;
    createdAt: string;
}
