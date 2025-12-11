import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Leaf, User, LogOut, LayoutDashboard, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
// 1-MUHIM: Context emas, Hookni ulaymiz
import { useAuth } from "@/hooks/use-auth";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const Navbar: React.FC = () => {
  // Hookdan kerakli funksiyalarni olamiz
  const { isAuthenticated, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { t } = useTranslation();

  // Userni to'g'ridan-to'g'ri localStorage'dan ham o'qiymiz
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("agroai_user");
      if (!raw) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  })();

  const handleLogout = () => {
    logout();
    // Hook ichida window.location bo'lsa ham, bu yerda ham yo'naltiramiz
    navigate("/login");
  };

  console.log("Stored user:" , storedUser)

  const navLinks = isAuthenticated
    ? [
        { to: "/dashboard", label: t("nav.dashboard") || "Dashboard", icon: LayoutDashboard },
        { to: "/profile", label: t("nav.profile") || "Profil", icon: User },
      ]
    : [];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-primary/20"
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to={isAuthenticated ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center border border-primary/40"
            >
              <Leaf className="w-6 h-6 text-primary" />
            </motion.div>
            <span className="font-display text-xl font-bold tracking-wider text-primary glow-text">
              AgroAi
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    isActive
                      ? "bg-primary/20 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                      : "text-muted-foreground hover:text-primary hover:bg-primary/10"
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}

            <LanguageSwitcher />

            {isAuthenticated ? (
              <div className="flex items-center gap-4">
                <span className="text-primary font-semibold">
                  {storedUser?.first_name ||
                    storedUser?.full_name ||
                    storedUser?.email ||
                    "Foydalanuvchi"}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="hover:text-destructive hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  {t("nav.logout") || "Chiqish"}
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    {t("nav.login") || "Kirish"}
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="neon" size="sm">
                    {t("nav.getStarted") || "Boshlash"}
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-2 md:hidden">
            <LanguageSwitcher />
            <button
              className="p-2 text-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden overflow-hidden border-t border-primary/20 bg-background/95 backdrop-blur-xl"
            >
              <div className="flex flex-col gap-2 p-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 transition-colors"
                  >
                    <link.icon className="w-5 h-5 text-primary" />
                    {link.label}
                  </Link>
                ))}

                {isAuthenticated ? (
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10 w-full text-left transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    {t("nav.logout") || "Chiqish"}
                  </button>
                ) : (
                  <div className="flex flex-col gap-2 mt-2">
                    <Link
                      to="/login"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg text-foreground hover:bg-primary/10 border border-transparent hover:border-primary/20"
                    >
                      {t("nav.login") || "Kirish"}
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
                    >
                      {t("nav.getStarted") || "Boshlash"}
                    </Link>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
};

export default Navbar;