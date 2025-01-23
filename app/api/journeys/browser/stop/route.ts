import { NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";

const execAsync = promisify(exec);

export async function POST() {
  try {
    // Check if browser is running
    try {
      await fs.access(".browser-ws-endpoint");
    } catch {
      return NextResponse.json(
        { error: "Browser is not running" },
        { status: 400 }
      );
    }

    // Kill any running Chrome instances
    if (process.platform === "darwin") {
      await execAsync("pkill -f Chrome");
    } else if (process.platform === "win32") {
      await execAsync("taskkill /F /IM chrome.exe");
    } else {
      await execAsync("pkill -f chrome");
    }

    // Remove the endpoint file
    try {
      await fs.unlink(".browser-ws-endpoint");
    } catch (error) {
      console.error("Failed to remove endpoint file:", error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to stop browser:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 