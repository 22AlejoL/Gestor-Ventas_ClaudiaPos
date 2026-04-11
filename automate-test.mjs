import puppeteer from 'puppeteer-core';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function automateClaudiaPOS() {
  console.log('🚀 Iniciando automatización de ClaudiaPOS...\n');
  
  // Iniciar navegador con Edge
  console.log('📱 Paso 1: Iniciando Edge...');
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
    headless: false,
    args: ['--start-maximized'],
    defaultViewport: null
  });
  
  const page = await browser.newPage();
  
  try {
    // Navegar a la app
    console.log('🌐 Paso 2: Navegando a http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
    await page.waitForTimeout(2000);
    
    // Tomar screenshot inicial
    await page.screenshot({ path: '01-login-page.png', fullPage: true });
    console.log('📸 Screenshot guardado: 01-login-page.png');
    
    // Analizar la página
    console.log('\n📋 Analizando página de login...');
    const pageContent = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input')).map(i => ({
        type: i.type,
        placeholder: i.placeholder,
        id: i.id,
        name: i.name
      }));
      const buttons = Array.from(document.querySelectorAll('button')).map(b => ({
        text: b.textContent?.trim(),
        type: b.type
      }));
      return { inputs, buttons, url: window.location.href };
    });
    
    console.log('Inputs encontrados:', pageContent.inputs);
    console.log('Botones encontrados:', pageContent.buttons);
    
    // Intentar hacer login
    console.log('\n🔐 Paso 3: Intentando login...');
    
    // Buscar inputs de email y password
    const emailInput = await page.$('input[type="email"]') || 
                       await page.$('input[name="email"]') || 
                       await page.$('input[placeholder*="email" i]') ||
                       await page.$('input#email');
                       
    const passwordInput = await page.$('input[type="password"]') || 
                          await page.$('input[name="password"]');
    
    if (emailInput && passwordInput) {
      // Credenciales de prueba
      await emailInput.type('seller@test.com');
      await passwordInput.type('password123');
      console.log('✅ Credenciales ingresadas: seller@test.com / password123');
      
      // Buscar botón de login
      const loginButton = await page.$('button[type="submit"]') ||
                          await page.$('button:has-text("Login")') ||
                          await page.$('button:has-text("Iniciar")') ||
                          await page.$('button');
      
      if (loginButton) {
        await loginButton.click();
        console.log('✅ Botón de login clickeado');
      }
      
      await page.waitForTimeout(3000);
      await page.screenshot({ path: '02-after-login.png', fullPage: true });
      console.log('📸 Screenshot guardado: 02-after-login.png');
    } else {
      console.log('⚠️ No se encontraron inputs de login. Página puede ser diferente.');
    }
    
    // Verificar estado actual
    const currentUrl = page.url();
    console.log('\n📍 URL actual:', currentUrl);
    
    const pageTitle = await page.title();
    console.log('📄 Título:', pageTitle);
    
    // Analizar la página actual
    const currentContent = await page.evaluate(() => {
      const headings = Array.from(document.querySelectorAll('h1, h2, h3')).map(h => h.textContent?.trim()).filter(Boolean);
      const links = Array.from(document.querySelectorAll('a')).map(a => ({
        text: a.textContent?.trim(),
        href: a.href
      })).filter(l => l.text);
      const allButtons = Array.from(document.querySelectorAll('button')).map(b => b.textContent?.trim()).filter(Boolean);
      return { headings, links: links.slice(0, 10), buttons: allButtons.slice(0, 10) };
    });
    
    console.log('\n📝 Headings:', currentContent.headings);
    console.log('🔗 Links:', currentContent.links);
    console.log('🔘 Botones:', currentContent.buttons);
    
    console.log('\n✅ Automatización completada!');
    console.log('📁 Revisa las screenshots generadas.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    await page.screenshot({ path: 'error-screenshot.png', fullPage: true });
  }
  
  // Mantener el navegador abierto para que el usuario pueda interactuar
  console.log('\n💡 El navegador permanecerá abierto. Ciérralo manualmente cuando termines.');
  console.log('Presiona Ctrl+C en la terminal para cerrar este script.');
  
  // Esperar indefinidamente
  await new Promise(() => {});
}

automateClaudiaPOS();
