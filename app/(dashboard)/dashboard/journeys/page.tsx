"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BrowserControl } from "./components/BrowserControl";
import { ScreenshotGallery } from "./components/ScreenshotGallery";
import { useState } from "react";

interface Journey {
  id: string;
  name: string;
  description: string;
  steps: string[];
  lastRun?: {
    timestamp: Date;
    status: "success" | "error";
    duration: number;
  };
  prerequisites?: string[];
}

const journeys: Journey[] = [
  {
    id: "journey1",
    name: "Provider Setup",
    description: "Captures the initial provider setup process",
    steps: [
      "Creates provider profile",
      "Sets up business details",
      "Navigates through dashboard"
    ]
  },
  {
    id: "journey2",
    name: "Public Booking Page",
    description: "Captures the public booking page view",
    steps: [
      "Views provider's public page",
      "Shows available services",
      "Displays business information"
    ]
  },
  {
    id: "journey3",
    name: "Service Setup",
    description: "Captures the service creation process",
    steps: [
      "Navigates to services page",
      "Creates a new service",
      "Verifies service appears in list"
    ]
  },
  {
    id: "journey4",
    name: "Availability Setup",
    description: "Captures the availability setup process",
    steps: [
      "Sets working hours",
      "Configures days of the week",
      "Saves availability settings"
    ]
  },
  {
    id: "journey5",
    name: "Customer Booking",
    description: "Captures the customer booking flow",
    steps: [
      "Visits booking page",
      "Selects a service",
      "Books an appointment",
      "Receives confirmation"
    ]
  },
  {
    id: "journey6",
    name: "Appointment Management",
    description: "Captures the appointment management flow",
    steps: [
      "Views upcoming appointments",
      "Checks appointment details",
      "Views booking statistics"
    ]
  }
];

export default function JourneysPage() {
  const [activeJourney, setActiveJourney] = useState<string | null>(null);
  const [runningJourneys, setRunningJourneys] = useState<Set<string>>(new Set());

  const runJourney = async (journeyId: string) => {
    if (runningJourneys.has(journeyId)) return;

    setRunningJourneys(prev => new Set([...prev, journeyId]));
    setActiveJourney(journeyId);

    try {
      const response = await fetch(`/api/journeys/run/${journeyId}`, {
        method: "POST"
      });

      if (!response.ok) {
        throw new Error("Failed to run journey");
      }

      // Update journey status on completion
      const journey = journeys.find(j => j.id === journeyId);
      if (journey) {
        journey.lastRun = {
          timestamp: new Date(),
          status: "success",
          duration: 0 // We'll update this with actual duration
        };
      }
    } catch (error) {
      // Update journey status on error
      const journey = journeys.find(j => j.id === journeyId);
      if (journey) {
        journey.lastRun = {
          timestamp: new Date(),
          status: "error",
          duration: 0
        };
      }
    } finally {
      setRunningJourneys(prev => {
        const next = new Set(prev);
        next.delete(journeyId);
        return next;
      });
    }
  };

  const runAllJourneys = async () => {
    for (const journey of journeys) {
      await runJourney(journey.id);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Test Journeys</h1>
          <p className="text-muted-foreground">
            Run and monitor automated test journeys
          </p>
        </div>
        <Button onClick={runAllJourneys}>Run All Journeys</Button>
      </div>

      <BrowserControl />

      {/* Journey Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        {journeys.map((journey) => (
          <Card key={journey.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-semibold">{journey.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {journey.description}
                </p>
              </div>
              <Badge 
                variant={
                  runningJourneys.has(journey.id)
                    ? "outline"
                    : journey.lastRun?.status === "success"
                    ? "success"
                    : "secondary"
                }
              >
                {runningJourneys.has(journey.id)
                  ? "Running"
                  : journey.lastRun?.status || "Not Run"}
              </Badge>
            </div>
            
            <div className="space-y-2 mb-4">
              {journey.steps.map((step, index) => (
                <div key={index} className="text-sm flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                {journey.lastRun?.timestamp 
                  ? `Last run: ${journey.lastRun.timestamp.toLocaleString()}`
                  : "Never run"}
              </div>
              <Button 
                size="sm"
                onClick={() => runJourney(journey.id)}
                disabled={runningJourneys.has(journey.id)}
              >
                {runningJourneys.has(journey.id) ? "Running..." : "Run Journey"}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {/* Active Journey View */}
      {activeJourney && (
        <Card className="mt-8 p-6">
          <h2 className="text-xl font-semibold mb-4">
            Active Journey: {journeys.find(j => j.id === activeJourney)?.name}
          </h2>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Live Logs</h3>
              <div className="bg-muted rounded-lg p-4 h-[300px] overflow-auto">
                <pre className="text-sm">No logs available</pre>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="font-medium">Screenshots</h3>
              <ScreenshotGallery journeyId={activeJourney} />
            </div>
          </div>
        </Card>
      )}
    </div>
  );
} 