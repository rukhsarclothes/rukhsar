"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";
import type { AuthUser, CartLine, CartLineIdentifier } from "@rukhsar/types";

type StoreContextValue = {
  cart: CartLine[];
  wishlist: string[];
  user: AuthUser | null;
  token: string | null;
  adminUser: AuthUser | null;
  adminToken: string | null;
  addToCart: (productId: string, size?: string) => void;
  removeFromCart: (line: CartLineIdentifier) => void;
  updateQuantity: (line: CartLineIdentifier, quantity: number) => void;
  toggleWishlist: (productId: string) => void;
  setSession: (user: AuthUser | null, token: string | null) => void;
  setAdminSession: (user: AuthUser | null, token: string | null) => void;
  clearCart: () => void;
};

const StoreContext = createContext<StoreContextValue | null>(null);

const storageKeys = {
  cart: "rukhsar-cart",
  wishlist: "rukhsar-wishlist",
  session: "rukhsar-session",
  adminSession: "rukhsar-admin-session"
};

function readStorage<T>(key: string, fallback: T) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = window.localStorage.getItem(key);
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<CartLine[]>(() => readStorage<CartLine[]>(storageKeys.cart, []));
  const [wishlist, setWishlist] = useState<string[]>(() => readStorage<string[]>(storageKeys.wishlist, []));
  const [session, setSessionState] = useState<{ user: AuthUser | null; token: string | null }>(() =>
    readStorage<{ user: AuthUser | null; token: string | null }>(storageKeys.session, { user: null, token: null })
  );
  const [adminSession, setAdminSessionState] = useState<{ user: AuthUser | null; token: string | null }>(() =>
    readStorage<{ user: AuthUser | null; token: string | null }>(storageKeys.adminSession, { user: null, token: null })
  );

  const user = session.user;
  const token = session.token;
  const adminUser = adminSession.user;
  const adminToken = adminSession.token;

  useEffect(() => {
    window.localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.wishlist, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.session, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.adminSession, JSON.stringify(adminSession));
  }, [adminSession]);

  const value = useMemo<StoreContextValue>(
    () => ({
      cart,
      wishlist,
      user,
      token,
      adminUser,
      adminToken,
      addToCart: (productId, size) => {
        setCart((current) => {
          const existing = current.find((line) => line.productId === productId && line.size === size);
          if (existing) {
            return current.map((line) =>
              line.productId === productId && line.size === size
                ? { ...line, quantity: line.quantity + 1 }
                : line
            );
          }
          return [...current, { productId, quantity: 1, size }];
        });
      },
      removeFromCart: ({ productId, size }) => {
        setCart((current) =>
          current.filter((line) => !(line.productId === productId && line.size === size))
        );
      },
      updateQuantity: ({ productId, size }, quantity) => {
        setCart((current) =>
          current
            .map((line) =>
              line.productId === productId && line.size === size ? { ...line, quantity } : line
            )
            .filter((line) => line.quantity > 0)
        );
      },
      toggleWishlist: (productId) => {
        setWishlist((current) =>
          current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
        );
      },
      setSession: (nextUser, nextToken) => {
        setSessionState({ user: nextUser, token: nextToken });
      },
      setAdminSession: (nextUser, nextToken) => {
        setAdminSessionState({ user: nextUser, token: nextToken });
      },
      clearCart: () => {
        setCart([]);
      }
    }),
    [adminToken, adminUser, cart, token, user, wishlist]
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error("useStore must be used within StoreProvider");
  }
  return context;
}
