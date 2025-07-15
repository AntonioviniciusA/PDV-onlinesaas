// Armazenamento temporário em memória
let cuponsTemp = [];

export async function salvarCupomOffline(cupom) {
  // Salva apenas em memória por enquanto
  const id = cuponsTemp.length + 1;
  cuponsTemp.push({
    ...cupom,
    id,
    timestamp: new Date().toISOString(),
    status: "pendente",
  });
  console.log("Cupom salvo temporariamente (memória) com ID:", id);
  return id;
}

export async function recuperarCuponsOffline() {
  // Retorna os cupons salvos em memória
  return cuponsTemp;
}

export async function limparCuponsOffline() {
  // Limpa apenas o array em memória
  cuponsTemp = [];
  console.log("Cupons temporários limpos com sucesso");
}

export async function removerCupomOffline(id) {
  // Remove do array em memória
  cuponsTemp = cuponsTemp.filter((c) => c.id !== id);
  console.log("Cupom removido do armazenamento temporário:", id);
}

export async function contarCuponsOffline() {
  return cuponsTemp.length;
}

export async function getCupomOffline(id) {
  return cuponsTemp.find((c) => c.id === id);
}

export async function imprimirCupomOffline(cupom) {
  try {
    const response = await fetch("http://localhost:5000/cupom/imprimir", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cupom),
    });
    if (!response.ok) throw new Error("Erro ao imprimir cupom");
    return await response.json();
  } catch (err) {
    console.error("Erro ao chamar backend para imprimir cupom:", err);
    throw err;
  }
}
