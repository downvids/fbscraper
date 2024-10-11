const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises;

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Fonction pour attendre un certain nombre de millisecondes
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/', async (req, res) => {
    const { profileUrl } = req.query;

    if (!profileUrl) {
        return res.status(400).json({ error: 'Profile URL is required.' });
    }

    try {
        //Démarrage du navigateur
        console.log('Démarrage du navigateur...');
        const browser = await puppeteer.launch({ headless: true });
        const page = await browser.newPage();
        console.log('Démarrage du navigateur OK');

        //Set cookies
        console.log('Set cookies...');
        const cookies = JSON.parse(await fs.readFile('./cookies.json'));
        await page.setCookie(...cookies);
        console.log('Set cookies OK');
        

        //Set User-Agent
        console.log('Set User-Agent...');
        const customUA = 'Mozilla/5.0 (Linux; U; Android 2.2; fr-fr; Desire_A8181 Build/FRF91) App3leWebKit/53.1 (KHTML, like Gecko) Version/4.0 Mobile Safari/533.1';
        await page.setUserAgent(customUA);
        console.log('Set User-Agent OK');

        //Got to profile FB
        console.log('Go to profile FB...');
        await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 80000 });
        console.log('Go to profile FB OK');

        //Récuperation de l'image de profile
        console.log('Recuperation image...');
        await page.waitForSelector('img[class*="img contain rounded gray-border"]', {visible: true});
        const imgProf = await page.$eval('img[class*="img contain rounded gray-border"]', el => el.src);
        console.log(imgProf);
        console.log('Recuperation image OK');

        //Ferme le navigateur et renvoie json
        await browser.close();
        res.json({imgProfile: imgProf});

    } catch (error) {
        {
            imgProfile: 'https://i.sstatic.net/l60Hf.png'
        }
        res.json();
    }
});

app.listen(PORT, () => {});

