"use client";

import { Suspense } from "react";
import LoginForm from "../components/auth/LoginForm";
import AuthButton from "@/app/components/auth/AuthButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <Suspense
            fallback={
              <div className="text-center py-4 text-gray-600">
                <p>Loading...</p>
                <p className="text-sm mt-2">
                  Our backend is hosted on a free tier, so it may take up to 30 seconds to wake up.
                </p>
              </div>
            }
          >
            <LoginForm />
          </Suspense>
          <div className="mt-4 text-center">
            <AuthButton href="/register">Don&apos;t have an account? Register here</AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
