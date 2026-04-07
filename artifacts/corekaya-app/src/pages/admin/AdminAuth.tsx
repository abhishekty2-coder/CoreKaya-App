import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/Button";

export function AdminAuth() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [, setLocation] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "corekaya2025") {
      localStorage.setItem("adminAuth", "true");
      setLocation("/admin/overview");
    } else {
      setError("Incorrect password");
    }
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <h1 className="font-serif text-3xl font-bold text-navy mb-2">CoreKaya Admin</h1>
          <p className="text-gray-500">Enter password to access the dashboard</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="Password"
              className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              data-testid="admin-password-input"
            />
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
          <Button type="submit" fullWidth size="lg" data-testid="admin-login-button">
            Login
          </Button>
        </form>
      </div>
    </div>
  );
}