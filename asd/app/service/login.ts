import { API_URL } from "./config";

async function baseLogin(login: string, path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ login, password: "1" })
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

async function baseRegister(name: string, path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name })
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
  return data; // Возвращает { access_token: "string", token_type: "string" }
}

export { baseLogin, baseRegister };
