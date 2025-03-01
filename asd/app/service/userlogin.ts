import { API_URL } from "./config";

async function userLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/users/signin`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail);
  }

  const data = await response.json();
  console.log('Успешный вход:', data);
  return data;
}

async function userRegister(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/users/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail);
  }

  const data = await response.json();
  return data;
}

export { userLogin, userRegister };
