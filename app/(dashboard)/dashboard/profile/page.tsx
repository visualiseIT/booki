import { SignOutButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@clerk/nextjs/server";

export default async function ProfilePage() {
  const { userId } = await auth();

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

      <form className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              This information will be displayed on your public booking page
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" placeholder="John Doe" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input id="businessName" placeholder="Acme Services" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell your clients about yourself and your services..."
                className="h-32"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input id="contactEmail" type="email" placeholder="contact@example.com" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" placeholder="UTC+0" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customUrl">Custom URL</Label>
              <div className="flex gap-2 items-center">
                <span className="text-gray-500">booki.com/</span>
                <Input id="customUrl" placeholder="your-name" className="flex-1" />
              </div>
              <p className="text-sm text-gray-500">
                This will be your public booking page URL
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Profile Image</CardTitle>
            <CardDescription>
              Upload a professional photo of yourself
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 rounded-full bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No image</span>
              </div>
              <Button variant="outline">Upload Image</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline">Cancel</Button>
          <Button>Save Changes</Button>
        </div>
      </form>
    </div>
  );
} 