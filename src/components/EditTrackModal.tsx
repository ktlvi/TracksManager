import { useState, useEffect } from "react";
import {
    updateTrack,
    getGenres,
    uploadTrackFile,
    deleteAudiofile,
} from "../services/api";
import { TrackCardProps } from "../types/track";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    track: TrackCardProps;
    onUpdate: (updatedTrack: TrackCardProps) => void;
    onFileUpload: (fileUrl: string) => void;
}

export default function EditTrackModal({
    isOpen,
    onClose,
    track,
    onUpdate,
    onFileUpload,
}: Props) {
    // Form state for editing the track
    const [form, setForm] = useState({
        title: "",
        artist: "",
        album: "",
        genres: [] as string[],
        coverImage: "",
        audioFile: null as File | null,
    });

    // Available genres for the genre selector
    const [availableGenres, setAvailableGenres] = useState<string[]>([]);
    // Tracks error messages
    const [error, setError] = useState<string | null>(null);
    // Tracks whether the audio file has been deleted
    const [isDeletedFile, setIsDeletedFile] = useState(false);

    // Initializes the form with the track's data when the modal opens
    useEffect(() => {
        if (isOpen && track) {
            setForm({
                title: track.title,
                artist: track.artist,
                album: track.album || "",
                genres: [...(track.genres || [])],
                coverImage:
                    typeof track.coverImage === "string"
                        ? track.coverImage
                        : "",
                audioFile: null,
            });

            // Fetches available genres for the genre selector
            getGenres()
                .then((genres) => setAvailableGenres(genres))
                .catch(() => setError("Error during genres download"));
        }
    }, [isOpen, track]);

    // Updates form fields when the user types
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleDeleteFile = async () => {
        if (!isDeletedFile) {
            try {
                await deleteAudiofile(track.id);
                setIsDeletedFile(true);
            } catch (e) {
                setError("Error deleting audio file" + e);
            }
        }
    };

    // Adds a genre to the form's genres array
    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedGenre = e.target.value;
        if (!form.genres.includes(selectedGenre)) {
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

    // Submits the form to update the track
    const handleSubmit = async () => {
        if (!form.title || !form.artist) {
            setError("Title and artist are required");
            return;
        }

        if (form.coverImage && !/^https?:\/\//.test(form.coverImage)) {
            setError("Incorrect image link");
            return;
        }

        try {
            const updatedTrack = await updateTrack(
                String(track.id),
                form.title,
                form.artist,
                form.album,
                form.genres,
                form.coverImage
            );

            // Uploads the audio file if it has been changed
            if (form.audioFile) {
                const uploadedFile = await uploadTrackFile(
                    String(track.id),
                    form.audioFile
                );
                onFileUpload(uploadedFile.fileUrl);
            }

            onUpdate(updatedTrack);
            onClose();
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Editing error");
        }
    };

    const handleClose = () => {
        onClose();
        setIsDeletedFile(false);
        setError(null);
        setForm({
            title: "",
            artist: "",
            album: "",
            genres: [],
            coverImage: "",
            audioFile: null,
        });
    };

    const handleSave = async () => {
        await handleSubmit();
        setIsDeletedFile(false);
    };
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4"
            data-testid="track-form"
        >
            <div className="bg-gray-800 text-white p-6 rounded-lg w-full max-w-md shadow-lg">
                <h2
                    className="text-xl font-bold mb-4"
                    data-testid="modal-title"
                >
                    Edit track
                </h2>

                <div className="space-y-4">
                    {/* Title input */}
                    <input
                        type="text"
                        name="title"
                        placeholder="Title"
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
                        <label className="block text-sm font-medium mb-2">
                            Genres
                        </label>
                        <div className="flex gap-2 flex-wrap">
                            {form.genres.map((genre) => (
                                <span
                                    key={genre}
                                    className="bg-cyan-600 text-white px-2 py-1 rounded-full flex items-center gap-1"
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
                            onChange={handleGenreChange}
                            className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500 mt-2"
                            defaultValue=""
                            data-testid="genre-selector"
                        >
                            <option value="" disabled>
                                Choose a genre
                            </option>
                            {availableGenres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                    {/* Cover image input */}
                    <input
                        type="text"
                        name="coverImage"
                        placeholder="Image URL"
                        value={form.coverImage}
                        onChange={handleChange}
                        className="w-full px-3 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:ring-cyan-500 focus:border-cyan-500"
                        data-testid="input-cover-image"
                    />
                    {/* Audio file upload */}
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Upload audiofile
                        </label>
                        <input
                            type="file"
                            accept="audio/mpeg, audio/wav"
                            onChange={handleFileChange}
                            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-cyan-600 file:text-white hover:file:bg-cyan-700"
                            data-testid="upload-track"
                        />
                        <button
                            onClick={handleDeleteFile}
                            className={`px-4 py-2 mt-1 rounded-lg ${
                                track.audioFile && !isDeletedFile
                                    ? " bg-red-600 hover:bg-red-700"
                                    : "bg-gray-600"
                            } transition-colors`}
                        >
                            Delete audiofile
                        </button>
                    </div>
                </div>

                {/* Error message */}
                {error && (
                    <div
                        className="text-red-400 mt-4 text-sm"
                        data-testid="error-title"
                    >
                        {error}
                    </div>
                )}

                {/* Action buttons */}
                <div className="mt-6 flex justify-end gap-3">
                    <button
                        onClick={() => {
                            handleClose();
                            setIsDeletedFile(false);
                        }}
                        className="px-4 py-2 rounded-lg bg-gray-600 hover:bg-gray-700 transition-colors"
                        data-testid="cancel-delete"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
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
