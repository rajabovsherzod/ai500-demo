import React, { useEffect } from "react"; // useEffect qo'shildi
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { toast } from "sonner";
import { Leaf, Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Zod sxemasi
const loginSchema = z.object({
  email: z.string().min(1, "Email kiritish shart").email("Email noto'g'ri formatda"),
  password: z.string().min(1, "Parol kiritish shart"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const LoginPage: React.FC = () => {
  // isAuthenticated ni ham olamiz
  const { login, loading, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 1-MUHIM O'ZGARISH: Auth holati o'zgarganda avtomatik yo'naltirish
  useEffect(() => {
    if (isAuthenticated) {
      // replace: true - orqaga qaytish tugmasini bosganda yana login sahifasiga tushmaslik uchun
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      toast.success(t("auth.loginSuccess") || "Xush kelibsiz!");
      // Bu yerda navigate shart emas, chunki yuqoridagi useEffect ishga tushadi
    } catch (error) {
      console.error("Login Error:", error);
      toast.error((error as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-background geometric-bg flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <LanguageSwitcher />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md relative z-10"
      >
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <motion.div
            whileHover={{ rotate: 360 }}
            className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center border border-primary/40"
          >
            <Leaf className="w-7 h-7 text-primary" />
          </motion.div>
          <span className="font-display text-2xl font-bold tracking-wider text-primary glow-text">
            AgroAi
          </span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{t("auth.welcomeBack") || "Kirish"}</CardTitle>
            <CardDescription>{t("auth.signInTo") || "Hisobingizga kiring"}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              <div className="space-y-2">
                <Label htmlFor="email">{t("auth.email") || "Email"}</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="test1@example.com"
                    className={errors.email ? "border-red-500 pl-10" : "pl-10"}
                    disabled={loading}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">{t("auth.password") || "Parol"}</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className={errors.password ? "border-red-500 pl-10" : "pl-10"}
                    disabled={loading}
                    {...register("password")}
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              <div className="flex items-center justify-end">
                <Link to="/forgot-password" className="text-sm text-primary hover:underline">
                  {t("auth.forgotPassword") || "Parolni unutdingizmi?"}
                </Link>
              </div>

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : (
                  <>
                    {t("auth.signIn") || "Kirish"}
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <span className="text-muted-foreground">{t("auth.noAccount")} </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                {t("auth.signUp")}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default LoginPage;