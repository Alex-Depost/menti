import { API_URL } from "./config";

export interface Mentor {
    id: number;
    name: string;
    email: string;
}

export interface FeedItem {
    id: number;
    title: string;
    description: string;
    mentor: Mentor;
}

export interface FeedResponse {
    items: FeedItem[];
    total: number;
    page: number;
    size: number;
    pages: number;
}

const getFeed = async (page = 1, size = 10): Promise<FeedResponse> => {
    try {
        // Build URL with query parameters
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('size', size.toString());

        const url = `${API_URL}/feed/?${params.toString()}`;
        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch feed:', error);
        return {
            items: [],
            total: 0,
            page: 0,
            size: 0,
            pages: 0
        };
    }
};

const feedService = {
    getFeed
};

export default feedService;
