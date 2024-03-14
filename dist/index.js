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
const port = process.env.PORT || 3001;
app.get('/capture-screenshot', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const font = req.query.font || 'merriweather';
    const url = `https://imgtext-placeholder.onrender.com/?font=${font}`;
    if (!url) {
        console.log('No URL provided');
        return res.status(400).json({ error: 'Missing URL parameter' });
    }
    try {
        console.log(`Attempting to capture screenshot of: ${url}`);
        const screenshotBuffer = yield captureScreenshot(url);
        if (screenshotBuffer) {
            console.log('Screenshot captured successfully');
            res.set('Content-Type', 'image/png');
            res.send(screenshotBuffer);
        }
        else {
            console.log('Failed to capture screenshot');
            res.status(500).json({ error: 'Failed to capture screenshot' });
        }
    }
    catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
}));
function captureScreenshot(url_1) {
    return __awaiter(this, arguments, void 0, function* (url, upperPartHeight = 250) {
        const browser = yield puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = yield browser.newPage();
        try {
            yield page.goto(url, { timeout: 60000 });
            // Set the viewport height to capture the upper part
            yield page.setViewport({
                width: 1200, // Set the desired width
                height: upperPartHeight,
                deviceScaleFactor: 1,
            });
            // Capture a screenshot of the visible portion
            const screenshotBuffer = yield page.screenshot();
            return screenshotBuffer;
        }
        catch (error) {
            console.error('Error during navigation:', error.message);
            return null;
        }
        finally {
            yield browser.close();
        }
    });
}
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
