import { useEffect, useState, useCallback } from "react";
import {
    getTracks,
    getGenres,
    deleteTrack,
    deleteTracks,
} from "../services/api";
import Track from "./Track";
import TrackProps, { TrackCardProps } from "../types/track";
import Header from "./Header";
import CreateTrackModal from "./CreateTrackModal";
import EditTrackModal from "./EditTrackModal";
import { useModalState } from "../hooks/useModalState";

export default function TracksList() {
    // -------------------- State Management --------------------

    // Tracks list and metadata
    const [tracks, setTracks] = useState<TrackCardProps[]>([]);
    const [paginationMeta, setPaginationMeta] = useState({
        total: 0,
        totalPages: 0,
    });

    // UI state
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Selection and bulk actions
    const [selectedTrackIds, setSelectedTrackIds] = useState<string[]>([]);
    const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
    const [confirmAction, setConfirmAction] = useState<() => void>(() => {});

    // Modals
    const createModal = useModalState();
    const editModal = useModalState();

    // Current track and playback
    const [currentTrack, setCurrentTrack] = useState<TrackCardProps>();
    const [playingTrackId, setPlayingTrackId] = useState<string | null>(null);

    // Filters and search
    const [params, setParams] = useState({
        search: "",
        sort: "title",
        order: "asc",
        genre: "",
        artist: "",
        page: 1,
        limit: 10,
        totalPages: 1,
    });
    const [genreOptions, setGenreOptions] = useState<string[]>([]);

    // Refresh trigger for re-fetching data
    const [refreshTrigger, setRefreshTrigger] = useState(0);

    // -------------------- API Calls --------------------

    // Fetches tracks with current filters and pagination
    const fetchTracks = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        const query = `tracks?page=${params.page}&limit=${params.limit}&${
            params.search ? `search=${encodeURIComponent(params.search)}&` : ""
        }sort=${params.sort}&order=${params.order}${
            params.genre ? `&genre=${encodeURIComponent(params.genre)}` : ""
        }${
            params.artist ? `&artist=${encodeURIComponent(params.artist)}` : ""
        }`;

        try {
            const data = await getTracks(query);
            setTracks(data.data);
            setPaginationMeta({
                total: data.meta.total,
                totalPages: data.meta.totalPages || 1,
            });
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to fetch tracks"
            );
            setTracks([]);
        } finally {
            setIsLoading(false);
        }
    }, [params]);

    // Fetches available genres for filtering
    const fetchGenres = useCallback(async () => {
        try {
            const genresData = await getGenres();
            setGenreOptions(genresData);
        } catch (err) {
            console.error("Error fetching filter options:", err);
        }
    }, []);

    // -------------------- Handlers --------------------

    // Handles search and filter parameter updates
    const handleSearchParams = (newParams: Partial<typeof params>) => {
        setParams((prev) => ({ ...prev, ...newParams, page: 1 }));
    };

    // Handles pagination changes
    const handlePageChange = (newPage: number) => {
        setParams((prev) => ({ ...prev, page: newPage }));
    };

    // Toggles selection of a single track
    const handleSelectTrack = useCallback((id: string) => {
        setSelectedTrackIds((prev) =>
            prev.includes(id)
                ? prev.filter((trackId) => trackId !== id)
                : [...prev, id]
        );
    }, []);

    // Toggles selection of all tracks
    const handleSelectAll = useCallback(() => {
        if (tracks.every((track) => selectedTrackIds.includes(track.id))) {
            setSelectedTrackIds([]);
        } else {
            setSelectedTrackIds(tracks.map((track) => track.id));
        }
    }, [tracks, selectedTrackIds]);

    // Toggles play/pause for a specific track
    const handlePlayTrack = useCallback(
        (id: string) => {
            if (id === playingTrackId) {
                setPlayingTrackId(null);
            } else {
                setPlayingTrackId(id);
            }
        },
        [playingTrackId]
    );

    // Deletes a single track after confirmation
    const handleDeleteTrack = (id: string) => {
        setIsConfirmDialogOpen(true);
        setConfirmAction(() => async () => {
            try {
                setTracks((prev) => prev.filter((track) => track.id !== id));
                setPaginationMeta((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - 1),
                }));
                if (selectedTrackIds.includes(id)) {
                    setSelectedTrackIds((prev) =>
                        prev.filter((trackId) => trackId !== id)
                    );
                }
                await deleteTrack(id);
            } catch (error) {
                console.error("Error deleting track:", error);
                setError("Failed to delete track. Please try again.");
                setRefreshTrigger((prev) => prev + 1);
            } finally {
                setIsConfirmDialogOpen(false);
            }
        });
    };

    // Deletes selected tracks in bulk after confirmation
    const handleBulkDelete = () => {
        if (selectedTrackIds.length === 0) return;

        setIsConfirmDialogOpen(true);
        setConfirmAction(() => async () => {
            try {
                const tracksToKeep = tracks.filter(
                    (track) => !selectedTrackIds.includes(track.id)
                );
                setTracks(tracksToKeep);
                setPaginationMeta((prev) => ({
                    ...prev,
                    total: Math.max(0, prev.total - selectedTrackIds.length),
                }));
                const deletedTrackIds = [...selectedTrackIds];
                setSelectedTrackIds([]);
                await deleteTracks(deletedTrackIds);
                if (tracksToKeep.length === 0 && params.page > 1) {
                    setParams((prev) => ({ ...prev, page: prev.page - 1 }));
                } else if (tracksToKeep.length === 0) {
                    setRefreshTrigger((prev) => prev + 1);
                }
            } catch (err) {
                console.error("Error deleting tracks:", err);
                setError("Failed to delete selected tracks. Please try again.");
                setRefreshTrigger((prev) => prev + 1);
            } finally {
                setIsConfirmDialogOpen(false);
            }
        });
    };

    // Opens the edit modal for a specific track
    const handleEditTrack = (track: TrackCardProps) => {
        setCurrentTrack(track);
        editModal.open();
    };

    // Updates the track list after editing
    const handleUpdateTrack = (updatedTrack: TrackCardProps) => {
        setTracks((prevTracks) =>
            prevTracks.map((track) =>
                track.id === updatedTrack.id ? updatedTrack : track
            )
        );
        editModal.close();
    };

    // Adds a new track to the list
    const handleTrackCreate = async (newTrack: TrackProps) => {
        try {
            setTracks((prevTracks) => [newTrack, ...prevTracks]);
            setPaginationMeta((prev) => ({ ...prev, total: prev.total + 1 }));
            createModal.close();
        } catch (error) {
            console.error("Error creating track:", error);
            setError("Failed to create track. Please try again.");
        }
    };

    // -------------------- Effects --------------------

    // Fetches tracks when filters or pagination change
    useEffect(() => {
        fetchTracks();
    }, [fetchTracks, refreshTrigger]);

    // Fetches available genres on component mount
    useEffect(() => {
        fetchGenres();
    }, [fetchGenres]);

    // -------------------- Render --------------------

    return (
        <>
            <section className="bg-gray-800 text-gray-300 min-h-screen flex flex-col p-4">
                <Header
                    onChangeParams={handleSearchParams}
                    genreOptions={genreOptions}
                    currentParams={params}
                    onBulkDelete={handleBulkDelete}
                    onSelectAll={handleSelectAll}
                    selectedTrackIds={selectedTrackIds}
                    allSelected={
                        tracks.length > 0 &&
                        tracks.every((track) =>
                            selectedTrackIds.includes(track.id)
                        )
                    }
                />
                <div className="mt-4 flex-1">
                    {isLoading && (
                        <div
                            className="text-center p-4 text-gray-400"
                            data-testid="loading-tracks"
                        >
                            Loading...
                        </div>
                    )}
                    {error && (
                        <div
                            className="text-center p-4 text-red-400"
                            data-testid="toast-error"
                        >
                            Error: {error}
                            <button
                                className="ml-4 text-cyan-400 hover:text-cyan-300"
                                onClick={() => {
                                    setError(null);
                                    setRefreshTrigger((prev) => prev + 1);
                                }}
                            >
                                Retry
                            </button>
                        </div>
                    )}
                    {!isLoading && !error && tracks.length === 0 && (
                        <div className="text-center p-4 text-gray-400">
                            No tracks found
                        </div>
                    )}
                    {!isLoading && !error && tracks.length > 0 && (
                        <div>
                            <ul className="max-h-[calc(100vh-200px)] overflow-y-auto rounded-lg">
                                {tracks.map((track) => (
                                    <li
                                        key={track.id}
                                        className="mb-2 last:mb-0"
                                    >
                                        <Track
                                            {...track}
                                            onDelete={handleDeleteTrack}
                                            onEdit={handleEditTrack}
                                            onPlay={handlePlayTrack}
                                            isPlaying={
                                                track.id === playingTrackId
                                            }
                                            isSelected={selectedTrackIds.includes(
                                                track.id
                                            )}
                                            onSelect={() =>
                                                handleSelectTrack(track.id)
                                            }
                                        />
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
                <footer
                    className="sticky bottom-0 bg-gray-900 p-4 border-t border-gray-700 mt-4 -mx-4"
                    data-testid="pagination"
                >
                    <div className="flex justify-between w-full flex-wrap gap-4">
                        <div className="flex flex-1 justify-center items-center gap-[5vw]">
                            <button
                                onClick={() =>
                                    handlePageChange(params.page - 1)
                                }
                                disabled={params.page === 1}
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                data-testid="pagination-prev"
                            >
                                Previous
                            </button>

                            <span className="text-white">
                                Page {params.page} of{" "}
                                {paginationMeta.totalPages} (Total:{" "}
                                {paginationMeta.total})
                            </span>

                            <button
                                onClick={() =>
                                    handlePageChange(params.page + 1)
                                }
                                disabled={
                                    params.page >= paginationMeta.totalPages
                                }
                                className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                                data-testid="pagination-next"
                            >
                                Next
                            </button>
                        </div>

                        <button
                            onClick={createModal.open}
                            className="bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2 rounded-full shadow transition-colors"
                            data-testid="create-track-button"
                        >
                            +
                        </button>
                    </div>
                </footer>
            </section>

            {isConfirmDialogOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    data-testid="confirm-dialog"
                >
                    <div className="bg-gray-800 text-white p-6 rounded-lg shadow-lg w-full max-w-sm">
                        <h2 className="text-lg font-bold mb-4">
                            Are you sure you want to delete?
                        </h2>
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setIsConfirmDialogOpen(false)}
                                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg"
                                data-testid="cancel-delete"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmAction}
                                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                                data-testid="confirm-delete"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {createModal.isOpen && (
                <CreateTrackModal
                    isOpen={createModal.isOpen}
                    onClose={createModal.close}
                    onCreate={handleTrackCreate}
                    onFileUpload={fetchTracks}
                />
            )}

            {editModal.isOpen && currentTrack && (
                <EditTrackModal
                    isOpen={editModal.isOpen}
                    onClose={editModal.close}
                    track={currentTrack}
                    onUpdate={handleUpdateTrack}
                    onFileUpload={fetchTracks}
                />
            )}
        </>
    );
}
