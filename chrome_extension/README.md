# Kod Bloğu Akordiyonu Chrome Eklentisi

Bu Chrome eklentisi, Google AI Studio'da kod bloklarını daha kullanışlı hale getirir ve IDE entegrasyonu sağlar.

## Özellikler

### 🤖 Sistem Talimatları
- Eklenti popup'ında sistem talimatları metin alanı
- AI modeline gönderilecek ton ve stil talimatları
- localStorage'da otomatik kaydetme
- Kaydet/Temizle butonları ile kolay yönetim

### 🎯 IDE Entegrasyonu
- Cursor ve Visual Studio Code desteği
- Kod bloklarını doğrudan IDE'ye gönderme
- Deep-link entegrasyonu

### 📋 Plan Aşamaları
- Seçili metinleri plan aşamalarına ekleme
- Sidebar'da aşamaları görüntüleme
- Aşamaları prompt'a gönderme

### 🔧 Kod Bloğu Yönetimi
- Akordiyon tarzı kod blokları
- Tam kod kopyalama
- IDE'ye gönderme butonları

## Kurulum

1. Chrome'da `chrome://extensions/` adresine gidin
2. "Geliştirici modu"nu açın
3. "Paketlenmemiş öğe yükle" butonuna tıklayın
4. `chrome_extension` klasörünü seçin

## Kullanım

### Sistem Talimatları
1. Eklenti simgesine tıklayın
2. "Sistem Talimatları" bölümünde metin alanına talimatlarınızı yazın
3. "Kaydet" butonuna tıklayın
4. Artık tüm prompt'larda bu talimatlar otomatik olarak eklenecek

### IDE Seçimi
1. Eklenti simgesine tıklayın
2. Cursor veya Visual Studio Code seçin
3. Seçiminiz kaydedilecek ve kod blokları bu IDE'ye gönderilecek

### Kod Blokları
- Kod bloklarında "IDE'ye Gönder" butonuna tıklayın
- Kod otomatik olarak seçili IDE'de açılacak

### Plan Aşamaları
- Metin seçin ve sağ tık yapın
- "Plan Aşamalarına Ekle" seçeneğini seçin
- Sidebar'da aşamaları görüntüleyin ve prompt'a gönderin

## Teknik Detaylar

### Dosya Yapısı
```
chrome_extension/
├── manifest.json          # Eklenti manifesti
├── popup.html            # Popup arayüzü
├── popup.js              # Popup JavaScript
├── popup.css             # Popup stilleri
├── src/
│   ├── main.js           # Ana content script
│   ├── handlers.js       # Event handler'lar
│   ├── ui.js             # UI bileşenleri
│   └── ...
└── styles.css            # Content script stilleri
```

### Storage Keys
- `selectedIDE`: Seçili IDE tercihi
- `systemInstructions`: Sistem talimatları

### API Entegrasyonu
- Chrome Storage API kullanımı
- AI Studio DOM manipülasyonu
- IDE deep-link URI'leri

## Geliştirme

Eklentiyi geliştirmek için:
1. Dosyaları düzenleyin
2. Chrome'da eklentiyi yenileyin
3. AI Studio'da test edin

## Lisans

MIT License
