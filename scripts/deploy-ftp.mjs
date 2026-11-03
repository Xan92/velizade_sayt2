// Saytı (dist qovluğunu) FTP ilə hostinqə yükləyir.
// Məlumatlar .env.deploy faylından oxunur, bu fayl GitHub-a getmir.
import { Client } from 'basic-ftp';
import fs from 'fs';
import path from 'path';

const ENV_FILE = '.env.deploy';
const LOCAL_DIR = 'dist';

const readEnv = () => {
  if (!fs.existsSync(ENV_FILE)) return {};
  return Object.fromEntries(
    fs.readFileSync(ENV_FILE, 'utf8')
      .split(/\r?\n/)
      .filter(line => line.trim() && !line.trim().startsWith('#') && line.includes('='))
      .map(line => {
        const i = line.indexOf('=');
        return [line.slice(0, i).trim(), line.slice(i + 1).trim().replace(/^["']|["']$/g, '')];
      })
  );
};

const env = { ...readEnv(), ...process.env };
const missing = ['FTP_HOST', 'FTP_USER', 'FTP_PASSWORD'].filter(k => !env[k]);
if (missing.length) {
  console.error(`\n${ENV_FILE} faylında bu məlumatlar yoxdur: ${missing.join(', ')}`);
  console.error(`.env.deploy.example faylını .env.deploy adı ilə kopyalayıb hostinq məlumatlarını yazın.\n`);
  process.exit(1);
}
if (!fs.existsSync(path.join(LOCAL_DIR, 'index.html'))) {
  console.error('dist qovluğu yoxdur. Əvvəlcə "npm run build" işlədin.');
  process.exit(1);
}

const remoteDir = env.FTP_DIR || 'public_html';
// Hostinq serveri passiv rejimdə daxili şəbəkə ünvanını (192.168...) bildirir;
// bu seçimlə kitabxana həmin ünvanı qoşulduğumuz server IP-si ilə əvəz edir
const client = new Client(60000, { allowSeparateTransferHost: true });

try {
  await client.access({
    host: env.FTP_HOST,
    port: Number(env.FTP_PORT || 21),
    user: env.FTP_USER,
    password: env.FTP_PASSWORD,
    secure: env.FTP_SECURE !== 'false',
    // Paylaşılan hostinqlərin sertifikatı çox vaxt server adına verilir, domenə yox; əlaqə yenə şifrəli qalır
    secureOptions: { rejectUnauthorized: env.FTP_STRICT_TLS === 'true' },
  });
  console.log(`Qoşuldu: ${env.FTP_HOST} → ${remoteDir}`);

  await client.ensureDir(remoteDir);
  await client.uploadFromDir(LOCAL_DIR);
  console.log('Fayllar yükləndi.');

  // Köhnə versiyaların JS/CSS faylları silinir (adında hash olanlar)
  const localAssets = new Set(fs.readdirSync(path.join(LOCAL_DIR, 'assets')));
  await client.cd('assets');
  const stale = (await client.list()).filter(f =>
    f.isFile && /-[\w-]{8}\.(js|css)$/.test(f.name) && !localAssets.has(f.name)
  );
  for (const f of stale) await client.remove(f.name);
  if (stale.length) console.log(`${stale.length} köhnə fayl silindi.`);

  console.log('\nSayt yeniləndi: https://aliza.az\n');
} catch (err) {
  console.error('\nYükləmə alınmadı:', err.message);
  if (/^530/.test(err.message)) {
    console.error('İstifadəçi adı və ya şifrə səhvdir. Hostinq panelində "FTP hesabları" bölməsindəki adı və şifrəni yoxlayın.');
  } else if (/TLS|SSL|certificate/i.test(err.message)) {
    console.error('Hostinq şifrəli FTP-ni dəstəkləmirsə, .env.deploy faylına FTP_SECURE=false yazın.');
  }
  process.exitCode = 1;
} finally {
  client.close();
}
