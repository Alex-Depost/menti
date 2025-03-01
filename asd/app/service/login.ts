import { API_URL } from "./config";

async function login(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/users/signin`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Успешный вход:', data);
    return data;
  } catch (error) {
    console.error('Ошибка входа:', error);
  }
}

async function register(email: string, password: string) {
  try {
    const response = await fetch(`${API_URL}/auth/users/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      throw new Error(`Ошибка ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Регистрация успешна:', data);
    return data;
  } catch (error) {
    console.error('Ошибка регистрации:', error);
  }
}

export { login, register };
