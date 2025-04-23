import { TrackCardProps } from "../types/track";
import WavesurferPlayer from "@wavesurfer/react";
import { getAudioURL } from "../services/api";

interface ExtendedTrackProps extends TrackCardProps {
    onDelete: (id: string) => void;
    onEdit: (track: TrackCardProps) => void;
    onPlay: (id: string) => void;
    onSelect: () => void;
    isSelected: boolean;
    isPlaying: boolean;
}

export default function Track({
    id,
    title,
    artist,
    album,
    genres,
    coverImage,
    audioFile,
    createdAt,
    onDelete,
    onEdit,
    onPlay,
    onSelect,
    isSelected,
    isPlaying,
}: ExtendedTrackProps) {
    const defaultImage = "https://via.placeholder.com/48?text=No+Image";

    // Prepares the track data for editing or other actions
    const trackData = {
        id,
        title,
        artist,
        album,
        genres,
        coverImage,
        audioFile,
        createdAt,
    };

    // Plays the audio when the track is ready and isPlaying is true
    const onReady = (wavesurfer: { play: () => void }) => {
        if (isPlaying) {
            wavesurfer.play();
        }
    };

    return (
        <div
            data-testid={`track-item-${id}`}
            className={`${
                isSelected
                    ? "bg-gray-600 hover:bg-gray-500"
                    : "bg-gray-700 hover:bg-gray-600"
            } flex flex-col sm:flex-row items-start sm:items-center justify-between p-3 rounded-lg transition-colors gap-2 sm:gap-4`}
        >
            <div className="flex items-center gap-2 sm:gap-4 w-full sm:w-auto">
                {/* Checkbox for selecting the track */}
                <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={onSelect}
                    className="mr-2 w-4 h-4 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500"
                    data-testid={`track-checkbox-${id}`}
                />
                {/* Displays the track's cover image */}
                <img
                    src={
                        typeof coverImage === "string" && coverImage
                            ? coverImage
                            : defaultImage
                    }
                    alt={`Cover for ${title}`}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover flex-shrink-0"
                />
                <div className="flex flex-col text-gray-300 min-w-0 flex-1">
                    {/* Track title */}
                    <h3
                        data-testid={`track-item-${id}-title`}
                        className="text-sm font-semibold my-1 truncate"
                    >
                        {title}
                    </h3>
                    {/* Artist, album, and genres */}
                    <p className="text-xs text-gray-400 flex flex-wrap items-center gap-1">
                        <span className="opacity-70">By</span>
                        <span
                            data-testid={`track-item-${id}-artist`}
                            className="truncate max-w-[150px] sm:max-w-xs"
                        >
                            {artist}
                        </span>
                        {album && (
                            <>
                                <span className="opacity-70 hidden sm:inline">
                                    •
                                </span>
                                <span className="opacity-70 hidden sm:inline">
                                    Album
                                </span>
                                <span
                                    className="truncate max-w-xs hidden sm:inline"
                                    data-testid={`track-item-${id}-album`}
                                >
                                    {album}
                                </span>
                            </>
                        )}
                        {genres.length > 0 && (
                            <span className="opacity-70 hidden sm:inline">
                                •
                            </span>
                        )}
                        <span className="flex flex-wrap gap-1 mt-1 sm:mt-0">
                            {genres.map((genre, index) => (
                                <span
                                    className="inline-block bg-cyan-600 text-white rounded-full px-1.5 py-0.5 text-xs"
                                    key={index}
                                >
                                    {genre}
                                </span>
                            ))}
                        </span>
                    </p>
                    {/* Track creation date */}
                    <p
                        className="my-0.5 text-gray-400 text-xs hidden sm:block"
                        data-testid={`track-item-${id}-created-at`}
                    >
                        {createdAt.replace("T", " ").slice(0, 19)}
                    </p>
                </div>
            </div>

            {/* Audio player for the track */}
            {isPlaying && audioFile && (
                <div
                    className="w-full order-last sm:order-none sm:flex-1 mt-2 sm:mt-0"
                    data-testid={`audio-player-${id}`}
                >
                    <WavesurferPlayer
                        width="100%"
                        height={50}
                        waveColor="#4f46e5"
                        progressColor="#8a3af9"
                        url={getAudioURL(audioFile)}
                        normalize={true}
                        barWidth={2}
                        onReady={onReady}
                    />
                </div>
            )}

            {/* Action buttons for the track */}
            <div className="flex gap-1 sm:gap-2 flex-shrink-0 w-full sm:w-auto justify-end order-first sm:order-last">
                {/* Play/Pause button */}
                <button
                    onClick={() => onPlay(id)}
                    className={`bg-cyan-600 hover:bg-cyan-500 text-white py-1 px-2 sm:px-3 rounded-lg transition-colors text-sm flex-1 sm:flex-none ${
                        !audioFile ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    disabled={!audioFile}
                    data-testid={
                        isPlaying ? `pause-button-${id}` : `play-button-${id}`
                    }
                >
                    {isPlaying ? "❚❚" : "▶"}
                </button>
                {/* Edit button */}
                <button
                    onClick={() => onEdit(trackData)}
                    className="text-white bg-gray-800 hover:bg-gray-700 py-1 px-2 sm:px-3 rounded-lg transition-colors text-sm flex-1 sm:flex-none"
                    data-testid={`edit-track-${id}`}
                >
                    Edit
                </button>
                {/* Delete button */}
                <button
                    onClick={() => onDelete(id)}
                    className="text-white bg-red-600 hover:bg-red-700 py-1 px-2 sm:px-3 rounded-lg transition-colors text-sm flex-1 sm:flex-none"
                    data-testid={`delete-track-${id}`}
                >
                    Delete
                </button>
            </div>
        </div>
    );
}
