"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
  return (mod && mod.__esModule) ? mod : {"default": mod};
};
Object.defineProperty(exports, "__esModule", {value: true});
exports.getPage = exports.getPages = void 0;
const puppeteer_1 = __importDefault(require("puppeteer"));
const async_mutex_1 = require("async-mutex");

/**
 * A container for a Puppeteer browser context
 */
class Instance {
  /**
   * Create an `Instance` object
   * @constructor
   * @param {string} uid - The uid of the user
   */
  constructor(uid) {
    this.uid = uid;
    this.contextPromise = Instance.browserPromise.then(
        (browser) => browser.createBrowserContext());
    this.mutex = new async_mutex_1.Mutex();
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
  static async getPages(uid, numPages = 1) {
    let instance;
    let context;
    let pagesPromises = [];
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

Instance.mutex = new async_mutex_1.Mutex();
Instance.browserPromise = puppeteer_1.default.launch({
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
Instance.instances = {};

/**
 * Get multiple Puppeteer pages
 * @param {string} uid - The uid of the user
 * @param {number} numPages - The number of pages
 * @return {Promise<PagesResult>}
 */
function getPages(uid, numPages = 1) {
  return Instance.getPages(uid, numPages);
}

exports.getPages = getPages;

/**
 * Get single Puppeteer page
 * @param {string} uid - The uid of the user
 * @return {Promise<PageResult>}
 */
async function getPage(uid) {
  const {pages, close} = await getPages(uid);
  const page = pages[0];
  return {page, close};
}

exports.getPage = getPage;
//# sourceMappingURL=puppeteer.js.map