// import * as axios from 'axios';
// import { merchant_id, secret_key, xsec } from './constants';
// // import { baseURL } from "./constants";

// const axiosInstance = axios.default?.create({
//   baseURL: 'http://localhost:8111/api/v1',
//   headers: {
//     'Content-Type': 'application/json',
//     merchant_id: merchant_id,
//     secret_key: secret_key,
//     'X-Custom-Auth-Token': xsec,
//     Authorization: 'Bearer ' + secret_key,
//   },
// });

// // axiosInstance.interceptors.request.use(async (req: any) => {
// //   try {
// //     const accessToken = localStorage.getItem("x-toks");
// //     if (accessToken) {
// //       req.headers.Authorization = `Bearer ${accessToken}`;
// //     }
// //     return req;
// //   } catch (error) {
// //     // console.log('request: ', error.response.status)
// //     return Promise.reject(error);
// //   }
// // });

// export default axiosInstance;
