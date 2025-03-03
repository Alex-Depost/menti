const API_URL = process.env.MODE ? '/api' : 'http://prod-team-12-lc5mhpv9.final.prodcontest.ru/api';

// URL для получения аватаров пользователей
const AVATAR_URL = `${API_URL}/img`;

export { API_URL, AVATAR_URL };