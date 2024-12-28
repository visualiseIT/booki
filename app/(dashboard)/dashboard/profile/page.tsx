import { SignOutButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function ProfilePage() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Provider Profile</h1>
          <p className="text-gray-600">Manage your business profile</p>
        </div>
        <div className="flex items-center gap-4">
          <UserButton afterSignOutUrl="/" />
          <SignOutButton>
            <Button variant="outline">
              Sign Out
            </Button>
          </SignOutButton>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Profile form will go here */}
          <p>Profile form coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
} 