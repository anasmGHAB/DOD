import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

interface GA4Hit {
    timestamp: string;
    url: string;
    eventName: string;
    parameters: Record<string, string>;
}

export async function POST(request: Request) {
    let browser;
    try {
        const body = await request.json();
        const targetUrl = body.url || "https://www.nespresso.com/fr/fr";

        console.log("Launching browser for GA4 tracking...");
        browser = await puppeteer.launch({
            headless: true,
            args: [
                "--no-sandbox",
                "--disable-setuid-sandbox",
                "--disable-blink-features=AutomationControlled",
            ],
        });
        const page = await browser.newPage();

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        await page.setViewport({ width: 1920, height: 1080 });

        const ga4Hits: GA4Hit[] = [];

        // Intercept network requests
        await page.setRequestInterception(true);
        page.on("request", (req) => {
            req.continue();
        });

        page.on("response", async (response) => {
            const url = response.url();

            // Filter GA4 hits (collect?v=2)
            if (url.includes("google-analytics.com/g/collect") || url.includes("collect?v=2")) {
                try {
                    const parsedUrl = new URL(url);
                    const params: Record<string, string> = {};

                    parsedUrl.searchParams.forEach((value, key) => {
                        params[key] = value;
                    });

                    const eventName = params.en || params.event_name || "unknown";

                    ga4Hits.push({
                        timestamp: new Date().toISOString(),
                        url: url,
                        eventName: eventName,
                        parameters: params,
                    });

                    console.log(`GA4 Hit captured: ${eventName}`);
                } catch (e) {
                    console.error("Error parsing GA4 hit:", e);
                }
            }
        });

        console.log(`Navigating to ${targetUrl}...`);
        await page.goto(targetUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        // Handle Cookie Banner
        try {
            console.log("Waiting for cookie banner...");
            const acceptBtnSelector = "#onetrust-accept-btn-handler";
            await page.waitForSelector(acceptBtnSelector, { timeout: 5000 });
            await page.click(acceptBtnSelector);
            console.log("Cookie banner accepted.");
            await new Promise((r) => setTimeout(r, 2000)); // Wait 2s for initial hits
        } catch (e) {
            console.log("Cookie banner not found.");
        }

        // Scroll down progressively
        console.log("Starting progressive scroll...");
        const scrollSteps = 3;
        for (let i = 0; i < scrollSteps; i++) {
            await page.evaluate((step, total) => {
                const targetScroll = (document.body.scrollHeight / total) * (step + 1);
                window.scrollTo(0, targetScroll);
            }, i, scrollSteps);
            await new Promise((r) => setTimeout(r, 1000)); // Wait 1s between scrolls
            console.log(`Scroll step ${i + 1}/${scrollSteps}`);
        }

        // Scroll to absolute bottom
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        console.log("Reached bottom");

        // Wait for final hits
        await new Promise((r) => setTimeout(r, 2000)); // Wait 2s at bottom

        console.log(`Captured ${ga4Hits.length} GA4 hits.`);
        await browser.close();

        return NextResponse.json({ success: true, data: ga4Hits });
    } catch (error: any) {
        console.error("Puppeteer error:", error);

        if (browser) {
            try {
                await browser.close();
            } catch (e) { }
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to track GA4 hits" },
            { status: 500 }
        );
    }
}
