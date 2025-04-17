import axios from "axios";

const API_URL = "http://192.168.68.234:8000/data-requests";

// Initialize connection when page loads
export const initializeConnection = async () => {
  console.log("Initializing connection...");
  try {
    await axios.post(`${API_URL}/initialize`);
  } catch (error) {
    console.error("Failed to initialize connection:", error);
  }
};

// Close connection when page/tab is closed
export const closeConnection = async () => {
  console.log("Closing connection...");
  try {
    await axios.post(`${API_URL}/shutdown`);
  } catch (error) {
    console.error("Failed to close connection:", error);
  }
};

// Fetch data from FastAPI
export const fetchData = async (query, offset = 0, limit = 10) => {
  try {
    const response = await axios.post(API_URL, {
      user_query: query,
      offset,
      limit,
    });
    return response.data.Table_result || [];
  } catch (error) {
    console.error("Error fetching data:", error.response?.data || error);
    throw error;
  }
};
