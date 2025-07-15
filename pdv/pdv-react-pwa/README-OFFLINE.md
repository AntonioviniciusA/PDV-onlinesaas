# 🚀 Funcionalidade Offline - Dominus PDV

Este documento explica como funciona a funcionalidade offline implementada no PDV.

## ✨ Funcionalidades

### 🔄 Sincronização Automática

- **Salvamento offline**: Cupons são salvos localmente quando não há conexão
- **Sincronização automática**: Dados são enviados automaticamente quando a conexão volta
- **Notificações**: Alertas sobre o status da sincronização

### 📱 PWA Offline

- **Página offline**: Interface amigável quando não há conexão
- **Service Worker**: Cache inteligente para funcionamento offline
- **IndexedDB**: Armazenamento local dos dados

## 🛠️ Como Usar

### 1. Configuração da API

Edite o arquivo `src/utils/api-config.js` para configurar sua API:

```javascript
export const API_CONFIG = {
  BASE_URL: "http://sua-api.com", // URL da sua API
  // ... outras configurações
};
```

### 2. Variáveis de Ambiente (Opcional)

Crie um arquivo `.env` na raiz do projeto:

```env
REACT_APP_API_URL=http://sua-api.com
```

### 3. Uso Normal

O sistema funciona automaticamente:

- ✅ **Online**: Cupons são enviados diretamente para a API
- ⚠️ **Offline**: Cupons são salvos localmente
- 🔄 **Reconexão**: Sincronização automática dos dados pendentes

## 📊 Status da Conexão

### Indicadores Visuais

- 🟢 **Verde**: Online e sincronizado
- 🟡 **Amarelo**: Offline (funcionando localmente)
- 🔵 **Azul**: Cupons pendentes para sincronização

### Notificações

- **Push notifications**: Quando disponíveis
- **Alertas**: Fallback para navegadores sem suporte

## 🔧 Estrutura dos Arquivos

```
src/
├── utils/
│   ├── cupomStorage.js      # Gerenciamento do IndexedDB
│   └── api-config.js        # Configuração da API
├── hooks/
│   └── use-offline-sync.js  # Hook para sincronização
├── components/
│   └── offline-status.jsx   # Componente de status
└── service-worker.js        # Service Worker atualizado
public/
└── offline.html             # Página offline
```

## 📋 Dados Salvos Offline

Cada cupom salvo contém:

```javascript
{
  id: "timestamp",
  timestamp: "2024-01-01T10:00:00.000Z",
  items: [...],           // Produtos do carrinho
  total: 100.00,          // Valor total
  discount: 10,           // Desconto aplicado
  paymentMethod: "pix",   // Método de pagamento
  user: {...},            // Dados do usuário
  // ... outros dados da venda
}
```

## 🚨 Troubleshooting

### Problema: Cupons não sincronizam

**Solução**: Verifique:

1. URL da API configurada corretamente
2. API respondendo no endpoint `/api/cupom`
3. Permissões de notificação concedidas

### Problema: Dados não salvam offline

**Solução**: Verifique:

1. Service Worker registrado
2. IndexedDB funcionando no navegador
3. Permissões de armazenamento

### Problema: Página offline não aparece

**Solução**: Verifique:

1. Arquivo `offline.html` na pasta `public`
2. Service Worker configurado corretamente
3. Cache do navegador limpo

## 🔄 Background Sync (Opcional)

Para implementar Background Sync real:

1. **Registrar sync tag**:

```javascript
if (
  "serviceWorker" in navigator &&
  "sync" in window.ServiceWorkerRegistration.prototype
) {
  navigator.serviceWorker.ready.then((registration) => {
    registration.sync.register("sync-cupons");
  });
}
```

2. **Implementar no Service Worker**:

```javascript
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-cupons") {
    event.waitUntil(syncCuponsOffline());
  }
});
```

## 📱 Testando

### Simular Offline

1. **Chrome DevTools**: Network tab → Offline
2. **Firefox DevTools**: Network tab → Offline
3. **Desconectar internet**: Desabilitar WiFi/rede

### Verificar Dados

1. **Chrome DevTools**: Application → IndexedDB → DominusPDV
2. **Console**: `localStorage.getItem('offline-cupons')`

## 🎯 Próximos Passos

- [ ] Implementar Background Sync real
- [ ] Adicionar compressão de dados
- [ ] Implementar retry com backoff
- [ ] Adicionar logs detalhados
- [ ] Implementar limpeza automática de dados antigos

---

**Desenvolvido com ❤️ para o Dominus PDV**
