import LoginForm from "../components/auth/LoginForm";
import AuthButton from "@/app/components/auth/AuthButton";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <LoginForm />
          <div className="mt-4 text-center">
            <AuthButton href="/register">Don&apos;t have an account? Register here</AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
