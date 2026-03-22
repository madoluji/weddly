import { useState, useEffect } from "react";
import { fetchWithAuth } from "../lib/fetchWIthAuth";

interface FetchState<T> {
    data: T | null;
    loading: boolean;
    error: string | null;
}
const API_BASE_URL = '/api';


const useFetch = <T>(endpoint: string) => {
    const [state, setState] = useState<FetchState<T>>({
        data: null,
        loading: true,
        error: null,
    });

    useEffect(() => {
        const fetchData = async () => {
            setState({ data: null, loading: true, error: null }); // Reset state
            try {
                const fullUrl = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
                const response = await fetchWithAuth(fullUrl);
                if (!response.ok) {
                    throw new Error(`Failed to fetch data: ${response.statusText}`);
                }
                const data: T = await response.json();
                setState({ data, loading: false, error: null });
            } catch (error: any) {
                setState({ data: null, loading: false, error: error.message });
            }
        };

        fetchData();
    }, [endpoint]);

    return state;
};

export default useFetch;
