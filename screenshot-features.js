const puppeteer = require('puppeteer');

(async () => {
  try {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Helper to capture a specific area or dialog
    async function captureDialog(triggerText, filename, isXPath = false) {
      console.log(`Capturing ${filename}...`);
      await page.goto('http://localhost:3001', { waitUntil: 'networkidle0', timeout: 30000 });
      await new Promise(r => setTimeout(r, 2000));
      
      let elements = [];
      if (isXPath) {
          elements = await page.$x(`//button[contains(., '${triggerText}')]`);
      } else {
          elements = await page.$$('button');
          let found = null;
          for (const el of elements) {
            const text = await el.evaluate(e => e.innerText);
            if (text.includes(triggerText)) {
              found = el;
              break;
            }
          }
          elements = found ? [found] : [];
      }

      if (elements.length > 0) {
        await elements[0].click();
        await new Promise(r => setTimeout(r, 1000)); // Wait for modal to animate
        
        // Find the modal dialog (role="dialog" or [data-state="open"])
        const dialog = await page.$('[role="dialog"]');
        if (dialog) {
          await dialog.screenshot({ path: `public/${filename}` });
        } else {
          // Fallback to full page if dialog not found
          await page.screenshot({ path: `public/${filename}` });
        }
      } else {
        console.log(`Could not find button with text: ${triggerText}`);
      }
    }

    await captureDialog('Import', 'screenshot-import.png');
    await captureDialog('Tailor to JD', 'screenshot-tailor.png');
    await captureDialog('Reorder', 'screenshot-reorder.png');
    await captureDialog('ATS Score', 'screenshot-ats.png');

    await browser.close();
    console.log('Done capturing feature screenshots!');
  } catch(e) {
    console.error(e);
    process.exit(1);
  }
})();
