import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/use-theme";
import { useNavigate } from "react-router-dom";
import { AuthService } from "../../services/authServices";
import Logo from "./Logo";
// import { useQuery } from "@tanstack/react-query"; // Removido

export default function Header() {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, mounted } = useTheme();
  // Estado para o usuário autenticado
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      const isAuth = await AuthService.isAuthenticated();
      console.log("autenticado", isAuth);
      if (isAuth) {
        const userData = await AuthService.getUser();
        setUser(userData);
      } else {
        setUser(null);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleProfileClick = () => {
    if (user && (user.nome_representante || user.razao_social)) {
      navigate("/cliente/perfil", { state: { user } });
    } else if (user && user.razao_social) {
      navigate("/parceiro/perfil", { state: { user } });
    }
  };

  return (
    <header
      className={` sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled ? "shadow-sm" : ""
      }`}
      style={{ position: "relative" }}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Logo />
          <span>NeoCaixa PDV</span>
        </div>
        <nav className="hidden md:flex gap-8">
          <a
            href="#features"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Recursos
          </a>
          <a
            href="#pricing"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Preços
          </a>
          <a
            href="#faq"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            FAQ
          </a>
        </nav>
        <div className="hidden md:flex gap-4 items-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {mounted && theme === "dark" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
            <span className="sr-only">Alternar tema</span>
          </Button>
          {user ? (
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={handleProfileClick}
            >
              <span className="font-medium">
                {user.nome_representante || user.razao_social || user.email}
              </span>
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase">
                {
                  (user.nome_representante ||
                    user.razao_social ||
                    user.email)[0]
                }
              </div>
            </div>
          ) : (
            <>
              <button
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                onClick={() => navigate("/login")}
              >
                Entrar
              </button>
              <Button
                className="rounded-full"
                onClick={() => navigate("/cadastro")}
              >
                Começar Agora
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </>
          )}
        </div>
        <div className="flex items-center gap-4 md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {mounted && theme === "dark" ? (
              <Sun className="size-[18px]" />
            ) : (
              <Moon className="size-[18px]" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="size-5" />
            ) : (
              <Menu className="size-5" />
            )}
            <span className="sr-only">Alternar menu</span>
          </Button>
        </div>
      </div>
      {/* Mobile menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden absolute top-16 inset-x-0 bg-background/95 backdrop-blur-lg border-b"
        >
          <div className="container py-4 flex flex-col gap-4">
            <a
              href="#features"
              className="py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Recursos
            </a>
            <a
              href="#pricing"
              className="py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Preços
            </a>
            <a
              href="#faq"
              className="py-2 text-sm font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              FAQ
            </a>
            <div className="flex flex-col gap-2 pt-2 border-t">
              {user ? (
                <div className="flex items-center gap-2 py-2">
                  <span className="font-medium">
                    {user.nome_representante || user.razao_social || user.email}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold uppercase">
                    {user.nome
                      ? user.nome[0]
                      : user.razao_social
                      ? user.razao_social[0]
                      : user.email[0]}
                  </div>
                </div>
              ) : (
                <>
                  <button
                    className="py-2 text-sm font-medium text-left"
                    onClick={() => {
                      navigate("/login");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Entrar
                  </button>
                  <Button
                    className="rounded-full"
                    onClick={() => {
                      navigate("/cadastro");
                      setMobileMenuOpen(false);
                    }}
                  >
                    Começar Agora
                    <ChevronRight className="ml-1 size-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
