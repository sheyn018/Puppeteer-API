const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3001;

app.get('/capture-screenshot', async (req: { query: { font: string; }; }, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; set: (arg0: string, arg1: string) => void; send: (arg0: any) => void; }) => {
    const font = req.query.font || 'merriweather';
    const url = `https://imgtext-placeholder.onrender.com/?font=${font}`;

    if (!url) {
        console.log('No URL provided');
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        console.log(`Attempting to capture screenshot of: ${url}`);
        const screenshotBuffer = await captureScreenshot(url);

        if (screenshotBuffer) {
            console.log('Screenshot captured successfully');
            res.set('Content-Type', 'image/png');
            res.send(screenshotBuffer);
        } else {
            console.log('Failed to capture screenshot');
            res.status(500).json({ error: 'Failed to capture screenshot' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
});

async function captureScreenshot(url: string, upperPartHeight: number = 250) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });

        // Set the viewport height to capture the upper part
        await page.setViewport({
            width: 1200, // Set the desired width
            height: upperPartHeight,
            deviceScaleFactor: 1,
        });

        // Capture a screenshot of the visible portion
        const screenshotBuffer = await page.screenshot();

        return screenshotBuffer;
    } catch (error: string | any) {
        console.error('Error during navigation:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
