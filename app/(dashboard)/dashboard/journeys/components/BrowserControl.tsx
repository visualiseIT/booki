"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

interface BrowserStatus {
  isRunning: boolean;
  startTime?: Date;
  endpoint?: string;
}

export function BrowserControl() {
  const [status, setStatus] = useState<BrowserStatus>({
    isRunning: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const startBrowser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/journeys/browser/start", {
        method: "POST"
      });
      
      if (!response.ok) {
        throw new Error("Failed to start browser");
      }

      const data = await response.json();
      setStatus({
        isRunning: true,
        startTime: new Date(),
        endpoint: data.endpoint
      });

      toast({
        title: "Browser Started",
        description: "Browser is now running and ready for journeys"
      });
    } catch (error) {
      toast({
        title: "Error Starting Browser",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const stopBrowser = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/journeys/browser/stop", {
        method: "POST"
      });
      
      if (!response.ok) {
        throw new Error("Failed to stop browser");
      }

      setStatus({
        isRunning: false
      });

      toast({
        title: "Browser Stopped",
        description: "Browser has been stopped successfully"
      });
    } catch (error) {
      toast({
        title: "Error Stopping Browser",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Badge variant={status.isRunning ? "success" : "secondary"}>
            Browser Status: {status.isRunning ? "Running" : "Stopped"}
          </Badge>
          <span className="text-sm text-muted-foreground">
            {status.startTime 
              ? `Started: ${status.startTime.toLocaleString()}`
              : "Last started: Never"}
          </span>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {status.endpoint 
              ? `Endpoint: ${status.endpoint}`
              : "Endpoint: Not connected"}
          </div>
          <Button 
            variant="outline"
            onClick={status.isRunning ? stopBrowser : startBrowser}
            disabled={isLoading}
          >
            {isLoading 
              ? "Loading..." 
              : status.isRunning 
                ? "Stop Browser" 
                : "Start Browser"}
          </Button>
        </div>
      </div>
    </Card>
  );
} 