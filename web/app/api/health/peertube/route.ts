import { isPeerTubeAvailable } from "@/lib/peertube";
import { NextResponse } from "next/server";

/**
 * Health check endpoint for PeerTube service
 */
export async function GET() {
    try {
        const isAvailable = await isPeerTubeAvailable();

        if (isAvailable) {
            return NextResponse.json({
                status: "healthy",
                service: "peertube",
                message: "Video server is running"
            });
        } else {
            return NextResponse.json({
                status: "unhealthy",
                service: "peertube",
                message: "Video server is offline"
            }, { status: 503 });
        }
    } catch (error) {
        return NextResponse.json({
            status: "error",
            service: "peertube",
            message: error instanceof Error ? error.message : "Unknown error"
        }, { status: 500 });
    }
}
