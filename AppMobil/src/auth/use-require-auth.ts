import { useRouter } from "expo-router";
import { useEffect } from "react";

import { useAuth } from "@/auth/auth-context";

export function useRequireAuth() {
  const auth = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!auth.cargandoSesion && !auth.usuario) {
      router.replace("/");
    }
  }, [auth.cargandoSesion, auth.usuario, router]);

  return auth;
}
