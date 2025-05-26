import RegisterForm from "../components/auth/RegisterForm";
import AuthButton from "@/app/components/auth/AuthButton";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <RegisterForm />
          <div className="mt-4 text-center">
            <AuthButton href="/login">
              Already have an account? Login here
            </AuthButton>
          </div>
        </div>
      </div>
    </div>
  );
}
