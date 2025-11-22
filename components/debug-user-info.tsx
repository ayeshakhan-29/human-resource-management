"use client";

import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function DebugUserInfo() {
  const { user } = useAuth();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader>
        <CardTitle className="text-sm text-yellow-800">Debug: User Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs">
        <pre className="text-yellow-700">
          {JSON.stringify(user, null, 2)}
        </pre>
        <div className="mt-2 text-yellow-700">
          <p>Role: {user?.role}</p>
          <p>Role Type: {typeof user?.role}</p>
          <p>Role Lowercase: {user?.role?.toLowerCase()}</p>
        </div>
      </CardContent>
    </Card>
  );
}