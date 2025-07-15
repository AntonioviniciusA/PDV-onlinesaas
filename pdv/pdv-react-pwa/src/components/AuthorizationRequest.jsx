import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Shield } from "lucide-react";

export default function AuthorizationRequest({
  open,
  onOpenChange,
  title = "Autorização Necessária",
  description = "",
  users = [],
  onAuthorize,
}) {
  const [selectedUser, setSelectedUser] = useState(users[0]?.id || "");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleAuthorize = () => {
    const user = users.find((u) => u.id === selectedUser);
    if (!user) {
      setError("Selecione um usuário");
      return;
    }
    if (!password) {
      setError("Digite a senha/cartão");
      return;
    }
    setError("");
    onAuthorize(user, password);
    setPassword("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            {title}
          </DialogTitle>
        </DialogHeader>
        {description && (
          <div className="mb-2 text-sm text-gray-600">{description}</div>
        )}
        <div className="space-y-3">
          <div>
            <Label>Usuário</Label>
            <select
              className="w-full border rounded p-2 mt-1"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nome} ({u.cargo})
                </option>
              ))}
            </select>
          </div>
          <div>
            <Label>Senha/Cartão</Label>
            <input
              type="password"
              className="w-full border rounded p-2 mt-1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="off"
              placeholder="Digite a senha ou passe o cartão"
            />
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          <Button className="w-full" onClick={handleAuthorize}>
            Autorizar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
