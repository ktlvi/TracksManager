import { useState } from "react";

interface HeaderProps {
    onChangeParams: (params: Partial<HeaderProps["currentParams"]>) => void;
    genreOptions: string[];
    currentParams: {
        search: string;
        sort: string;
        order: string;
        genre: string;
        artist: string;
    };
    onBulkDelete: () => void;
    onSelectAll: () => void;
    selectedTrackIds: string[];
    allSelected: boolean;
}

export default function Header({
    onChangeParams,
    genreOptions,
    currentParams,
    onBulkDelete,
    onSelectAll,
    selectedTrackIds,
    allSelected,
}: HeaderProps) {
    // Tracks the current search term
    const [searchTerm, setSearchTerm] = useState(currentParams.search);
    // Toggles the visibility of the filter section
    const [showFilters, setShowFilters] = useState(false);

    // Updates the search parameter when the form is submitted
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        onChangeParams({ search: searchTerm });
    };

    // Updates the sort parameter
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeParams({ sort: e.target.value });
    };

    // Updates the order parameter
    const handleOrderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeParams({ order: e.target.value });
    };

    // Updates the genre filter
    const handleGenreChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        onChangeParams({ genre: e.target.value });
    };

    // Updates the artist filter
    const handleArtistChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        onChangeParams({ artist: e.target.value });
    };

    return (
        <header className="bg-gray-800 mb-6" data-testid="tracks-header">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
                {/* Search and main actions */}
                <div className="flex-1">
                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            handleSearch(e);
                        }}
                        className="flex gap-2"
                    >
                        <div className="relative flex-1">
                            {/* Search input */}
                            <input
                                type="search"
                                className="bg-gray-700 text-white w-full px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-500 pl-10"
                                placeholder="Search tracks..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                data-testid="search-input"
                            />
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                                />
                            </svg>
                        </div>
                        {/* Search button */}
                        <button
                            type="submit"
                            className="bg-cyan-600 hover:bg-cyan-500 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                        >
                            Search
                        </button>
                        {/* Toggle filters button */}
                        <button
                            type="button"
                            onClick={() => setShowFilters(!showFilters)}
                            className="bg-gray-700 hover:bg-gray-600 text-white px-3 rounded-lg transition-colors flex items-center justify-center"
                            aria-label="Toggle filters"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                                />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Selection and bulk actions */}
                <div className="flex items-center gap-3 min-w-fit">
                    <div className="flex items-center">
                        <div className="relative inline-flex items-center">
                            {/* Select all checkbox */}
                            <input
                                type="checkbox"
                                id="select-all"
                                checked={allSelected}
                                onChange={onSelectAll}
                                className="w-5 h-5 rounded border-gray-400 text-cyan-600 focus:ring-cyan-500 mr-2"
                                data-testid="select-all"
                            />
                            <label
                                htmlFor="select-all"
                                className="text-sm text-gray-300 whitespace-nowrap mr-2"
                            >
                                Select All
                            </label>
                        </div>
                    </div>

                    {/* Bulk delete button */}
                    {selectedTrackIds.length > 0 && (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={onBulkDelete}
                                disabled={selectedTrackIds.length === 0}
                                className="group relative bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-all duration-150 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                data-testid="bulk-delete-button"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-4 w-4"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                </svg>
                                Delete
                                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-800 text-xs text-white group-hover:bg-red-900">
                                    {selectedTrackIds.length}
                                </span>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Filter section */}
            {showFilters && (
                <div className="bg-gray-700 p-4 rounded-lg mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">
                            Sort By
                        </label>
                        <select
                            value={currentParams.sort}
                            onChange={handleSortChange}
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            data-testid="sort-select"
                        >
                            <option value="title">Title</option>
                            <option value="artist">Artist</option>
                            <option value="createdAt">Created At</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">
                            Order
                        </label>
                        <select
                            value={currentParams.order}
                            onChange={handleOrderChange}
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            data-testid="sort-select"
                        >
                            <option value="asc">Ascending</option>
                            <option value="desc">Descending</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">
                            Genre
                        </label>
                        <select
                            value={currentParams.genre}
                            onChange={handleGenreChange}
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            data-testid="filter-genre"
                        >
                            <option value="">All Genres</option>
                            {genreOptions.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-gray-400 text-sm mb-1">
                            Artist
                        </label>
                        <input
                            type="text"
                            value={currentParams.artist}
                            onChange={handleArtistChange}
                            placeholder="Filter by artist..."
                            className="w-full bg-gray-800 text-white px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-cyan-500"
                            data-testid="filter-artist"
                        />
                    </div>
                </div>
            )}
        </header>
    );
}
