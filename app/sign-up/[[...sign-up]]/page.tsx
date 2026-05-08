import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-violet-50 to-indigo-100">
      <div className="flex flex-col items-center gap-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">SocialPilot Agency</h1>
          <p className="text-gray-500 mt-1">Start managing your clients today</p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
