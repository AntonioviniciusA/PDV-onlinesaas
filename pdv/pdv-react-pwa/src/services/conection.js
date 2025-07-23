import axios from "axios";

export const baseUrl = axios.create({
  baseURL: `${process.env.REACT_APP_URL_API_PDV}/local`,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiSaas = axios.create({
  baseURL: `${process.env.REACT_APP_URL_API_SAAS}/saas`,
  headers: {
    "Content-Type": "application/json",
  },
});

baseUrl.interceptors.response.use((response) => response);

apiSaas.interceptors.response.use((response) => response);
