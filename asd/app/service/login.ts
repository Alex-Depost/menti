import { API_URL } from "./config";

async function baseLogin(email: string, password: string, path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (Array.isArray(errorData.detail)) {
      const error = errorData.detail[0];
      const field = error.loc[error.loc.length - 1];
      throw new Error(`${field}: ${error.msg}`);
    }
    throw new Error(errorData.detail);
  }

  const data = await response.json();
  console.log('Успешный вход:', data);
  return data;
}

async function baseRegister(email: string, password: string, path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  if (!response.ok) {
    const errorData = await response.json();
    if (Array.isArray(errorData.detail)) {
      const error = errorData.detail[0];
      const field = error.loc[error.loc.length - 1];
      throw new Error(`${field}: ${error.msg}`);
    }
    throw new Error(errorData.detail);
  }

  const data = await response.json();
  return data;
}

export { baseLogin, baseRegister };
