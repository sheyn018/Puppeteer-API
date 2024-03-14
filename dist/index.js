"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = process.env.PORT || 3000;
let browser; // Adjusted for proper TypeScript typing
// Initialize Puppeteer browser instance
function initBrowser() {
    return __awaiter(this, void 0, void 0, function* () {
        browser = yield puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
            headless: true,
        });
    });
}
app.get('/capture-screenshot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const fontName = req.query.font || 'Playfair Display';
        // Ensure the fontName is URL-encoded correctly
        const encodedFontName = encodeURIComponent(fontName).replace(/%20/g, '+');
        console.log('Font name:', encodedFontName);
        const fontUrl = `https://fonts.googleapis.com/css?family=${encodedFontName}|Playfair+Display+SC|Shippori+Mincho+B1|Merriweather|Merriweather+Sans|Lobster|Lobster+Two`;
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
                    }
                    h1 {
                        text-align: center;
                        font-size: 40px; /* Adjust the font size if necessary */
                    }
                </style>
            </head>
            <body>
                <h1>${fontName}</h1>
            </body>
            </html>
        `;
        const screenshotBuffer = yield captureScreenshot(htmlContent, 400); // Example height for cropping
        if (screenshotBuffer) {
            res.set('Content-Type', 'image/png');
            res.send(screenshotBuffer);
        }
        else {
            res.status(500).json({ error: 'Failed to capture screenshot' });
        }
    }
    catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
}));
function captureScreenshot(htmlContent_1) {
    return __awaiter(this, arguments, void 0, function* (htmlContent, viewportHeight = 200) {
        const page = yield browser.newPage();
        try {
            yield page.setContent(htmlContent);
            // Wait for the fonts to load
            yield page.evaluate(() => document.fonts.ready);
            // Wait for the <h1> element to be visible on the page
            yield page.waitForSelector('h1', { visible: true });
            yield page.setViewport({
                width: 600,
                height: viewportHeight,
                deviceScaleFactor: 1,
            });
            // Capture a screenshot of the specified area
            return yield page.screenshot({
                clip: { x: 0, y: 0, width: 600, height: viewportHeight },
            });
        }
        catch (error) {
            console.error('Error during screenshot capture:', error.message);
            return null;
        }
        finally {
            yield page.close();
        }
    });
}
const server = app.listen(port, () => __awaiter(void 0, void 0, void 0, function* () {
    yield initBrowser();
    console.log(`Server is running on port ${port}`);
}));
server.setTimeout(60000);
process.on('exit', () => {
    if (browser)
        browser.close();
});
