"use client";

import Link from "next/link";
import { ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/cartStore";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export function HeaderActions() {
  const cartCount = useCartStore((s) => s.getItemsCount());
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="hidden shrink-0 items-center gap-0.5 md:flex">
      <Button variant="ghost" size="icon" asChild aria-label="Профиль">
        <Link href="/profile" className="relative inline-flex items-center justify-center">
          {user ? (
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-[11px] font-semibold text-white">
              {user.name?.[0] ?? user.phone[0]}
            </span>
          ) : (
            <User className="h-[22px] w-[22px] text-text" strokeWidth={1.75} />
          )}
        </Link>
      </Button>

      <Button variant="ghost" size="icon" asChild aria-label="Корзина">
        <Link href="/cart" className="relative inline-flex items-center justify-center">
          <ShoppingCart className="h-[22px] w-[22px] text-text" strokeWidth={1.75} />
          {mounted && cartCount > 0 ? (
            <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-[5px] text-[10px] font-bold text-brand ring-2 ring-cream">
              {cartCount > 99 ? "99+" : cartCount}
            </span>
          ) : null}
        </Link>
      </Button>
    </div>
  );
}
