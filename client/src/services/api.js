import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
});

api.interceptors.request.use((config) => {
  const url = config.url || "";
  const driverToken = localStorage.getItem("quickcargo_driver_token");
  const userToken = localStorage.getItem("quickcargo_token");
  const isDriverProtected =
    url.startsWith("/drivers/") && !url.includes("/drivers/login");

  if (isDriverProtected && driverToken) {
    config.headers.Authorization = `Bearer ${driverToken}`;
  } else if (userToken) {
    config.headers.Authorization = `Bearer ${userToken}`;
  }
  return config;
});

export default api;
