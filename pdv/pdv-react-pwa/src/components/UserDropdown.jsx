import { useState, useRef, useEffect } from "react";
import { User, LogOut } from "lucide-react";
import { useLogout } from "../hooks/useAuth";

export function UserDropdown({ user }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const logout = useLogout(); // ⬅️ Chame o hook aqui!

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div
        className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-center cursor-pointer"
        onClick={() => setOpen(!open)}
      >
        <User
          className="w-4 h-4"
          width={20}
          height={20}
          color="black"
          strokeWidth={2}
          fill="white"
        />
      </div>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
          <div className="p-4 border-b">
            <p className="text-sm font-bold text-gray-800">
              {user?.nome || "Usuário"}
            </p>
            <p className="text-xs text-gray-500">{user?.perfil || "Perfil"}</p>
          </div>
          <div
            className="flex items-center gap-2 p-3 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              logout(); // ⬅️ Use a função aqui, não o hook
              setOpen(false);
            }}
          >
            <LogOut className="w-4 h-4" color="black" strokeWidth={2} />
            <p className="text-sm font-semibold text-black">Sair</p>
          </div>
        </div>
      )}
    </div>
  );
}
