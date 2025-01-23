import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET(
  request: NextRequest,
  { params }: { params: { journeyId: string } }
) {
  try {
    const screenshotsDir = path.join(process.cwd(), "public", "screenshots", params.journeyId);

    try {
      await fs.access(screenshotsDir);
    } catch {
      // Directory doesn't exist or isn't accessible
      return NextResponse.json([]);
    }

    const files = await fs.readdir(screenshotsDir);
    const pngFiles = files.filter(file => file.endsWith('.png'));

    // Sort files by their numeric prefix
    const screenshots = pngFiles
      .map(file => {
        const name = file.replace(/^\d+-/, '').replace('.png', '');
        return {
          url: file,
          name: name.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
          ).join(' '),
          timestamp: new Date().toISOString(), // We could get actual file timestamp if needed
        };
      })
      .sort((a, b) => {
        const numA = parseInt(a.url.split('-')[0]);
        const numB = parseInt(b.url.split('-')[0]);
        return numA - numB;
      });

    return NextResponse.json(screenshots);
  } catch (error) {
    console.error('Error in screenshots API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch screenshots' },
      { status: 500 }
    );
  }
} 