import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const http = axios.create({ baseURL: API_BASE_URL });

export const api = {
addTrade: async (trade) => {
const res = await http.post('/trades', trade);
return res.data;
},
getPositions: async () => {
const res = await http.get('/positions');
return res.data;
},
getPnL: async () => {
const res = await http.get('/pnl');
return res.data;
},
};