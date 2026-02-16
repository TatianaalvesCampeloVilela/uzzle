const API = "http://127.0.0.1:3333";

export async function getCashflow(period: string) {
  const res = await fetch(`${API}/cashflow/${period}`);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || "Erro ao buscar cashflow");
  }

  return res.json();
}
