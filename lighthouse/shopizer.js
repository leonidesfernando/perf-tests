const fs = require('fs')
const puppeteer = require('puppeteer')
const lighthouse = require('lighthouse/lighthouse-core/fraggle-rock/api.js')

const waitTillHTMLRendered = async (page, timeout = 30000) => {
  const checkDurationMsecs = 1000;
  const maxChecks = timeout / checkDurationMsecs;
  let lastHTMLSize = 0;
  let checkCounts = 1;
  let countStableSizeIterations = 0;
  const minStableSizeIterations = 3;

  while(checkCounts++ <= maxChecks){
    let html = await page.content();
    let currentHTMLSize = html.length; 

    if(lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize) 
      countStableSizeIterations++;
    else 
      countStableSizeIterations = 0; //reset the counter

    if(countStableSizeIterations >= minStableSizeIterations) {
      console.log("Fully Rendered Page: " + page.url());
      break;
    }

    lastHTMLSize = currentHTMLSize;
    await page.waitForTimeout(checkDurationMsecs);
  }  
};


async function captureReport() {
	const browser = await puppeteer.launch({args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--disable-gpu', '--disable-gpu-sandbox', '--display', '--ignore-certificate-errors', '--disable-storage-reset=true', '--start-maximized']});
	//const browser = await puppeteer.launch({"headless": false, args: ['--allow-no-sandbox-job', '--allow-sandbox-debugging', '--no-sandbox', '--ignore-certificate-errors', '--disable-storage-reset=true', '--start-maximized']});
	const page = await browser.newPage();
	const baseURL = "http://localhost";
	
	await page.setViewport({"width":1920,"height":1080});
	await page.setDefaultTimeout(10000);
	await page.setUserAgent( 'UA-TEST' );
	
	const navigationPromise = page.waitForNavigation({timeout: 30000, waitUntil: ['domcontentloaded']});
	await page.goto(baseURL);
    await navigationPromise;
		
	const flow = await lighthouse.startFlow(page, {
		name: 'shopizer',
		configContext: {
		  settingsOverrides: {
			throttling: {
			  rttMs: 40,
			  throughputKbps: 10240,
			  cpuSlowdownMultiplier: 1,
			  requestLatencyMs: 0,
			  downloadThroughputKbps: 0,
			  uploadThroughputKbps: 0
			},
			throttlingMethod: "simulate",
			screenEmulation: {
			  mobile: false,
			  width: 1920,
			  height: 1080,
			  deviceScaleFactor: 1,
			  disabled: false,
			},
			formFactor: "desktop",
			onlyCategories: ['performance'],
		  },
		},
	});

	//================================SELECTORS================================
	const tablesTab      = "a[href='/category/tables']";
	const tableProduct = "a[href='/product/olive-table']";
	const addTableToCart = "#root > div.shop-area.pt-100.pb-100 > div > div > div:nth-child(2) > div > div.pro-details-quality > div.pro-details-cart.btn-hover";

  	//================================Open the application================================
    await flow.navigate(baseURL, {
		stepName: 'open main page'
		});
  	console.log('Main page is opened');
	
	//================================Navigate to "Tables" tab================================
	
	console.log('Opening Tables');
	await flow.startTimespan({ stepName: 'Navigate to "Tables" tab' });
		await page.waitForSelector(tablesTab);
		await page.click(tablesTab);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Tables page is opened');
	

	//================================Open a table product cart (click on a table)================================
	console.log('Clicking on table product');
	await flow.startTimespan({ stepName: 'Open a table product cart (click on a table)' });
		await page.waitForSelector(tableProduct);
		await page.click(tableProduct);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Table product clicked');
	
	//================================Add table to Cart (click "Add to Cart" button)================================
	console.log('Adding table to cart');
	await flow.startTimespan({ stepName: 'Add table to Cart (click "Add to Cart" button)' });
		await page.waitForSelector(addTableToCart);
		await page.click(addTableToCart);
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Table added to cart');

	//================================Open Cart================================
	console.log('Opening Tables');
	await flow.startTimespan({ stepName: 'Open Cart' });
		await page.goto(baseURL+'/cart');
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Cart opened');
	
	//================================Click "Proceed to checkout"================================
	console.log('Click "Proceed to checkout"');
	await flow.startTimespan({ stepName: 'Click "Proceed to checkout"' });
		await page.goto(baseURL+'/checkout');
		await navigationPromise;
		await waitTillHTMLRendered(page);
	await flow.endTimespan();
	console.log('Checkout done');


	//================================REPORTING================================
	const reportPath = __dirname + '/user-flow.report.html';
	//const reportPathJson = __dirname + '/user-flow.report.json';

	const report = await flow.generateReport();
	//const reportJson = JSON.stringify(flow.getFlowResult()).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
	
	fs.writeFileSync(reportPath, report);
	//fs.writeFileSync(reportPathJson, reportJson);
	
    await browser.close();
}
captureReport();
