```markdown
# C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/chrome_extension/README.md
# Kod Bloğu Akordiyonu Chrome Eklentisi

Bu Chrome eklentisi, Google AI Studio'da kod bloklarını daha kullanışlı hale getirir, iş akışını otomatize eder ve IDE entegrasyonu sağlar.

## Özellikler

### 🤖 Sistem Talimatları
- Eklenti popup'ında sistem talimatları metin alanı.
- AI modeline gönderilecek ton ve stil talimatlarını kaydetme.
- Kaydet/Temizle butonları ile kolay yönetim.

### ⚙️ Otomatik Model Ayarları
- Sayfa yüklendiğinde veya ayarlar paneli açıldığında model ayarlarını otomatik olarak yapılandırır.
- **Thinking Budget:** Her zaman etkinleştirilir ve maksimum değer olan `32768`'e ayarlanır.
- **Media Resolution:** Her zaman "Medium" olarak ayarlanır.

### ⚡ Prompt Alanı Kısayolları
- Prompt giriş alanına eklenen hızlı erişim düğmeleri.
- **Git Komutları:** Tek tıkla standart `git add/commit/push` komut istemini gönderir.
- **Dosya Analizi:** Mevcut prompt'un sonuna, proje dosyalarını analiz etme istemi ekler ve gönderir.

### 🎯 IDE Entegrasyonu
- Cursor ve Visual Studio Code desteği.
- Kod bloklarındaki "VS Code'a Gönder" butonu ile kodu doğrudan seçili IDE'ye gönderir.

### 📋 Plan Aşamaları Yönetimi
- Sol panele entegre edilmiş, daraltılabilir bir "Plan Aşamaları" kenar çubuğu.
- Seçili metinleri veya panodaki içeriği plan aşamalarına ekleme.
- Aşamaları düzenleme, silme ve tek tıkla prompt'a gönderme.

### 🔧 Kod Bloğu Yönetimi
- Kod bloklarını akordiyon tarzında daraltıp genişletme.
- Kod bloğu araç çubuğuna eklenen "Tam Kodu Kopyala" butonu.

## Kurulum

1. Chrome'da `chrome://extensions/` adresine gidin.
2. "Geliştirici modu"nu açın.
3. "Paketlenmemiş öğe yükle" butonuna tıklayın.
4. `chrome_extension` klasörünü seçin.

## Kullanım

### Sistem Talimatları & IDE Seçimi
1. Tarayıcı araç çubuğundaki eklenti simgesine tıklayın.
2. Açılan popup'ta sistem talimatlarınızı girip kaydedin veya IDE tercihinizi (Cursor/VS Code) seçin.

### Otomatik Ayarlar
- Eklenti, AI Studio'daki ayarlar panelini her açtığınızda "Thinking Budget" ve "Media Resolution" ayarlarını sizin için otomatik olarak yapar.

### Prompt Kısayolları
- Prompt metin alanının solundaki **Git ()** veya **Analiz ()** ikonlarına tıklayarak ilgili istemleri anında gönderin.

### Kod Blokları
- Kod bloklarındaki başlık çubuğunda bulunan ▼/▲ ikonları ile kodları daraltıp genişletin.
- "IDE'ye Gönder" butonuna tıklayarak kodu doğrudan seçili IDE'nizde açın.

### Plan Aşamaları
- Bir metin seçin ve görünen araç çubuğundan "+" ikonuna tıklayarak plana ekleyin.
- Sol paneldeki "Plan Aşamaları" bölümünden aşamalarınızı yönetin.

## Teknik Detaylar

### Dosya Yapısı
```
chrome_extension/
├── manifest.json          # Eklenti manifesti
├── popup.html            # Popup arayüzü
├── popup.js              # Popup JavaScript
├── popup.css             # Popup stilleri
├── src/
│   ├── main.js           # Ana content script, gözlemciler ve enjeksiyon mantığı
│   ├── handlers.js       # Tüm olay işleyicileri (buton tıklamaları vb.)
│   ├── ui.js             # Arayüz bileşenlerini oluşturan fonksiyonlar
│   ├── state.js          # Oturum durumu yönetimi
│   ├── icons.js          # SVG ikonları
│   ├── messages.js       # Kullanıcı mesajlarını daraltma
│   └── accordion.js      # Kod bloğu akordiyon mantığı
└── styles.css            # Content script stilleri
```

### Storage Keys
- `selectedIDE`: Seçili IDE tercihi (Cursor/VS Code).
- `systemInstructions`: Kaydedilen sistem talimatları.
- `autoApplySystemInstructions`: Talimatların otomatik uygulanıp uygulanmayacağı ayarı.

### API Entegrasyonu
- Chrome Storage API (ayarları kaydetmek için).
- AI Studio DOM manipülasyonu (yeni arayüz elemanları eklemek için).
- IDE deep-link URI'leri (`vscode://` ve `cursor://`).

## Geliştirme

Eklentiyi geliştirmek için:
1. Kaynak dosyalarda değişiklik yapın.
2. `chrome://extensions/` sayfasından eklentiyi yenileyin.
3. AI Studio sayfasını yenileyerek değişiklikleri test edin.

## Lisans

MIT License
```