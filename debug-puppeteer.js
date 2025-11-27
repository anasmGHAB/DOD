const chromium = require('@sparticuz/chromium');
const puppeteerCore = require('puppeteer-core');
const puppeteer = require('puppeteer');

(async () => {
    console.log("Starting debug script...");
    try {
        console.log("Launching browser...");
        let browser;

        if (process.env.NODE_ENV === 'production' || process.env.VERCEL) {
            // Configuration Vercel / Production
            console.log("Running in Production/Vercel environment");
            browser = await puppeteerCore.launch({
                args: chromium.args,
                defaultViewport: chromium.defaultViewport,
                executablePath: await chromium.executablePath(),
                headless: chromium.headless,
            });
        } else {
            // Configuration Local
            console.log("Running in Local environment");
            browser = await puppeteer.launch({
                headless: true,
                args: ["--no-sandbox", "--disable-setuid-sandbox"],
            });
        }
        console.log("Browser launched.");

        const page = await browser.newPage();
        console.log("Page created.");

        await page.setViewport({ width: 1920, height: 1080 });

        console.log("Navigating to Nespresso...");
        await page.goto("https://www.nespresso.com/fr/fr", {
            waitUntil: "networkidle2",
            timeout: 60000,
        });
        console.log("Navigation complete.");

        // Check for cookie banner
        try {
            console.log("Looking for cookie banner...");
            const acceptBtnSelector = "#onetrust-accept-btn-handler";
            await page.waitForSelector(acceptBtnSelector, { timeout: 5000 });
            console.log("Cookie banner found. Clicking...");
            await page.click(acceptBtnSelector);
            console.log("Clicked cookie banner.");
            await new Promise((r) => setTimeout(r, 2000));
        } catch (e) {
            console.log("Cookie banner issue (might be absent or different selector):", e.message);
        }

        console.log("Extracting DataLayer...");
        const dataLayer = await page.evaluate(() => {
            return window.dataLayer || [];
        });

        console.log("DataLayer extracted:", JSON.stringify(dataLayer, null, 2));

        await browser.close();
        console.log("Browser closed. Success!");
    } catch (error) {
        console.error("CRITICAL ERROR:", error);
    }
})();
