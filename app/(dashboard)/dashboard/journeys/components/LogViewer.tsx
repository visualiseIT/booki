"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

interface LogEntry {
  timestamp: string;
  message: string;
  level?: "info" | "error" | "warning";
}

interface LogViewerProps {
  journeyId: string;
}

export function LogViewer({ journeyId }: LogViewerProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initial load of existing logs
    const loadLogs = async () => {
      try {
        const response = await fetch(`/api/journeys/logs/${journeyId}`);
        if (!response.ok) throw new Error("Failed to fetch logs");
        const data = await response.json();
        setLogs(data.logs);
      } catch (error) {
        console.error("Error loading logs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadLogs();

    // Set up EventSource for real-time updates
    const eventSource = new EventSource(`/api/journeys/logs/${journeyId}/stream`);
    
    eventSource.onmessage = (event) => {
      const newLog = JSON.parse(event.data);
      setLogs(prev => [...prev, newLog]);
    };

    eventSource.onerror = (error) => {
      console.error("EventSource error:", error);
      eventSource.close();
    };

    return () => {
      eventSource.close();
    };
  }, [journeyId]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const getLogColor = (level?: string) => {
    switch (level) {
      case "error":
        return "text-red-500";
      case "warning":
        return "text-yellow-500";
      default:
        return "text-foreground";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[300px]">
        <p className="text-sm text-muted-foreground">Loading logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setAutoScroll(!autoScroll)}
        >
          {autoScroll ? "Disable Auto-scroll" : "Enable Auto-scroll"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setLogs([])}
        >
          Clear Logs
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] rounded-md border" ref={scrollRef}>
        <div className="p-4 space-y-2">
          {logs.length === 0 ? (
            <p className="text-sm text-muted-foreground">No logs available</p>
          ) : (
            logs.map((log, index) => (
              <div key={index} className="text-sm font-mono">
                <span className="text-muted-foreground">{log.timestamp}</span>
                {" "}
                <span className={getLogColor(log.level)}>{log.message}</span>
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
} 