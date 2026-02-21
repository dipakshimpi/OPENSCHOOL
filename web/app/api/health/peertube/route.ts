import { isAntMediaAvailable } from "@/lib/antmedia";
import { NextResponse } from "next/server";

/**
 * Health check endpoint for Ant Media service
 */
export async function GET() {
    try {
        const isAvailable = await isAntMediaAvailable();

        if (isAvailable) {
            return NextResponse.json({
                status: "healthy",
                service: "antmedia",
                message: "Ant Media Server is running"
            });
        } else {
            return NextResponse.json({
                status: "unhealthy",
                service: "antmedia",
                message: "Ant Media Server is offline"
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
