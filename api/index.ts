const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3001;

app.get('/capture-screenshot', async (req: any, res: { status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; json: (arg0: { dataUrl: string; }) => void; }) => {
    const font = req.query.font || 'merriweather'; // Use the provided font or default to 'merriweather'
    const url = `https://imgtext-placeholder.onrender.com/?font=${font}`;

    if (!url) {
        console.log('No URL provided'); // Log when no URL is provided
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        console.log(`Attempting to capture screenshot of: ${url}`); // Log the URL being captured
        const dataUrl = await captureScreenshot(url);

        if (dataUrl) {
            console.log('Screenshot captured successfully'); // Log on success
            res.json({ dataUrl });
        } else {
            console.log('Failed to generate Data URL'); // Log when data URL generation fails
            res.status(500).json({ error: 'Failed to generate Data URL' });
        }
    } catch (error) {
        console.error('Unexpected error:', error); // Log any unexpected errors
        res.status(500).json({ error: 'Unexpected error' });
    }
});
 
async function captureScreenshot(url: string) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });      
    const page = await browser.newPage();

    try {
        await page.goto(url, { timeout: 60000 });

        // Set the viewport height to 50% of the original height
        const originalViewport = page.viewport();
        await page.setViewport({
            width: originalViewport.width,
            height: Math.floor(originalViewport.height * 0.5),
        });

        const screenshotBuffer = await page.screenshot();

        // Optionally log that the screenshot was taken before converting it
        console.log('Screenshot taken, converting to Data URL');

        const dataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

        return dataUrl;
    } catch (error: string | any) {
        console.error('Error during navigation:', error.message); // Log navigation errors
        return null;
    } finally {
        await browser.close();
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`); // Confirmation the server is running
});
