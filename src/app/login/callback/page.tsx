// src/app/login/callback/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveIdToken } from "@/lib/auth";

export default function Callback() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Authorization Code flow: el code viene en query params
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const errorDescription = searchParams.get("error_description");

    if (error) {
      console.error("Auth error:", error, errorDescription);
      router.replace(`/?error=${encodeURIComponent(error || "auth_error")}`);
      return;
    }

    if (code) {
      // Intercambiar code por token
      exchangeCodeForToken(code);
    } else {
      // También verificar si hay token en fragment (fallback para Implicit flow)
      const hash = window.location.hash.slice(1);
      const hashParams = new URLSearchParams(hash);
      const idTokenFromFragment = hashParams.get("id_token");
      
      if (idTokenFromFragment) {
        saveIdToken(idTokenFromFragment);
        router.replace("/");
      } else {
        console.error("No code or token found in callback");
        router.replace("/?error=missing_token");
      }
    }
  }, [router, searchParams]);

  async function exchangeCodeForToken(code: string) {
    try {
      const domain = process.env.NEXT_PUBLIC_COGNITO_DOMAIN!;
      const clientId = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID!;
      const redirectUri = process.env.NEXT_PUBLIC_REDIRECT_URI!;

      // Intercambiar code por token usando el endpoint de Cognito
      const tokenUrl = `${domain}/oauth2/token`;
      const params = new URLSearchParams({
        grant_type: "authorization_code",
        client_id: clientId,
        code: code,
        redirect_uri: redirectUri,
      });

      const response = await fetch(tokenUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Token exchange error:", errorText);
        throw new Error(`Failed to exchange code for token: ${response.status}`);
      }

      const data = await response.json();
      if (data.id_token) {
        saveIdToken(data.id_token);
        router.replace("/");
      } else {
        console.error("No id_token in response:", data);
        router.replace("/?error=no_id_token");
      }
    } catch (error) {
      console.error("Error exchanging code for token:", error);
      router.replace("/?error=token_exchange_failed");
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-gray-600">Procesando inicio de sesión...</p>
    </div>
  );
}

