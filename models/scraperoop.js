// ignore this for now lmao

const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const privateData = require("./mosqueDataPrivate.json");
class Mosque {
	constructor(
		city,
		value,
		dropdownid,
		name,
		longitude,
		latitude,
		fajr,
		zuhr,
		asr,
		maghrib,
		esha,
		url
	) {
		this.city = city;
		this.value = value;
		this.dropdownid = dropdownid;
		this.name = name;
		this.latitude = latitude;
		this.longitude = longitude;
		this.fajr = fajr;
		this.zuhr = zuhr;
		this.asr = asr;
		this.maghrib = maghrib;
		this.esha = esha;
		this.url = url;
	}

	async openSite() {
		console.log(this.url);
		let browser = await puppeteer.launch({
			headless: true,
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
		});
		const page = await browser.newPage();
		await page.goto(this.url);

		this.getTimes(page);
	}

	async getTimes(page) {
		try {
			await page.goto(this.url);
			await page.waitForSelector(this.fajr);
			await page.waitForSelector(this.zuhr);
			await page.waitForSelector(this.asr);
			await page.waitForSelector(this.maghrib);
			await page.waitForSelector(this.esha);

			let data = await page.evaluate((that) => {
				let fajr = document.querySelector(that.fajr).innerText;
				let zuhr = document.querySelector(that.zuhr).innerText;
				let asr = document.querySelector(that.asr).innerText;
				let maghrib = document.querySelector(that.maghrib).innerText;
				let esha = document.querySelector(that.esha).innerText;

				return {
					city: that.city,
					value: that.name + "Data",
					dropdownid: that.dropdownid,
					name: that.name,
					longitude: that.longitude,
					latitude: that.latitude,
					fajr,
					zuhr,
					asr,
					maghrib,
					esha,
				};
			}, this);
			this.saveToVariable(data);
			await page.close();
		} catch (err) {
			await page.close();
			console.log("Couldn't get data because: \n" + err);
		}
	}

	saveToVariable(data) {
		// console.log(data);
		//return this.value;
		try {
			let mosquesJson = fs.readFileSync(
				path.join(__dirname, "../public/data") + "/mosqueData.json",
				"utf-8"
			);
			let mosques = JSON.parse(mosquesJson);
			mosques[data.value] = data;
			mosquesJson = JSON.stringify(mosques);
			fs.writeFileSync(
				path.join(__dirname, "../public/data") + "/mosqueData.json",
				mosquesJson,
				"utf-8"
			);
		} catch (error) {
			console.log(error);
		}
	}
}

//jamimosque.openSite();
var scrapeit = async function scrapeSite() {
	Object.entries(privateData).forEach(async (mosque) => {
		return new Mosque(...Object.values(mosque[1])).openSite();
	});
};

module.exports = scrapeit;
