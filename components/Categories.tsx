"use client";
import Image from "next/image";
import Link from "next/link";
import { categories } from "@/lib/data";

export function Categories() {
  return (
    <section className="mx-auto mt-6 max-w-[1600px] px-3 sm:px-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="section-title">Comparez rapidement par catégorie</h2>
        <Link href="/categories" className="text-xs font-medium text-brand-gold hover:underline">
          Toutes les catégories →
        </Link>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 sm:gap-4 lg:grid-cols-10">
        {categories.map((c, i) => (
          <Link
            key={c.id}
            href="/categories"
            className="group flex flex-col items-center rounded-2xl border border-bg-border bg-bg-card p-2 text-center transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-card dark:hover:border-white/20 sm:p-3"
          >
            <div
              className={`cat-anim relative h-14 w-14 overflow-hidden rounded-full bg-bg-700 ring-2 ring-inset sm:h-20 sm:w-20 ${c.ring}`}
              style={{ animationDelay: `${i * 80}ms, ${600 + i * 80}ms` }}
            >
              <Image
                src={c.image}
                alt={c.fr}
                fill
                sizes="(max-width: 640px) 56px, 80px"
                className="object-cover"
                unoptimized
              />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-t from-black/40 via-transparent to-white/10" />
            </div>
            <div className="mt-2 text-[11px] sm:text-xs font-semibold text-slate-800 leading-tight dark:text-white">{c.fr}</div>
            <div className="font-arabic text-[10px] text-slate-400 dark:text-white/50">{c.ar}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}
