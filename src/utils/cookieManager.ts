"use server";

import { cookies as getCookiesApi } from "next/headers";
import { NextResponse } from "next/server";

type CookieOptions = {
  secure?: boolean;
  httpOnly?: boolean;
  path?: string;
  maxAge?: number;
};

export async function addCookie(
  key: string,
  value: string,
  options: CookieOptions = {
    secure: true,
    httpOnly: true,
    path: "/",
    maxAge: 7 * 24 * 60 * 60,
  }
): Promise<void> {
  const cookieStore = await getCookiesApi();
  cookieStore.set(key, value, options);
}

export async function addCookies(
  keys: string[],
  values: string[],
  options: CookieOptions = {}
): Promise<void> {
  if (keys.length !== values.length) {
    throw new Error("Keys and values arrays must have the same length");
  }
  const cookieStore = await getCookiesApi();
  keys.forEach((key, index) => {
    cookieStore.set(key, values[index], {
      secure: options.secure ?? process.env.NODE_ENV === "production",
      httpOnly: options.httpOnly ?? true,
      path: options.path ?? "/",
      maxAge: options.maxAge ?? 1 * 24 * 60 * 60,
    });
  });
}

export async function getCookie(key: string): Promise<string | null> {
  const cookieStore = await getCookiesApi();
  const cookie = cookieStore.get(key);
  return cookie ? cookie.value : null;
}

export async function deleteCookie(key: string): Promise<void> {
  const cookieStore = await getCookiesApi();
  cookieStore.delete(key);
}

export async function deleteCookies(keys: string[]): Promise<void> {
  const cookieStore = await getCookiesApi();
  keys.forEach((key) => {
    cookieStore.delete(key);
  });
}

export async function deleteCookiesAndRedirect(
  keys: string[],
  redirectTo: string = "/"
): Promise<NextResponse> {
  const cookieStore = await getCookiesApi();
  keys.forEach((key) => {
    cookieStore.delete(key);
  });
  return NextResponse.redirect(redirectTo);
}
