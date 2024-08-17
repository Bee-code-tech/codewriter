import * as puppeteer from 'puppeteer';
import * as fs from 'fs';
import * as path from 'path';

export async function generateGif(code: string): Promise<string> {
    const gifPath = path.join(require('os').homedir(), 'Desktop', 'code.gif');

    // Launch a headless browser
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    // Set the HTML content with the code to type out
    await page.setContent(`
        <html>
        <body style="margin: 0; padding: 0; background-color: black; color: white;">
            <pre id="code" style="font-family: monospace; white-space: pre-wrap; font-size: 16px; line-height: 1.5;"></pre>
        </body>
        <script>
            const codeElement = document.getElementById('code');
            const code = \`${code.replace(/`/g, '\\`')}\`;
            let currentIndex = 0;
            
            function typeCode() {
                if (currentIndex < code.length) {
                    codeElement.textContent = code.slice(0, currentIndex + 1);
                    currentIndex++;
                    setTimeout(typeCode, 50); // Adjust speed as needed
                } else {
                    captureScreenshot();
                }
            }

            function captureScreenshot() {
                window.setTimeout(() => {
                    document.title = "capture"; // Signal to puppeteer to capture the screenshot
                }, 1000);
            }

            typeCode();
        </script>
    `);

    // Wait for the page to finish typing out the code
    await page.waitForFunction(() => document.title === 'capture');

    // Capture the final screenshot
    await page.screenshot({ path: gifPath });

    await browser.close();

    return gifPath;
}
