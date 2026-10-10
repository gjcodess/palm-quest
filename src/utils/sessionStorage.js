export const SESSION_KEY = 'palmquest_session_v1';

export const readSession = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(SESSION_KEY));
    return saved?.version === 1 && saved.values && typeof saved.values === 'object' && !Array.isArray(saved.values)
      ? saved.values : {};
  } catch {
    return {};
  }
};

export const saveSessionValue = (key, value) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ version: 1, values: { ...readSession(), [key]: value } }));
  } catch (error) {
    console.warn('Unable to save laboratory progress:', error);
  }
};

export const clearSession = (prefix) => {
  try {
    if (!prefix) {
      localStorage.removeItem(SESSION_KEY);
      return;
    }
    const values = readSession();
    for (const key of Object.keys(values)) {
      if (key.startsWith(`${prefix}.`)) delete values[key];
    }
    localStorage.setItem(SESSION_KEY, JSON.stringify({ version: 1, values }));
  } catch (error) {
    console.warn('Unable to clear laboratory progress:', error);
  }
};
