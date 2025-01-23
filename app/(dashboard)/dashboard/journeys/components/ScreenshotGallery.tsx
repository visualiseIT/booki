"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";

interface Screenshot {
  url: string;
  name: string;
  timestamp: string;
}

interface ScreenshotGalleryProps {
  journeyId: string | null;
}

export function ScreenshotGallery({ journeyId }: ScreenshotGalleryProps) {
  const [screenshots, setScreenshots] = useState<Screenshot[]>([]);
  const [selectedImage, setSelectedImage] = useState<Screenshot | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchScreenshots() {
      if (!journeyId) {
        setScreenshots([]);
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/journeys/screenshots/${journeyId}`);
        const data = await response.json();
        setScreenshots(data);
      } catch (error) {
        console.error('Error fetching screenshots:', error);
      } finally {
        setIsLoading(false);
      }
    }

    setIsLoading(true);
    fetchScreenshots();
  }, [journeyId]);

  if (isLoading) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Loading screenshots...</p>
      </Card>
    );
  }

  if (!journeyId) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">Select a journey to view screenshots</p>
      </Card>
    );
  }

  if (screenshots.length === 0) {
    return (
      <Card className="p-6">
        <p className="text-center text-muted-foreground">No screenshots available for this journey</p>
      </Card>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {screenshots.map((screenshot) => (
          <Card
            key={screenshot.url}
            className="p-2 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => setSelectedImage(screenshot)}
          >
            <div className="relative aspect-video">
              <Image
                src={`/screenshots/${journeyId}/${screenshot.url}`}
                alt={screenshot.name}
                fill
                className="object-cover rounded"
              />
            </div>
            <p className="mt-2 text-sm text-center truncate">{screenshot.name}</p>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative aspect-video">
              <Image
                src={`/screenshots/${journeyId}/${selectedImage.url}`}
                alt={selectedImage.name}
                fill
                className="object-contain"
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 