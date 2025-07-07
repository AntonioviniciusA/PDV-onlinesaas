import { openDB } from "idb";

const DB_NAME = "DominusPDV";
const STORE_NAME = "cupons";

export async function salvarCupomOffline(cupom) {
  try {
    const db = await openDB(DB_NAME, 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      },
    });

    const id = await db.add(STORE_NAME, {
      ...cupom,
      timestamp: new Date().toISOString(),
      status: "pendente",
    });

    console.log("Cupom salvo offline com ID:", id);
    return id;
  } catch (error) {
    console.error("Erro ao salvar cupom offline:", error);
    throw error;
  }
}

export async function recuperarCuponsOffline() {
  try {
    const db = await openDB(DB_NAME, 1);
    return await db.getAll(STORE_NAME);
  } catch (error) {
    console.error("Erro ao recuperar cupons offline:", error);
    return [];
  }
}

export async function limparCuponsOffline() {
  try {
    const db = await openDB(DB_NAME, 1);
    await db.clear(STORE_NAME);
    console.log("Cupons offline limpos com sucesso");
  } catch (error) {
    console.error("Erro ao limpar cupons offline:", error);
    throw error;
  }
}

export async function removerCupomOffline(id) {
  try {
    const db = await openDB(DB_NAME, 1);
    await db.delete(STORE_NAME, id);
    console.log("Cupom removido do cache offline:", id);
  } catch (error) {
    console.error("Erro ao remover cupom offline:", error);
    throw error;
  }
}

export async function contarCuponsOffline() {
  try {
    const db = await openDB(DB_NAME, 1);
    return await db.count(STORE_NAME);
  } catch (error) {
    console.error("Erro ao contar cupons offline:", error);
    return 0;
  }
}
