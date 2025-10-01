const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001/api";

interface RequestOptions extends RequestInit {
  token?: string;
}

export const api = async (endpoint: string, { token, headers, ...customConfig }: RequestOptions = {}) => {
  const config: RequestInit = {
    method: customConfig.method || (customConfig.body ? "POST" : "GET"),
    headers: {
      ...(customConfig.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...headers,
    },
    ...customConfig,
  };

  if (token) {
    config.headers = { ...config.headers, Authorization: `Bearer ${token}` };
  }

  const response = await fetch(`${API_BASE_URL}/${endpoint}`, config);

  if (response.ok) {
    // Handle cases where response is empty
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      return await response.json();
    } else {
      return {}; // Or handle as appropriate
    }
  } else {
    const contentType = response.headers.get("content-type");
    let error;
    if (contentType && contentType.indexOf("application/json") !== -1) {
      error = await response.json();
    } else {
      const textError = await response.text();
      error = { message: textError };
    }
    return Promise.reject(error);
  }
};

export const setAuthToken = (token: string | null) => {
  if (token) {
    localStorage.setItem("token", token);
  } else {
    localStorage.removeItem("token");
  }
};

export const getAuthToken = (): string | null => {
  return localStorage.getItem("token");
};
