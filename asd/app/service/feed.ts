import { authService } from "./auth";
import { API_URL } from "./config";

export interface FeedItem {
    id: number;
    login: string | null;
    name: string;
    title: string | null;
    description: string | null;
    university?: string | null;
    target_universities?: string[];
    admission_type?: string | null;
    email: string | null;
    avatar_url: string | null;
    avatar_uuid?: string;
}

export interface FeedResponse {
    items: FeedItem[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

const getMentorsFeed = async (page = 1, size = 10): Promise<FeedResponse> => {
    try {
        // Build URL with query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());

        const url = `${API_URL}/feed/mentors/?${params.toString()}`;

        // Get auth token
        const token = authService.getToken();

        // Prepare headers
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        return {
            items: [],
            total: 0,
            page: 0,
            size: 0,
            pages: 0
        };
    }
};

const getUsersFeed = async (page = 1, size = 10): Promise<FeedResponse> => {
    try {
        // Build URL with query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());

        const url = `${API_URL}/feed/users/?${params.toString()}`;
        // Get auth token
        const token = authService.getToken();

        // Prepare headers
        const headers: HeadersInit = {};
        if (token) {
            headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(url, {
            headers
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        return {
            items: [],
            total: 0,
            page: 0,
            size: 0,
            pages: 0
        };
    }
};

// Legacy function for backward compatibility
const getFeed = async (page = 1, size = 10): Promise<FeedResponse> => {
    return getMentorsFeed(page, size);
};

const feedService = {
    getFeed,
    getMentorsFeed,
    getUsersFeed
};

export default feedService;
