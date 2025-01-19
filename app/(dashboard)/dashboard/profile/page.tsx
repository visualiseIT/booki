"use client";

import { SignOutButton, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { auth } from "@clerk/nextjs/server";
import { api } from "@/convex/_generated/api";
import { useForm } from "react-hook-form";
import { useAction, useMutation, useQuery } from "convex/react";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { toast } = useToast();
  const router = useRouter();
  const provider = useQuery(api.providers.getProvider);
  const createProvider = useMutation(api.providers.createProvider);
  const updateProvider = useMutation(api.providers.updateProvider);

  const { register, handleSubmit, formState: { isSubmitting } } = useForm({
    defaultValues: {
      name: provider?.name || "",
      businessName: provider?.businessName || "",
      bio: provider?.bio || "",
      contactEmail: provider?.contactEmail || "",
      timezone: provider?.timezone || "",
      customUrl: provider?.customUrl || "",
    }
  });

  const onSubmit = async (data) => {
    try {
      if (provider) {
        await updateProvider({
          id: provider._id,
          ...data,
        });
      } else {
        await createProvider(data);
      }
      
      toast({
        title: "Success",
        description: "Profile saved successfully",
      });

      // Redirect to dashboard after a short delay
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to save profile",
        variant: "destructive",
      });
      console.error(error);
    }
  };

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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
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
                <Input 
                  id="name" 
                  placeholder="John Doe" 
                  {...register("name", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName" 
                  placeholder="Acme Services" 
                  {...register("businessName", { required: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea 
                id="bio" 
                placeholder="Tell your clients about yourself and your services..."
                className="h-32"
                {...register("bio")}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactEmail">Contact Email</Label>
                <Input 
                  id="contactEmail" 
                  type="email" 
                  placeholder="contact@example.com" 
                  {...register("contactEmail", { required: true })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input 
                  id="timezone" 
                  placeholder="UTC+0" 
                  {...register("timezone", { required: true })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customUrl">Custom URL</Label>
              <div className="flex gap-2 items-center">
                <span className="text-gray-500">booki.com/</span>
                <Input 
                  id="customUrl" 
                  placeholder="your-name" 
                  className="flex-1"
                  {...register("customUrl", { required: true })}
                />
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
              <Button variant="outline" type="button">Upload Image</Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button variant="outline" type="button">Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
} 