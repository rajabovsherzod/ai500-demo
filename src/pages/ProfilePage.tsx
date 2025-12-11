import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Lock, 
  Save, 
  Check, 
  Leaf, 
  Calendar,
  Shield,
  Loader2
} from "lucide-react";
import { useTranslation } from "react-i18next";

interface UserData {
  id: number | string;
  email: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  is_active?: boolean;
  role?: string;
}

const ProfilePage: React.FC = () => {
  const { t } = useTranslation();
  
  const [user, setUser] = useState<UserData | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPasswordSaving, setIsPasswordSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("agroai_user");
      if (storedUser) {
        const parsed = JSON.parse(storedUser);
        setUser(parsed);
        setFirstName(parsed.first_name || "");
        setLastName(parsed.last_name || "");
      }
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
  }, []);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      const updatedUser = { ...user, first_name: firstName, last_name: lastName };
      localStorage.setItem("agroai_user", JSON.stringify(updatedUser));
      setUser(updatedUser as UserData);
      
      toast.success(t("profile.profileUpdated") || "Profil muvaffaqiyatli yangilandi!");
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error(t("profile.newPasswordMismatch") || "Yangi parollar mos kelmadi!");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Parol kamida 6 ta belgidan iborat bo'lishi kerak!");
      return;
    }

    setIsPasswordSaving(true);
    
    try {
      await new Promise((resolve) => setTimeout(resolve, 800));
      
      toast.success(t("profile.passwordChanged") || "Parol muvaffaqiyatli o'zgartirildi!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error) {
      toast.error("Parolni o'zgartirishda xatolik!");
    } finally {
      setIsPasswordSaving(false);
    }
  };

  const getInitials = () => {
    if (firstName && lastName) {
      return `${firstName[0]}${lastName[0]}`.toUpperCase();
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "U";
  };

  return (
    <main className="container mx-auto px-4 pt-24 pb-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto"
      >
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold mb-2">
            <span className="text-foreground">{t("profile.title") || "Profil"}</span>{" "}
            <span className="text-primary glow-text">{t("profile.settings") || "Sozlamalari"}</span>
          </h1>
          <p className="text-muted-foreground">
            {t("profile.subtitle") || "Shaxsiy ma'lumotlaringizni boshqaring"}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Avatar & Stats */}
          <div className="lg:col-span-1 space-y-6">
            <Card variant="glass">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-2 border-primary/40 flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                  >
                    <span className="font-display text-3xl font-bold text-primary">
                      {getInitials()}
                    </span>
                  </motion.div>
                  
                  <h2 className="font-display text-xl font-semibold text-foreground">
                    {firstName || lastName 
                      ? `${firstName} ${lastName}`.trim() 
                      : user?.full_name || "Foydalanuvchi"}
                  </h2>
                  
                  <p className="text-sm text-muted-foreground mt-1">
                    {user?.email || "email@example.com"}
                  </p>

                  <div className="mt-4 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-medium flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
                    {user?.is_active !== false ? "Faol" : "Nofaol"}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-muted-foreground">Statistika</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Leaf className="w-4 h-4 text-primary" />
                    <span>Issiqxonalar</span>
                  </div>
                  <span className="font-mono text-primary">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>A'zo bo'lgan</span>
                  </div>
                  <span className="font-mono text-muted-foreground text-xs">-</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <Shield className="w-4 h-4 text-primary" />
                    <span>Rol</span>
                  </div>
                  <span className="font-mono text-xs px-2 py-0.5 bg-primary/10 rounded text-primary">
                    {user?.role || "user"}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-primary" />
                  {t("profile.personalInfo") || "Shaxsiy ma'lumotlar"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t("auth.firstName") || "Ism"}</Label>
                      <Input
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ismingiz"
                        className="bg-background/50"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t("auth.lastName") || "Familiya"}</Label>
                      <Input
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Familiyangiz"
                        className="bg-background/50"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">{t("auth.email") || "Email"}</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ""}
                        className="pl-10 bg-muted/30 cursor-not-allowed"
                        disabled
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("profile.emailCannotChange") || "Email manzilini o'zgartirib bo'lmaydi"}
                    </p>
                  </div>

                  <Button type="submit" variant="neon" disabled={isSaving} className="w-full sm:w-auto">
                    {isSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saqlanmoqda...</>
                    ) : saved ? (
                      <><Check className="w-4 h-4 mr-2" />{t("profile.saved") || "Saqlandi!"}</>
                    ) : (
                      <><Save className="w-4 h-4 mr-2" />{t("profile.saveChanges") || "Saqlash"}</>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card variant="glass">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-primary" />
                  {t("profile.changePassword") || "Parolni o'zgartirish"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">{t("profile.currentPassword") || "Joriy parol"}</Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="bg-background/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">{t("profile.newPassword") || "Yangi parol"}</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-background/50"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirmNewPassword">{t("profile.confirmNewPassword") || "Parolni tasdiqlang"}</Label>
                      <Input
                        id="confirmNewPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="bg-background/50"
                        required
                      />
                    </div>
                  </div>

                  <Button type="submit" variant="outline" disabled={isPasswordSaving} className="w-full sm:w-auto">
                    {isPasswordSaving ? (
                      <><Loader2 className="w-4 h-4 mr-2 animate-spin" />O'zgartirilmoqda...</>
                    ) : (
                      t("profile.updatePassword") || "Parolni yangilash"
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </motion.div>
    </main>
  );
};

export default ProfilePage;