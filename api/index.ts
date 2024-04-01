const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const port = process.env.PORT || 3000;

let browser: { newPage: () => any; close: () => void; }; // Adjusted for proper TypeScript typing

// Initialize Puppeteer browser instance
async function initBrowser() {
    browser = await puppeteer.launch({
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true,
    });
}

app.get('/capture-screenshot', async (req: { query: { font: string; }; }, res: { set: (arg0: string, arg1: string) => void; send: (arg0: any) => void; status: (arg0: number) => { (): any; new(): any; json: { (arg0: { error: string; }): void; new(): any; }; }; }) => {
    try {
        const fontName = req.query.font || 'Playfair Display';
        // Ensure the fontName is URL-encoded correctly
        const encodedFontName = encodeURIComponent(fontName).replace(/%20/g, '+');
        console.log('Font name:', encodedFontName);
        const fontUrl = `https://fonts.googleapis.com/css?family=${encodedFontName}|Playfair+Display+SC|Shippori+Mincho+B1|Merriweather|Merriweather+Sans|Lobster|Lobster+Two`
        console.log('Font URL:', fontUrl);

        const htmlContent = `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <link href="${fontUrl}" rel="stylesheet">
            <style>
                body {
                    font-family: '${fontName}', sans-serif;
                    margin: 0;
                    padding: 0;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 100vh;
                    flex-direction: column; /* Added for vertical alignment */
                }
                .divider {
                    width: 80%; /* Adjust the width as needed */
                    height: 1px; /* Adjust the thickness of the divider */
                    background-color: #ccc; /* Adjust the color of the divider */
                    margin: 10px 30px; /* Adjust the margin top and bottom */
                }
                .preview-container {
                    text-align: center;
                    margin-bottom: 10px; /* Adjust spacing between previews */
                }
                .preview-text {
                    font-size: 23px; /* Adjust the font size if necessary */
                    margin: 0; /* Remove margin */
                    padding: 0; /* Remove padding */
                }

                h1 {
                    font-size: 40px; /* Adjust the font size if necessary */
                    margin-top: 30px; /* Remove margin */
                    padding: 0; /* Remove padding */
                }
            </style>
        </head>
        <body>
            <div class="preview-container">
                <h1>${fontName}</h1>
            </div>
            <div class="divider"></div> <!-- Divider -->
            <div class="preview-container">
                <p class="preview-text">The quick brown fox jumps over the lazy dog</p>
            </div>
            <div class="preview-container">
                <p class="preview-text">ABCDEFGHIJKLMNOPQRSTUVWXYZ</p>
            </div>
            <div class="preview-container">
                <p class="preview-text">abcdefghijklmnopqrstuvwxyz</p>
            </div>
            <div class="preview-container">
                <p class="preview-text">0123456789</p>
            </div>
            <div class="divider"></div> <!-- Divider -->
        </body>
        </html>        
        `;

        const screenshotBuffer = await captureScreenshot(htmlContent, 400); // Example height for cropping

        if (screenshotBuffer) {
            res.set('Content-Type', 'image/png');
            res.send(screenshotBuffer);
        } else {
            res.status(500).json({ error: 'Failed to capture screenshot' });
        }
    } catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
});

async function captureScreenshot(htmlContent: string, viewportHeight = 200) {
    const page = await browser.newPage();

    try {
        await page.setContent(htmlContent);
        // Wait for the fonts to load
        await page.evaluate(() => document.fonts.ready);
        // Wait for the <h1> element to be visible on the page
        await page.waitForSelector('h1', { visible: true });
        await page.setViewport({
            width: 600,
            height: viewportHeight,
            deviceScaleFactor: 1,
        });

        // Capture a screenshot of the specified area
        return await page.screenshot({
            clip: { x: 0, y: 0, width: 600, height: viewportHeight },
        });
    } catch (error: any) {
        console.error('Error during screenshot capture:', error.message);
        return null;
    } finally {
        await page.close();
    }
}

const server = app.listen(port, async () => {
    await initBrowser();
    console.log(`Server is running on port ${port}`);
});

server.setTimeout(60000);

process.on('exit', () => {
    if (browser) browser.close();
});
