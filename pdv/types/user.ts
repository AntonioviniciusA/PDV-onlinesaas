export interface User {
  id: string
  name: string
  username: string
  role: "caixa" | "fiscal" | "supervisor" | "gerente" | "admin"
  permissions: Permission[]
  active: boolean
}

export interface Permission {
  module: string
  actions: string[]
}

export const USER_ROLES = {
  caixa: {
    name: "Operador de Caixa",
    level: 1,
    permissions: ["pdv.operate"],
  },
  fiscal: {
    name: "Fiscal",
    level: 2,
    permissions: ["pdv.operate", "pdv.authorize", "reports.view"],
  },
  supervisor: {
    name: "Supervisor",
    level: 3,
    permissions: ["pdv.operate", "pdv.authorize", "products.view", "reports.view", "cash.manage"],
  },
  gerente: {
    name: "Gerente",
    level: 4,
    permissions: ["pdv.operate", "pdv.authorize", "products.manage", "reports.manage", "cash.manage", "labels.config"],
  },
  admin: {
    name: "Administrador",
    level: 5,
    permissions: ["*"],
  },
}

export const MOCK_USERS: User[] = [
  {
    id: "1",
    name: "João Silva",
    username: "joao.caixa",
    role: "caixa",
    permissions: [{ module: "pdv", actions: ["operate"] }],
    active: true,
  },
  {
    id: "2",
    name: "Maria Santos",
    username: "maria.fiscal",
    role: "fiscal",
    permissions: [
      { module: "pdv", actions: ["operate", "authorize"] },
      { module: "reports", actions: ["view"] },
    ],
    active: true,
  },
  {
    id: "3",
    name: "Carlos Oliveira",
    username: "carlos.supervisor",
    role: "supervisor",
    permissions: [
      { module: "pdv", actions: ["operate", "authorize"] },
      { module: "products", actions: ["view"] },
      { module: "reports", actions: ["view"] },
      { module: "cash", actions: ["manage"] },
    ],
    active: true,
  },
  {
    id: "4",
    name: "Ana Costa",
    username: "ana.gerente",
    role: "gerente",
    permissions: [
      { module: "pdv", actions: ["operate", "authorize"] },
      { module: "products", actions: ["manage"] },
      { module: "reports", actions: ["manage"] },
      { module: "cash", actions: ["manage"] },
      { module: "labels", actions: ["config"] },
    ],
    active: true,
  },
]
