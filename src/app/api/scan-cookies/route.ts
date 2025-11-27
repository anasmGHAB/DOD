import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteerCore from "puppeteer-core";
import puppeteer from "puppeteer";

export async function POST(request: Request) {
    let browser;
    try {
        const body = await request.json();
        const targetUrl = body.url || "https://www.nespresso.com/fr/fr";

        console.log("Launching browser for cookie scan...");

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

        await page.setUserAgent(
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        await page.setViewport({ width: 1920, height: 1080 });

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
            await new Promise((r) => setTimeout(r, 2000));
        } catch (e) {
            console.log("Cookie banner not found or already accepted.");
        }

        // Extract all cookies
        console.log("Extracting cookies...");
        const cookies = await page.cookies();

        // Categorize cookies based on name patterns
        const categorizedCookies = cookies.map((cookie) => {
            let category = "Necessary";
            const name = cookie.name.toLowerCase();

            if (name.includes("_ga") || name.includes("analytics") || name.includes("_gid")) {
                category = "Analytics";
            } else if (name.includes("ad") || name.includes("marketing") || name.includes("fb")) {
                category = "Marketing";
            } else if (name.includes("pref") || name.includes("lang")) {
                category = "Preferences";
            }

            return {
                name: cookie.name,
                value: cookie.value,
                domain: cookie.domain,
                path: cookie.path,
                expires: cookie.expires,
                httpOnly: cookie.httpOnly,
                secure: cookie.secure,
                sameSite: cookie.sameSite,
                category,
            };
        });

        console.log(`Found ${categorizedCookies.length} cookies.`);
        await browser.close();

        return NextResponse.json({ success: true, data: categorizedCookies });
    } catch (error: any) {
        console.error("Puppeteer error:", error);

        if (browser) {
            try {
                await browser.close();
            } catch (e) { }
        }

        return NextResponse.json(
            { success: false, error: error.message || "Failed to scan cookies" },
            { status: 500 }
        );
    }
}
