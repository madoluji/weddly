import { NextResponse } from "next/server";

type AdminErrorPayload = {
  success: false;
  error: string;
  details?: unknown;
};

type AdminSuccessPayload<T> = {
  success: true;
  message?: string;
  data?: T;
};

export const adminError = (
  error: string,
  status: number,
  details?: unknown
) => {
  const payload: AdminErrorPayload = { success: false, error };
  if (details !== undefined) {
    payload.details = details;
  }

  return NextResponse.json(payload, { status });
};

export const adminSuccess = <T>(
  data?: T,
  message?: string,
  status = 200
) => {
  const payload: AdminSuccessPayload<T> = { success: true };
  if (message) {
    payload.message = message;
  }
  if (data !== undefined) {
    payload.data = data;
  }

  return NextResponse.json(payload, { status });
};