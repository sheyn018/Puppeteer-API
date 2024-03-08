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
    const url = 'https://imgtext-placeholder.onrender.com/?font=merriweather';
    if (!url) {
        return res.status(400).json({ error: 'Missing URL parameter' });
    }
    try {
        const dataUrl = yield captureScreenshot(url);
        if (dataUrl) {
            res.json({ dataUrl });
        }
        else {
            res.status(500).json({ error: 'Failed to generate Data URL' });
        }
    }
    catch (error) {
        console.error('Unexpected error:', error);
        res.status(500).json({ error: 'Unexpected error' });
    }
}));
function captureScreenshot(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const browser = yield puppeteer.launch({
            args: ['--no-sandbox', '--disable-setuid-sandbox'],
        });
        const page = yield browser.newPage();
        try {
            // Increase the navigation timeout (e.g., 60 seconds)
            yield page.goto(url, { timeout: 60000 });
            // Capture a screenshot as a Buffer
            const screenshotBuffer = yield page.screenshot();
            // Convert the Buffer to a data URL
            const dataUrl = `data:image/png;base64,${screenshotBuffer.toString('base64')}`;
            return dataUrl;
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
