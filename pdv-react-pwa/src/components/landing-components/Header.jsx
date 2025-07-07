import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ChevronRight, Menu, X, Moon, Sun } from "lucide-react";
import { Button } from "../ui/button";
import { useTheme } from "../../hooks/use-theme";

function Logo() {
  return (
    <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground">
      D
    </div>
  );
}

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { theme, setTheme, mounted } = useTheme();

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

  return (
    <header
      className={`sticky top-0 z-50 w-full backdrop-blur-lg transition-all duration-300 ${
        isScrolled ? "bg-background/80 shadow-sm" : "bg-transparent"
      }`}
    >
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2 font-bold">
          <Logo />
          <span>Dominus PDV</span>
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
          <a
            href="/pdv"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Entrar
          </a>
          <Button className="rounded-full">
            Começar Agora
            <ChevronRight className="ml-1 size-4" />
          </Button>
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
              <a
                href="/pdv"
                className="py-2 text-sm font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                Entrar
              </a>
              <Button className="rounded-full">
                Começar Agora
                <ChevronRight className="ml-1 size-4" />
              </Button>
            </div>
          </div>
        </motion.div>
      )}
    </header>
  );
}
