import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST(
  request: NextRequest,
  { params }: { params: { journeyId: string } }
) {
  try {
    // Check if browser is running
    try {
      await fs.access(".browser-ws-endpoint");
    } catch {
      return NextResponse.json(
        { error: "Browser is not running. Please start the browser first." },
        { status: 400 }
      );
    }

    // Validate journey ID
    const validJourneys = ["journey1", "journey2", "journey3", "journey4", "journey5", "journey6"];
    if (!validJourneys.includes(params.journeyId)) {
      return NextResponse.json(
        { error: "Invalid journey ID" },
        { status: 400 }
      );
    }

    // Run the journey using npm script
    const { stdout, stderr } = await execAsync(`npm run ${params.journeyId}`);

    if (stderr) {
      console.error(`Journey ${params.journeyId} error:`, stderr);
      return NextResponse.json(
        { error: `Failed to run journey: ${stderr}` },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      output: stdout
    });
  } catch (error) {
    console.error(`Failed to run journey ${params.journeyId}:`, error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 