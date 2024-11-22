import puppeteer, {type Browser, BrowserContext} from "puppeteer";
import {Mutex} from "async-mutex";
import {LRUCache} from "lru-cache";
import {logger} from "firebase-functions";

let browser: Browser | null = null;
let userAgent: string | null = null;
const getBrowserMutex = new Mutex();

/**
 * Gets the browser instance
 * @return {Promise<Browser>}
 */
export async function getBrowser(): Promise<Browser> {
  const release = await getBrowserMutex.acquire();
  try {
    if (!browser) {
      logger.log("Launching browser");
      browser = await puppeteer.launch({
        headless: true,
        pipe: true,
        args: [
          "--disable-background-timer-throttling",
          "--disable-backgrounding-occluded-windows",
          "--disable-renderer-backgrounding",
          "--disable-setuid-sandbox",
          "--no-sandbox",
        ],
      });
    }
    return browser;
  } finally {
    release();
  }
}

/**
 * Gets the user agent
 * @return {Promise<string>}
 */
export async function getUserAgent(): Promise<string> {
  if (!userAgent) {
    userAgent = await (await getBrowser()).userAgent();
  }
  return userAgent;
}

export const browserContextCache = new LRUCache<string, BrowserContext>({
  max: 10,
  dispose(context) {
    logger.log("Closing browser context");
    context.close().then();
  },
  async fetchMethod() {
    return (await getBrowser()).createBrowserContext();
  },
});
