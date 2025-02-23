"use client";

import { api } from "@/convex/_generated/api";
import { useQuery } from "convex/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { notFound } from "next/navigation";
import { useRouter } from "next/navigation";
import { use } from "react";

export default function BookingPage({
  params,
}: {
  params: Promise<{ providerUrl: string }>;
}) {
  const { providerUrl } = use(params);
  const router = useRouter();
  const provider = useQuery(api.providers.getProviderByUrl, { customUrl: providerUrl });
  const services = useQuery(api.services.getServices, 
    provider ? { providerId: provider._id } : "skip"
  );

  // Show 404 if provider not found
  if (provider === null) {
    notFound();
  }

  // Show loading state
  if (provider === undefined) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
          <div className="space-y-4">
            <div className="h-40 bg-gray-200 rounded"></div>
            <div className="h-40 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{provider.businessName}</h1>
        <p className="text-gray-600">{provider.bio}</p>
      </div>

      <Card className="p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Available Services</h2>
        {services?.length ? (
          <div className="divide-y">
            {services.map((service) => (
              <div key={service._id} className="py-4 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                    <div className="flex gap-4 mt-2 text-sm text-gray-600">
                      <p>{service.duration} minutes</p>
                      <p>${service.price}</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => router.push(`/${providerUrl}/services/${service._id}`)}
                  >
                    Book
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-600">
            <p>No services available yet</p>
            <p className="text-sm mt-1">Please check back later</p>
          </div>
        )}
      </Card>

      <div className="text-sm text-gray-500 mt-8">
        <p>Timezone: {provider.timezone}</p>
        <p>Contact: {provider.contactEmail}</p>
      </div>
    </div>
  );
} 