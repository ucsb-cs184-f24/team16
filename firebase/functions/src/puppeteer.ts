import puppeteer, {Awaitable, Browser, BrowserContext, Page} from "puppeteer";
import {Mutex} from "async-mutex";

interface PagesResult {
  pages: Page[];
  close: () => Promise<void>;
}

interface PageResult {
  page: Page;
  close: () => Promise<void>;
}

/**
 * A container for a Puppeteer browser context
 */
class Instance {
  static readonly mutex = new Mutex();
  static browserPromise: Promise<Browser> = puppeteer.launch({
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
  static instances: Record<string, Instance> = {};
  private readonly uid: string;
  private readonly contextPromise: Promise<BrowserContext>;
  private readonly mutex: Mutex;

  /**
   * Create an `Instance` object
   * @constructor
   * @param {string} uid - The uid of the user
   */
  private constructor(uid: string) {
    this.uid = uid;
    this.contextPromise = Instance.browserPromise.then(
      (browser) => browser.createBrowserContext()
    );
    this.mutex = new Mutex();
    this.mutex.acquire().then(async (release) => {
      const context = await this.contextPromise;
      context.on("targetdestroyed", async () => {
        const release = await this.mutex.acquire();
        if (Instance.instances[this.uid] &&
            (await context.pages()).length === 0) {
          await context.close();
          delete Instance.instances[this.uid];
        }
        release();
      });
      release();
    });
  }

  /**
   * Get multiple Puppeteer pages
   * @param {string} uid - The uid of the user
   * @param {number} numPages - The number of pages
   * @return {Promise<PagesResult>}
   */
  static async getPages(uid: string, numPages = 1): Promise<PagesResult> {
    let instance: Instance;
    let context: BrowserContext;
    let pagesPromises: Awaitable<Page>[] = [];
    let release = await Instance.mutex.acquire();
    if (Instance.instances[uid]) {
      instance = Instance.instances[uid];
      context = await instance.contextPromise;
    } else {
      instance = Instance.instances[uid] = new Instance(uid);
      context = await instance.contextPromise;
      pagesPromises = await context.pages();
    }
    release();
    const browser = await Instance.browserPromise;
    const userAgent = (await browser.userAgent()).replace(/headless/gi, "");
    release = await instance.mutex.acquire();
    while (pagesPromises.length < numPages) {
      pagesPromises.push(context.newPage().then(async (page) => {
        await page.setUserAgent(userAgent.replace(/headless/gi, ""));
        return page;
      }));
    }
    const pages = await Promise.all(pagesPromises);
    release();
    return {
      pages, async close() {
        const release = await instance.mutex.acquire();
        await Promise.all(pages.map((page) => page.close()));
        release();
      },
    };
  }
}

/**
 * Get multiple Puppeteer pages
 * @param {string} uid - The uid of the user
 * @param {number} numPages - The number of pages
 * @return {Promise<PagesResult>}
 */
export function getPages(uid: string, numPages = 1): Promise<PagesResult> {
  return Instance.getPages(uid, numPages);
}

/**
 * Get single Puppeteer page
 * @param {string} uid - The uid of the user
 * @return {Promise<PageResult>}
 */
export async function getPage(uid: string): Promise<PageResult> {
  const {pages, close} = await getPages(uid);
  const page = pages[0];
  return {page, close};
}
