const API_URL = process.env.MODE ? '/api' : 'http://localhost:8000';

// URL для получения аватаров пользователей
const AVATAR_URL = `${API_URL}/img`;

export { API_URL, AVATAR_URL };