"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { PawPrint } from "lucide-react";
import { signIn } from "../../../features/auth/actions";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email"));
    const password = String(formData.get("password"));

    startTransition(async () => {
      const result = await signIn(email, password);
      if (result.error) {
        setError(result.error);
        return;
      }
      setError("");
      router.push("/");
      router.refresh();
    });
  }

  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto grid min-h-screen max-w-6xl items-center gap-12 px-5 py-10 lg:grid-cols-[1.1fr_.9fr]">
        <section>
          <Brand />
          <p className="mt-12 inline-flex rounded-full bg-cyan-400/15 px-3 py-1 text-sm font-bold text-cyan-300">
            Gestão simples para pet shops
          </p>
          <h1 className="mt-5 max-w-xl text-4xl font-black leading-tight sm:text-6xl">
            Sua rotina organizada em um só lugar.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            Clientes, pets, agenda, vacinas, estoque, vendas e relatórios claros.
          </p>
        </section>

        <form
          onSubmit={handleSubmit}
          className="rounded-3xl bg-white p-6 text-slate-950 shadow-2xl sm:p-8"
        >
          <h2 className="text-2xl font-black">Bem-vindo de volta</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">
            Entre para acessar seu painel.
          </p>

          <div className="mt-6 grid gap-4">
            <Field label="E-mail" name="email" type="email" placeholder="voce@petshop.com" />
            <Field label="Senha" name="password" type="password" placeholder="Sua senha" />

            {error && (
              <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm font-bold text-red-800">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={isPending}
              className="h-12 rounded-xl bg-cyan-600 font-black text-white transition hover:bg-cyan-700 disabled:opacity-60"
            >
              {isPending ? "Entrando..." : "Entrar no PetManager"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex size-10 items-center justify-center rounded-xl bg-cyan-400 text-slate-950">
        <PawPrint />
      </div>
      <div>
        <p className="font-black">PetManager</p>
        <p className="text-xs font-medium text-slate-400">Gestão para pet shops</p>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string;
  name: string;
  type?: string;
  placeholder: string;
}

function Field({ label, name, type = "text", placeholder }: FieldProps) {
  return (
    <label className="grid gap-2 text-sm font-bold text-slate-800">
      {label}
      <input
        required
        name={name}
        type={type}
        placeholder={placeholder}
        className="h-11 rounded-xl border-2 border-slate-200 bg-white px-3 text-slate-950 outline-none focus:border-cyan-600"
      />
    </label>
  );
}
