import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
    let browser;
    try {
        const body = await request.json();
        const targetUrl = body.url || "https://www.nespresso.com/fr/fr";

        console.log("Launching browser...");

        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            browser = await puppeteerCore.launch({
                args: chromium.args,
                // @ts-ignore
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                // @ts-ignore
                headless: chromium.headless,
            });
        } else {
            browser = await puppeteer.launch({
                headless: true,
                args: [
                    "--no-sandbox",
                    "--disable-setuid-sandbox",
                    "--disable-blink-features=AutomationControlled",
                ],
            });
        }
        const page = await browser.newPage();

        // Set User-Agent to look like a real browser
        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Set viewport to desktop
        await page.setViewport({ width: 1920, height: 1080 });

        console.log(`Navigating to ${targetUrl}...`);
        // Navigate to target URL
        await page.goto(targetUrl, {
            waitUntil: "domcontentloaded",
            timeout: 30000,
        });

        // Handle OneTrust Cookie Banner
        try {
            console.log("Waiting for cookie banner...");
            const acceptBtnSelector = "#onetrust-accept-btn-handler";
            await page.waitForSelector(acceptBtnSelector, { timeout: 5000 });
            await page.click(acceptBtnSelector);
            console.log("Cookie banner accepted.");
            // Wait a bit for dataLayer to populate after consent
            await new Promise((r) => setTimeout(r, 2000));
        } catch (e) {
            console.log("Cookie banner not found or already accepted (or different selector).");
        }

        // Extract DataLayer
        console.log("Extracting DataLayer...");
        const dataLayer = await page.evaluate(() => {
            // @ts-ignore
            return window.dataLayer || [];
        });

        console.log(`Found ${dataLayer.length} events.`);
        await browser.close();

        return NextResponse.json({ success: true, data: dataLayer });
    } catch (error: any) {
        console.error("Puppeteer error:", error);

        // Try to close browser if open
        if (browser) {
            try {
                await browser.close();
            } catch (e) { }
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to scan datalayer" },
            { status: 500 }
        );
    }
}
