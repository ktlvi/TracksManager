import axios from "axios";

const apiURL = "http://localhost:8000/api/";

const api = axios.create({
    baseURL: apiURL,
    timeout: 5000,
});

export const getTracks = async (value: string) => {
    try {
        const response = await api.get(value);
        return response.data;
    } catch (error) {
        console.error("Error fetching tracks:", error);
        throw error;
    }
};

export const getGenres = async () => {
    try {
        const response = await api.get("genres");
        return response.data;
    } catch (error) {
        console.error("Error fetching genres:", error);
        throw error;
    }
};

export const deleteTrack = async (id: string) => {
    return api.delete(`tracks/${id}`);
};

export const createTrack = async (
    title: string,
    artist: string,
    album: string,
    genres: string[],
    coverImage: string
) => {
    try {
        const response = await api.post("tracks", {
            title: title,
            artist: artist,
            album: album,
            genres: genres,
            coverImage: coverImage,
        });
        return response.data;
    } catch (error: unknown) {
        console.error(
            "Error creating track:",
            (axios.isAxiosError(error) && error.response?.data) ||
                (error instanceof Error ? error.message : "Unknown error")
        );
        throw error;
    }
};

export const updateTrack = async (
    id: string,
    title: string,
    artist: string,
    album: string,
    genres: string[],
    coverImage: string
) => {
    try {
        const response = await api.put(
            `tracks/${id}`,
            {
                title: title,
                artist: artist,
                album: album,
                genres: genres,
                coverImage: coverImage,
            },
            {
                headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error(
            "Error updating track:",
            (axios.isAxiosError(error) && error.response?.data) ||
                (error instanceof Error ? error.message : "Unknown error")
        );
        throw error;
    }
};

export const uploadTrackFile = async (id: string, file: File) => {
    try {
        const formData = new FormData();
        formData.append("audioFile", file);

        const response = await api.post(`tracks/${id}/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });

        console.log("File uploaded successfully:", response.data);
        return response.data;
    } catch (error) {
        console.error(
            "Error uploading file:",
            (axios.isAxiosError(error) && error.response?.data) ||
                (error instanceof Error ? error.message : "Unknown error")
        );
        throw error;
    }
};

export const deleteTracks = async (tracks: string[]) => {
    try {
        await api.post("tracks/delete", {
            ids: tracks,
        });
    } catch (error) {
        console.log(error);
    }
};
export const deleteAudiofile = async (id: string) => {
    try {
        await api.delete(`tracks/${id}/file`);
    } catch (error) {
        console.log(error);
    }
};
export const getAudioURL = function (file: string) {
    const url = `${apiURL}files/${file}`;
    return url;
};
