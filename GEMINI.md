# Gemini Projesi Teknik Rehberi

Bu belge, AiStudioAccordion projesinin teknik yapısı, mimarisi ve geliştirme süreçleri hakkında Gemini gibi yapay zeka asistanlarına rehberlik etmek amacıyla oluşturulmuştur.

## 1. Projeye Genel Bakış

AiStudioAccordion, iki ana bileşenden oluşan bir araç setidir:

1.  **Chrome Uzantısı**: Google AI Studio (aistudio.google.com) arayüzünü geliştirerek, çok adımlı görev planlaması için sol navigasyon paneline entegre bir "Plan Aşamaları" yöneticisi ekler.
2.  **VS Code Uzantısı**: Chrome uzantısı tarafından oluşturulan `vscode://` derin bağlantılarını (deep-link) yakalayarak veya panodan manuel olarak yapıştırılan kodları işleyerek dosyaları otomatik olarak oluşturur ve günceller.

Temel amaç, AI Studio'daki karmaşık görevleri planlama, yürütme ve bu görevlerin çıktılarını yerel bir geliştirme ortamına aktarma iş akışını sorunsuz hale getirmektir.

## 2. Mimari

### 2.1. Chrome Uzantısı (`chrome_extension/`)

Uzantı, AI Studio sayfasına `styles.css` ve bir dizi JavaScript modülünü enjekte eden bir içerik betiği mimarisi kullanır. JavaScript dosyaları `src/` klasörü altında modüler bir yapıda organize edilmiştir:

-   **`src/icons.js`**: Arayüzde kullanılan tüm SVG ikonlarını bir nesne olarak barındırır.
-   **`src/state.js`**: Uygulamanın durumunu (plan aşamaları, kenar çubuğunun durumu vb.) yönetir ve bu durumu `sessionStorage` kullanarak tarayıcı oturumu boyunca saklar.
-   **`src/ui.js`**: Kenar çubuğu, düzenleme modalı ve butonlar gibi tüm arayüz bileşenlerini oluşturan ve güncelleyen fonksiyonları içerir.
-   **`src/handlers.js`**: Aşama ekleme, silme, kopyalama ve prompt'a gönderme gibi kullanıcı etkileşimlerini yöneten tüm olay işleyici fonksiyonlarını barındırır.
-   **`src/main.js`**: Uygulamanın ana giriş noktasıdır. AI Studio arayüzünün yüklenmesini bir `MutationObserver` ile izler ve hazır olduğunda diğer modülleri çağırarak plan yöneticisini başlatır.

### 2.2. VS Code Uzantısı (`vscode_extension/`)

-   **Derin Bağlantı (Deep-Link) Karşılama**: Uzantı, `vscode://furkan.aistudiocopy` URI şemasıyla gönderilen istekleri dinler. Bu istekler genellikle dosya yolu ve içeriği gibi parametreler içerir.
-   **Manuel Kopyalama**: Panodaki metnin ilk satırında `// dosya/yolu.js` gibi bir yorum varsa, uzantının komutu bu yolu algılayarak panodaki geri kalan içeriği bu dosyaya yazar.

## 3. Temel Teknik Desenler

-   **Dinamik UI Enjeksiyonu**: `main.js` içindeki `MutationObserver`, sayfanın yüklenmesini izler. `ms-app` elemanı DOM'a eklendiğinde, `ui.js` içindeki fonksiyonları çağırarak plan yöneticisini sol navigasyon paneline enjekte eder.
-   **Modal Pencere Oluşturma**: `ui.js` içindeki `createEditModal` fonksiyonu, `document.body`'e bir overlay ve bir modal `div`'i ekler. Olay dinleyicileri, modalın dışına tıklandığında veya "İptal" butonuna basıldığında modalı kaldırır.
-   **Prompt Otomasyonu**: `handlers.js` içindeki `sendToPrompt` fonksiyonu şu adımları izler:
    1.  Hedef metin giriş alanını ve "Run" butonunu DOM'dan seçer.
    2.  Metin alanının değerini günceller ve değişikliği tetiklemek için bir `input` olayı gönderir.
    3.  "Run" butonunu programatik olarak tıklar.

## 4. Geliştirme Süreçleri

### 4.1. Chrome Uzantısı

-   **Kurulum**:
    1.  Chrome'da `chrome://extensions/` adresine gidin.
    2.  "Geliştirici modu"nu etkinleştirin.
    3.  "Paketlenmemiş yükle" butonuna tıklayın ve `chrome_extension/` dizinini seçin.
-   **Test**: AI Studio sayfasını yenileyerek değişiklikleri test edin.

### 4.2. VS Code Uzantısı

-   **Bağımlılıklar**: `npm install`
-   **Derleme/İzleme**:
    -   `npm run compile`: Tek seferlik derleme.
    -   `npm run watch`: Değişiklikleri izleyerek otomatik derleme.
-   **Paketleme**: `vsce package` komutu ile `.vsix` dosyası oluşturulur.