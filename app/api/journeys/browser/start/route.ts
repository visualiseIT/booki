import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Check if browser is already running by checking for endpoint file
    try {
      await fs.access(".browser-ws-endpoint");
      return NextResponse.json(
        { error: "Browser is already running" },
        { status: 400 }
      );
    } catch {
      // File doesn't exist, which is what we want
    }

    // Start the browser using npm script
    const { stdout, stderr } = await execAsync("npm run browser");

    if (stderr) {
      console.error("Browser start error:", stderr);
      return NextResponse.json(
        { error: "Failed to start browser" },
        { status: 500 }
      );
    }

    // Wait for the endpoint file to be created (max 5 seconds)
    let endpoint = null;
    let attempts = 0;
    while (attempts < 10) {
      try {
        endpoint = await fs.readFile(".browser-ws-endpoint", "utf-8");
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 500));
        attempts++;
      }
    }

    if (!endpoint) {
      return NextResponse.json(
        { error: "Browser started but endpoint not found" },
        { status: 500 }
      );
    }

    return NextResponse.json({ endpoint });
  } catch (error) {
    console.error("Failed to start browser:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 