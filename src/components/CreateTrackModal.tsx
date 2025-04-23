import { useState, useEffect } from "react";
import { createTrack, getGenres, uploadTrackFile } from "../services/api";
import TrackProps from "../types/track";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    onFileUpload: () => void;
    onCreate: (newTrack: TrackProps) => void;
}

export default function CreateTrackModal({
    isOpen,
    onClose,
    onFileUpload,
    onCreate,
}: Props) {
    // Form state for creating a new track
    const [form, setForm] = useState({
        title: "",
        artist: "",
        album: "",
        genres: [] as string[],
        coverImage: "",
        audioFile: null as File | null,
    });

    // List of available genres for the genre selector
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    // Tracks error messages
    const [error, setError] = useState<string | null>(null);

    // Fetches available genres when the modal is opened
    useEffect(() => {
        if (isOpen) {
            getGenres()
                .then((genres) => setAvailableGenres(genres))
                .catch((error: string | null) => setError(error));
        }
    }, [isOpen]);

    // Updates form fields when the user types
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    // Adds a genre to the form's genres array
    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGenre = e.target.value;
        if (selectedGenre && !form.genres.includes(selectedGenre)) {
            setForm({ ...form, genres: [...form.genres, selectedGenre] });
        }
    };

    // Removes a genre from the form's genres array
    const removeGenre = (genre: string) => {
        setForm({ ...form, genres: form.genres.filter((g) => g !== genre) });
    };

    // Handles file selection for the audio file
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!["audio/mpeg", "audio/wav"].includes(file.type)) {
                setError("File must be mp3 or wav");
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                setError("File size must be less than 10MB");
                return;
            }
            setForm({ ...form, audioFile: file });
            setError(null);
        }
    };

    // Validates the cover image URL
    const validateImageUrl = (url: string) => {
        const urlPattern = /^(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))$/i;
        return urlPattern.test(url);
    };

    // Submits the form to create a new track
    const handleSubmit = async () => {
        if (!form.title || !form.artist) {
            setError("Track title and artist are required");
            return;
        }

        if (form.coverImage && !validateImageUrl(form.coverImage)) {
            setError(
                "Cover image URL must be a valid image URL (png, jpg, jpeg, gif, webp)"
            );
            return;
        }

        try {
            const newTrack = await createTrack(
                form.title,
                form.artist,
                form.album,
                form.genres,
                form.coverImage ||
                    "https://upload.wikimedia.org/wikipedia/en/5/57/RecordWithoutACover.png"
            );

            // Uploads the audio file if it has been selected
            if (form.audioFile) {
                await uploadTrackFile(String(newTrack?.id), form.audioFile);
                onFileUpload();
            }

            onCreate(newTrack);
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Error");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <h2
                    className="text-xl font-bold mb-4"
                    data-testid="modal-title"
                >
                    New track
                </h2>

                <div className="space-y-4" data-testid="track-form">
                    {/* Title input */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Track title"
                        value={form.title}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        data-testid="input-title"
                    />
                    {/* Artist input */}
                    <input
                        type="text"
                        name="artist"
                        placeholder="Artist"
                        value={form.artist}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        data-testid="input-artist"
                    />
                    {/* Album input */}
                    <input
                        type="text"
                        name="album"
                        placeholder="Album"
                        value={form.album}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        data-testid="input-album"
                    />
                    {/* Genre selector */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            htmlFor="genre-selector"
                        >
                            Genres
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {form.genres.map((genre) => (
                                <span
                                    key={genre}
                                    className="bg-cyan-600 text-white px-2 py-1 rounded-full flex items-center gap-1"
                                    data-testid={`genre-tag-${genre}`}
                                >
                                    {genre}
                                    <button
                                        type="button"
                                        onClick={() => removeGenre(genre)}
                                        className="text-white hover:text-gray-200 transition-colors"
                                    >
                                        ✕
                                    </button>
                                </span>
                            ))}
                        </div>
                        <select
                            id="genre-selector"
                            onChange={(e) => {
                                handleGenreChange(e);
                                e.target.value = ""; // скидання вибору
                            }}
                            className="max-w-screen w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 mt-2"
                            defaultValue=""
                            data-testid="genre-selector"
                        >
                            <option value="" disabled>
                                Choose a genre
                            </option>
                            {availableGenres.map((genre) => (
                                <option
                                    key={genre}
                                    value={genre}
                                    data-testid={`genre-option-${genre}`}
                                >
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Cover image input */}
                    <input
                        type="text"
                        name="coverImage"
                        placeholder="Cover URL (png, jpg, jpeg, gif, webp)"
                        value={form.coverImage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        data-testid="input-cover-image"
                    />
                    {/* Audio file upload */}
                    <div>
                        <label
                            className="block text-sm font-medium mb-2"
                            htmlFor="upload-track"
                        >
                            Add audio
                        </label>
                        <input
                            type="file"
                            id="upload-track"
                            accept="audio/mpeg, audio/wav"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                            data-testid="upload-track"
                        />
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="text-red-400 mt-4 text-sm"
                        data-testid="error-message"
                    >
                        {error}
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                        data-testid="cancel-button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-700 transition-colors"
                        data-testid="submit-button"
                    >
                        Save
                    </button>
                </div>
            </div>
        </div>
    );
}
