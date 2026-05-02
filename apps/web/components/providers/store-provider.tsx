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

export function StoreProvider({ children }: PropsWithChildren) {
  const [cart, setCart] = useState<CartLine[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [adminUser, setAdminUser] = useState<AuthUser | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    const storedCart = window.localStorage.getItem(storageKeys.cart);
    const storedWishlist = window.localStorage.getItem(storageKeys.wishlist);
    const storedSession = window.localStorage.getItem(storageKeys.session);
    const storedAdminSession = window.localStorage.getItem(storageKeys.adminSession);

    if (storedCart) {
      setCart(JSON.parse(storedCart) as CartLine[]);
    }
    if (storedWishlist) {
      setWishlist(JSON.parse(storedWishlist) as string[]);
    }
    if (storedSession) {
      const session = JSON.parse(storedSession) as { user: AuthUser | null; token: string | null };
      setUser(session.user);
      setToken(session.token);
    }
    if (storedAdminSession) {
      const session = JSON.parse(storedAdminSession) as { user: AuthUser | null; token: string | null };
      setAdminUser(session.user);
      setAdminToken(session.token);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.cart, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.wishlist, JSON.stringify(wishlist));
  }, [wishlist]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.session, JSON.stringify({ user, token }));
  }, [user, token]);

  useEffect(() => {
    window.localStorage.setItem(storageKeys.adminSession, JSON.stringify({ user: adminUser, token: adminToken }));
  }, [adminToken, adminUser]);

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
        setUser(nextUser);
        setToken(nextToken);
      },
      setAdminSession: (nextUser, nextToken) => {
        setAdminUser(nextUser);
        setAdminToken(nextToken);
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
