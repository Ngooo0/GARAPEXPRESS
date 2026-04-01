const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots');

// Créer le dossier screenshots s'il n'existe pas
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function captureScreenshots() {
  let browser;
  try {
    console.log('🚀 Lancement du navigateur...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      timeout: 30000
    });

    const page = await browser.newPage();
    
    // Configuration de la page - Écran mobile responsive
    await page.setViewport({
      width: 375,  // iPhone se width
      height: 812, // iPhone se height
      deviceScaleFactor: 2
    });

    console.log('📱 Accès à l\'application...');
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await new Promise(resolve => setTimeout(resolve, 2000));

    console.log('📸 Capture de l\'écran initial...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-loading.png'),
      fullPage: false 
    });

    // Attendre que l'app se charge complètement
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('📸 Capture de l\'écran d\'accueil...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '02-home.png'),
      fullPage: false 
    });

    // Essayer de cliquer sur le bouton "Signin" ou "Login" s'il existe
    console.log('🔍 Recherche des boutons d\'interaction...');
    
    // Prendre un screenshot après attente
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log('📸 Capture de la vue stabilisée...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '03-stable-view.png'),
      fullPage: false 
    });

    // Essayer de scroller
    console.log('📜 Scroll vertical...');
    await page.evaluate(() => window.scrollBy(0, 300));
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('📸 Capture après scroll...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '04-scrolled.png'),
      fullPage: false 
    });

    // Revenir en haut
    await page.evaluate(() => window.scrollTo(0, 0));
    await new Promise(resolve => setTimeout(resolve, 500));

    // Prendre un screenshot full page si possible
    console.log('📸 Capture full page...');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-full-page.png'),
      fullPage: true
    });

    console.log('✅ Screenshots capturés avec succès!');
    console.log(`📁 Sauvegardés dans: ${screenshotsDir}`);
    
    // Lister les fichiers créés
    const files = fs.readdirSync(screenshotsDir);
    console.log('\n📋 Fichiers créés:');
    files.forEach((file, index) => {
      const filePath = path.join(screenshotsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${index + 1}. ${file} (${(stats.size / 1024).toFixed(2)} KB)`);
    });

  } catch (error) {
    console.error('❌ Erreur lors de la capture:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('🔒 Navigateur fermé');
    }
  }
}

captureScreenshots();
