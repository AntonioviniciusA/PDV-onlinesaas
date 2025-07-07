"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Receipt, FileText, Settings, Save } from "lucide-react";

export function ReceiptConfigDialog({ open, onOpenChange, config, onSave }) {
  const [receiptConfig, setReceiptConfig] = useState(config);

  const handleSave = () => {
    onSave(receiptConfig);
    onOpenChange(false);
  };

  const updateRolePermission = (role, field, value) => {
    setReceiptConfig((prev) => ({
      ...prev,
      rolePermissions: {
        ...prev.rolePermissions,
        [role]: {
          ...prev.rolePermissions[role],
          [field]: value,
        },
      },
    }));
  };

  const roles = [
    { id: "caixa", name: "Operador de Caixa" },
    { id: "fiscal", name: "Fiscal" },
    { id: "supervisor", name: "Supervisor" },
    { id: "gerente", name: "Gerente" },
    { id: "admin", name: "Administrador" },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuração de Cupons e Recibos
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Configurações Gerais */}
          <div>
            <h3 className="font-semibold mb-3">Configurações Gerais</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableFiscal"
                  checked={receiptConfig.enableFiscalCoupon}
                  onChange={(e) =>
                    setReceiptConfig((prev) => ({
                      ...prev,
                      enableFiscalCoupon: e.target.checked,
                    }))
                  }
                />
                <Label
                  htmlFor="enableFiscal"
                  className="flex items-center gap-2"
                >
                  <Receipt className="w-4 h-4" />
                  Habilitar Cupom Fiscal
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="enableReceipt"
                  checked={receiptConfig.enableReceipt}
                  onChange={(e) =>
                    setReceiptConfig((prev) => ({
                      ...prev,
                      enableReceipt: e.target.checked,
                    }))
                  }
                />
                <Label
                  htmlFor="enableReceipt"
                  className="flex items-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  Habilitar Recibo Simples
                </Label>
              </div>

              <div>
                <Label>Tipo Padrão do Sistema</Label>
                <select
                  value={receiptConfig.defaultType}
                  onChange={(e) =>
                    setReceiptConfig((prev) => ({
                      ...prev,
                      defaultType: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md mt-1"
                >
                  <option value="fiscal">Cupom Fiscal</option>
                  <option value="receipt">Recibo Simples</option>
                  <option value="both">Perguntar ao Usuário</option>
                </select>
              </div>
            </div>
          </div>

          <Separator />

          {/* Permissões por Cargo */}
          <div>
            <h3 className="font-semibold mb-3">Permissões por Cargo</h3>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Badge variant="secondary">{role.name}</Badge>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Pode Escolher Tipo?</Label>
                      <select
                        value={
                          receiptConfig.rolePermissions[role.id]?.canChoose
                            ? "true"
                            : "false"
                        }
                        onChange={(e) =>
                          updateRolePermission(
                            role.id,
                            "canChoose",
                            e.target.value === "true"
                          )
                        }
                        className="w-full p-2 border rounded-md mt-1"
                      >
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </select>
                    </div>

                    <div>
                      <Label>Tipo Padrão para este Cargo</Label>
                      <select
                        value={
                          receiptConfig.rolePermissions[role.id]?.defaultType ||
                          "fiscal"
                        }
                        onChange={(e) =>
                          updateRolePermission(
                            role.id,
                            "defaultType",
                            e.target.value
                          )
                        }
                        className="w-full p-2 border rounded-md mt-1"
                      >
                        <option value="fiscal">Cupom Fiscal</option>
                        <option value="receipt">Recibo Simples</option>
                        <option value="both">Perguntar</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Informações */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">
              Informações Importantes:
            </h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>
                • <strong>Cupom Fiscal:</strong> Documento oficial com validade
                fiscal
              </li>
              <li>
                • <strong>Recibo Simples:</strong> Comprovante interno sem
                validade fiscal
              </li>
              <li>
                • <strong>Permissões:</strong> Definem o que cada cargo pode
                fazer
              </li>
              <li>
                • <strong>Tipo Padrão:</strong> Será usado quando o usuário não
                puder escolher
              </li>
            </ul>
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Salvar Configuração
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
