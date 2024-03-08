const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3001;

app.get('/capture-screenshot', async (req, res) => {
    const url = 'https://imgtext-placeholder.onrender.com/?font=merriweather';

    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }

    try {
        const dataUrl = await captureScreenshot(url);

        if (dataUrl) {
            res.json({ dataUrl });
        } else {
            res.status(500).json({ error: 'Failed to generate Data URL' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
});

async function captureScreenshot(url) {
    const browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
      });      
    const page = await browser.newPage();

    try {
        // Increase the navigation timeout (e.g., 60 seconds)
        await page.goto(url, { timeout: 60000 });

        // Capture a screenshot as a Buffer
        const screenshotBuffer = await page.screenshot();

        // Convert the Buffer to a data URL
        const dataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;

        return dataUrl;
    } catch (error) {
        console.error('Error during navigation:', error.message);
        return null;
    } finally {
        await browser.close();
    }
}

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});