const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const screenshotsDir = path.join(__dirname, 'screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

async function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function captureDetailedScreenshots() {
  let browser;
  try {
    console.log('🚀 Lancement du navigateur...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
      timeout: 30000
    });

    const page = await browser.newPage();
    
    // Configuration mobile
    await page.setViewport({
      width: 375,
      height: 812,
      deviceScaleFactor: 2
    });

    console.log('📱 Navigation vers l\'application...');
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });

    await wait(3000);

    // 1. Écran de login initial
    console.log('📸 Capture 1: Écran d\'accueil/Login');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '01-welcome-login.png'),
      fullPage: false 
    });

    // 2. Tenter de cliquer sur "Pharmacie" pour voir l'interface pharmacie
    console.log('🔍 Clic sur rôle Pharmacie...');
    try {
      await page.click('button:nth-of-type(2)');
      await wait(1500);
      console.log('📸 Capture 2: Interface Pharmacie (login)');
      await page.screenshot({ 
        path: path.join(screenshotsDir, '02-pharmacy-login.png'),
        fullPage: false 
      });
    } catch (e) {
      console.log('⚠️  Clic Pharmacie échoué, continuant...');
    }

    // 3. Retour et essayer Livreur
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await wait(1500);

    console.log('🔍 Clic sur rôle Livreur...');
    try {
      await page.click('button:nth-of-type(3)');
      await wait(1500);
      console.log('📸 Capture 3: Interface Livreur (login)');
      await page.screenshot({ 
        path: path.join(screenshotsDir, '03-rider-login.png'),
        fullPage: false 
      });
    } catch (e) {
      console.log('⚠️  Clic Livreur échoué');
    }

    // 4. Retour et essayer Admin
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await wait(1500);

    console.log('🔍 Clic sur rôle Admin...');
    try {
      await page.click('button:nth-of-type(4)');
      await wait(1500);
      console.log('📸 Capture 4: Interface Admin (login)');
      await page.screenshot({ 
        path: path.join(screenshotsDir, '04-admin-login.png'),
        fullPage: false 
      });
    } catch (e) {
      console.log('⚠️  Clic Admin échoué');
    }

    // 5. Essayer d'utiliser des identifiants demo (si disponibles)
    console.log('📱 Test avec identifiants demo...');
    await page.goto('http://localhost:8081', { 
      waitUntil: 'networkidle2',
      timeout: 30000 
    });
    await wait(2000);

    // Tenter de remplir le formulaire avec un email de test
    console.log('🔐 Tentative de login avec test@example.com...');
    const emailInput = await page.$('input[type="text"], input[placeholder*="mail"], input[placeholder*="Email"]');
    if (emailInput) {
      await emailInput.click();
      await emailInput.type('test@garaperess.sn', { delay: 50 });
    }

    const passwordInput = await page.$('input[type="password"]');
    if (passwordInput) {
      await passwordInput.click();
      await passwordInput.type('password123', { delay: 50 });
    }

    await wait(500);
    console.log('📸 Capture 5: Formulaire rempli');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '05-login-filled.png'),
      fullPage: false 
    });

    // 6. Capture full page scrollable
    console.log('📜 Scroll vers le bas et capture...');
    await page.evaluate(() => window.scrollBy(0, 200));
    await wait(500);
    
    console.log('📸 Capture 6: Formulaire scrollé');
    await page.screenshot({ 
      path: path.join(screenshotsDir, '06-login-scrolled.png'),
      fullPage: false 
    });

    // 7. Essayer de naviguer vers différentes routes (si disponibles)
    console.log('🔗 Test de navigation par URL...');
    const routes = [
      '/login',
      '/signup',
      '/onboarding',
      '/home',
      '/(tabs)/explore',
      '/pharmacy',
      '/rider',
      '/admin'
    ];

    for (let i = 0; i < Math.min(routes.length, 3); i++) {
      const route = routes[i];
      try {
        console.log(`📍 Navigation vers: ${route}`);
        await page.goto(`http://localhost:8081${route}`, { 
          waitUntil: 'networkidle0',
          timeout: 5000 
        }).catch(() => {});
        await wait(1000);
        
        console.log(`📸 Capture: Écran ${route}`);
        await page.screenshot({ 
          path: path.join(screenshotsDir, `07-route-${i + 1}-${route.replace(/\//g, '-')}.png`),
          fullPage: false 
        });
      } catch (e) {
        console.log(`⚠️  Route ${route} non trouvée, passant...`);
      }
    }

    console.log('\n✅ Capture détaillée complète!');
    
    // Lister tous les fichiers
    const files = fs.readdirSync(screenshotsDir);
    console.log(`\n📋 Total: ${files.length} screenshots capturés`);
    files.forEach((file, index) => {
      const filePath = path.join(screenshotsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  ${index + 1}. ${file}`);
    });

  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    if (browser) {
      await browser.close();
      console.log('\n🔒 Navigateur fermé');
    }
  }
}

captureDetailedScreenshots();
