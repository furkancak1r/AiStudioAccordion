# GEMINI.md
# Gemini Projesi Teknik Rehberi

Bu belge, AiStudioAccordion projesinin teknik yapısı, mimarisi ve geliştirme süreçleri hakkında Gemini gibi yapay zeka asistanlarına rehberlik etmek amacıyla oluşturulmuştur.

## 1. Projeye Genel Bakış

AiStudioAccordion, Google AI Studio (aistudio.google.com) arayüzünü geliştiren kapsamlı bir araç setidir. Temel amacı, AI Studio'daki karmaşık görevleri planlama, yürütme, yapılandırma ve bu görevlerin çıktılarını yerel bir geliştirme ortamına aktarma iş akışını sorunsuz hale getirmektir.

Başlıca özellikler şunlardır:
1.  **Plan Yöneticisi**: Sol navigasyon paneline entegre edilmiş, çok adımlı görev planlaması için bir kenar çubuğu.
2.  **Prompt Alanı Kısayolları**: Sık kullanılan "Git" ve "Dosya Analizi" komutlarını tek tıkla gönderen düğmeler.
3.  **Otomatik Model Ayarları**: "Thinking Budget" ve "Media Resolution" gibi model ayarlarını sayfa yüklendiğinde otomatik olarak yapılandırır.
4.  **IDE Entegrasyonu**: Kod bloklarını tek tıkla VS Code veya Cursor'a gönderir.
5.  **Arayüz Geliştirmeleri**: Kod blokları için akordiyon ve mesajlar için daraltma gibi çeşitli kullanıcı deneyimi iyileştirmeleri.

## 2. Mimari

Uzantı, AI Studio sayfasına `styles.css` ve bir dizi JavaScript modülünü enjekte eden bir içerik betiği mimarisi kullanır. JavaScript dosyaları `src/` klasörü altında modüler bir yapıda organize edilmiştir:

-   **`src/icons.js`**: Arayüzde kullanılan tüm SVG ikonlarını bir nesne olarak barındırır.
-   **`src/state.js`**: Uygulamanın durumunu (plan aşamaları, kenar çubuğu durumu, IDE tercihi vb.) yönetir ve bu durumu `sessionStorage` veya `localStorage` kullanarak saklar.
-   **`src/ui.js`**: Kenar çubuğu, modal pencereler, araç çubukları ve düğmeler gibi tüm arayüz bileşenlerini oluşturan ve güncelleyen fonksiyonları içerir. (`createGitCommitButton`, `createAnalyzeFilesButton` vb.)
-   **`src/handlers.js`**: Aşama ekleme/silme, prompt'a gönderme, IDE'ye gönderme gibi tüm kullanıcı etkileşimlerini ve olay işleyicilerini barındırır. (`sendGitCommitPrompt`, `sendAnalyzeFilesPrompt` vb.)
-   **`src/main.js`**: Uygulamanın ana giriş noktasıdır. `MutationObserver` kullanarak AI Studio arayüzünün yüklenmesini izler, hazır olduğunda diğer modülleri çağırarak tüm özellikleri (plan yöneticisi, kısayollar, otomatik ayarlar) başlatır.
-   **`src/accordion.js`**, **`src/messages.js`**: Sırasıyla kod bloğu akordiyonu ve mesaj daraltma gibi özel işlevsellik modülleri.

## 3. Temel Teknik Desenler

-   **Dinamik UI Enjeksiyonu**: `main.js` içindeki ana `MutationObserver`, sayfanın DOM değişikliklerini izler. İlgili bileşenler (`ms-app`, `div.prompt-input-wrapper-container`, `ms-settings-view` vb.) DOM'a eklendiğinde, ilgili `enhance...` veya `configure...` fonksiyonlarını çağırarak arayüze yeni özellikler enjekte eder.
-   **Prompt Alanı Geliştirme**: `main.js` içerisindeki `enhancePromptInputArea` fonksiyonu, prompt alanını bulur ve `ui.js`'deki `create...Button` fonksiyonlarını kullanarak "Git" ve "Dosya Analizi" düğmelerini oluşturup "Run" düğmesinin yanına ekler.
-   **Model Ayarları Otomasyonu**: `main.js`'