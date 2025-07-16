import React, { useEffect, useState } from "react";
import { Bell, Search, User } from "lucide-react";
import { AuthService } from "../../services/authServices";

function Header({ title, userType }) {
  const [user, setUser] = useState();

  useEffect(() => {
    const fetchUser = async () => {
      const isAuth = await AuthService.isAuthenticated();
      console.log("isAuth", isAuth);
      if (isAuth) {
        const user = await AuthService.getUser();
        console.log("user", user);
        setUser(user);
      }
    };
    fetchUser();
  }, []);

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">{title}</h1>
          <p className="text-sm text-gray-600">
            {userType === "client" ? "Área do Cliente" : "Área do Parceiro"}
          </p>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Pesquisar..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>

          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            {user ? (
              <div className="flex items-center gap-2 cursor-pointer">
                <span className="font-medium">
                  {user.nome_representante || user.razao_social}
                </span>
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase">
                  {user.nome_representante || user.razao_social}
                </div>
              </div>
            ) : (
              <>
                <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                  Entrar
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
