const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = process.env.PORT || 3000;

// Variables pour l'email et le mot de passe
const EMAIL = 'gamerzpot12@gmail.com'; // Remplacez par votre email
const PASSWORD = '8&0@IrCV1s'; // Remplacez par votre mot de passe

app.use(express.json());

// Fonction pour taper le mot de passe caractère par caractère
async function typePassword(page, password) {
    for (let char of password) {
        await page.type('#pass', char, { delay: 100 }); // Délai pour simuler la frappe
    }
}

// Fonction pour attendre un certain nombre de millisecondes
function wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

app.get('/scrape', async (req, res) => {
    const { profileUrl } = req.query;

    if (!profileUrl) {
        return res.status(400).json({ error: 'Profile URL is required.' });
    }

    try {
        console.log('Démarrage du navigateur...');
        const browser = await puppeteer.launch({ headless: true }); // Passer à false pour voir le navigateur
        const page = await browser.newPage();

        console.log('Accès à Facebook...');
        await page.goto('https://www.facebook.com', { waitUntil: 'networkidle2' });

        console.log('Tentative d\'acceptation des cookies...');
        await Promise.all([
            page.waitForSelector('div[aria-label="Autoriser tous les cookies"]', { timeout: 5000 }),
            wait(1000) // Utiliser la fonction wait pour un délai
        ]);
        
        await page.click('div[aria-label="Autoriser tous les cookies"]');
        console.log('Cookies acceptés.');

        console.log('Connexion à Facebook...');
        await page.type('#email', EMAIL); // Utilisation de la variable EMAIL
        await typePassword(page, PASSWORD); // Utilisation de la variable PASSWORD
        await page.click('[name="login"]');

        console.log('Attente de la navigation...');
        await page.waitForNavigation({ timeout: 80000 }); // Augmenter le délai d'attente

        console.log(`Accès au profil: ${profileUrl}`);
        await page.goto(profileUrl, { waitUntil: 'networkidle2', timeout: 80000 }); // Augmenter le délai d'attente

        
        console.log('Récupération du HTML...');
        const html = await page.content();
    
        console.log('test recupe image...');
        await page.waitForSelector('img[alt*=", profile picture"]', {visible: true});
        const imgProf = await page.$eval('img[alt*=", profile picture"]', el => el.src);
        console.log(imgProf);

        

        await browser.close();
        res.json({urlProfile: imgProf});
    } catch (error) {
        console.error('Error:', error.message || error); // Afficher l'erreur dans la console
        res.status(500).json({ error: 'An error occurred while scraping the profile.', details: error.message || error });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

