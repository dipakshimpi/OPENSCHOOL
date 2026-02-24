import crypto from 'crypto';
import { NextRequest } from "next/server";

/**
 * 🔒 SECURE HIGH-PERFORMANCE VIDEO PROXY
 *
 * TOKEN FORMAT: HEX( streamId|userId|expire:hmacSHA256 )
 *   - Hex contains only [0-9a-f] — zero URL-special characters
 *   - Never split by Next.js router, never mangled by URL encoding
 *   - Compared to Base64 this eliminates: +, /, =, %3D, %2B issues entirely
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ artifact: string[] }> }
) {
    try {
        const { artifact } = await params;

        if (!artifact || artifact.length === 0) {
            return new Response("Missing token", { status: 400 });
        }

        // 1. The token is the first segment (hex-encoded, no slashes possible)
        //    Remaining segments like 'video.mp4' are ignored
        const hexToken = artifact[0];

        // Validate it looks like hex before trying to decode
        if (!/^[0-9a-fA-F]+$/.test(hexToken)) {
            console.error(`❌ [Proxy] Token is not valid hex. Got: ${hexToken.substring(0, 20)}...`);
            return new Response("Invalid Token Format", { status: 400 });
        }

        // 2. Hex decode → UTF-8 string → "tokenData:signature"
        const decoded = Buffer.from(hexToken, 'hex').toString('utf-8');

        // Split at the LAST colon: [streamId|userId|expire]:[hmac]
        const lastColonIndex = decoded.lastIndexOf(':');
        if (lastColonIndex === -1) {
            console.error("❌ [Proxy] No ':' separator found after hex decode.");
            return new Response("Malformed Token", { status: 400 });
        }

        const tokenData = decoded.substring(0, lastColonIndex);
        const signature = decoded.substring(lastColonIndex + 1);

        const [streamId, userId, expire] = tokenData.split('|');
        if (!streamId || !userId || !expire) {
            console.error("❌ [Proxy] Incomplete token fields:", tokenData.substring(0, 40));
            return new Response("Malformed Payload", { status: 400 });
        }

        // 3. HMAC-SHA256 Verification
        const secret = process.env.NEXTAUTH_SECRET || "default_local_secret";
        const expectedHmac = crypto.createHmac('sha256', secret).update(tokenData).digest('hex');

        if (signature !== expectedHmac) {
            console.error(`🛡️ [Proxy] HMAC mismatch for user ${userId.substring(0, 8)}`);
            return new Response("Unauthorized", { status: 403 });
        }

        // 4. Expiry check
        if (Date.now() / 1000 > parseInt(expire)) {
            console.warn(`🛡️ [Proxy] Expired token for user ${userId.substring(0, 8)}`);
            return new Response("Token Expired", { status: 403 });
        }

        // 5. Build Ant Media upstream URL
        const amsBaseUrl = process.env.NEXT_PUBLIC_ANT_MEDIA_URL?.replace(/\/$/, "");
        const appName = process.env.ANT_MEDIA_APP_NAME || "LiveApp";
        const targetUrl = `${amsBaseUrl}/${appName}/streams/${streamId}.mp4`;

        console.log(`📡 [Proxy] OK — streaming ${streamId} for ${userId.substring(0, 8)}...`);

        // 6. Forward Range header (critical for 206 Partial Content / seeking / duration)
        const range = request.headers.get("range");
        const outgoingHeaders = new Headers();
        if (range) outgoingHeaders.set("Range", range);
        outgoingHeaders.set("User-Agent", request.headers.get("user-agent") || "Mozilla/5.0");

        // 7. Fetch from AMS — no buffering, direct pipe
        const amsResponse = await fetch(targetUrl, {
            headers: outgoingHeaders,
            cache: 'no-store',
        });

        if (amsResponse.status === 404) {
            console.error(`❌ [Proxy] Stream not found on AMS: ${streamId}`);
            return new Response("Video not found", { status: 404 });
        }

        if (!amsResponse.ok && amsResponse.status !== 206) {
            console.error(`❌ [Proxy] AMS upstream error: ${amsResponse.status}`);
            return new Response("Upstream Error", { status: amsResponse.status });
        }

        // 8. Mirror response headers for browser media engine
        const responseHeaders = new Headers();
        const forward = [
            'content-type', 'content-length', 'content-range',
            'accept-ranges', 'cache-control', 'last-modified', 'etag'
        ];
        forward.forEach(h => {
            const v = amsResponse.headers.get(h);
            if (v) responseHeaders.set(h, v);
        });

        // Always set these for seeking support
        responseHeaders.set("Accept-Ranges", "bytes");
        responseHeaders.set("Access-Control-Allow-Origin", "*");
        responseHeaders.set("Access-Control-Expose-Headers", "Content-Range, Content-Length, Accept-Ranges");
        if (!responseHeaders.has("Content-Type")) {
            responseHeaders.set("Content-Type", "video/mp4");
        }

        // 9. Stream body directly — O(1) memory, no buffering
        return new Response(amsResponse.body, {
            status: amsResponse.status,
            statusText: amsResponse.statusText,
            headers: responseHeaders,
        });

    } catch (error) {
        console.error("🎞️ [Proxy] Unhandled error:", error);
        return new Response("Internal Stream Error", { status: 500 });
    }
}
