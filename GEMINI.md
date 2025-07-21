<!-- C:/Users/furkan.cakir/Desktop/FurkanPRS/Kodlar/test/AiStudioAccordion/GEMINI.md -->
# GEMINI.md
# Gemini Projesi Teknik Rehberi

Bu belge, AiStudioAccordion projesinin teknik yapısı, mimarisi ve geliştirme süreçleri hakkında Gemini gibi yapay zeka asistanlarına rehberlik etmek amacıyla oluşturulmuştur.

## 1. Projeye Genel Bakış

AiStudioAccordion, Google AI Studio (aistudio.google.com) arayüzünü geliştiren kapsamlı bir araç setidir. Temel amacı, AI Studio'daki karmaşık görevleri planlama, yürütme, yapılandırma ve bu görevlerin çıktılarını yerel bir geliştirme ortamına aktarma iş akışını sorunsuz hale getirmektir.

Başlıca özellikler şunlardır:
1.  **Plan Yöneticisi**: Sol navigasyon paneline entegre edilmiş, çok adımlı görev planlaması için bir kenar çubuğu.
2.  **Prompt Alanı Kısayolları**: Sık kullanılan "Git" ve "Dosya Analizi" komutlarını tek tıkla gönderen düğmeler.
3.  **Otomatik Model Ayarları**: "Thinking Budget" ve "Media Resolution" gibi model ayarlarını sayfa yüklendiğinde otomatik olarak yapılandırır.
4.  **Akıllı IDE Entegrasyonu**: Kod bloklarını tek tıkla VS Code veya Cursor'a gönderir. Bu işlem, kodun tamamını otomatik olarak yükler, akordiyonu kapatır ve sonra kodu IDE'ye aktarır.
5.  **Arayüz Geliştirmeleri**: Kod blokları için akordiyon ve mesajlar için daraltma gibi çeşitli kullanıcı deneyimi iyileştirmeleri.

## 2. Mimari

Uzantı, AI Studio sayfasına `styles.css` ve bir dizi JavaScript modülünü enjekte eden bir içerik betiği mimarisi kullanır. JavaScript dosyaları `src/` klasörü altında modüler bir yapıda organize edilmiştir:

-   **`src/icons.js`**: Arayüzde kullanılan tüm SVG ikonlarını bir nesne olarak barındırır.
-   **`src/state.js`**: Uygulamanın durumunu yönetir.
-   **`src/ui.js`**: Arayüz bileşenlerini oluşturan fonksiyonları içerir.
-   **`src/handlers.js`**: Kullanıcı etkileşimlerini ve olay işleyicilerini barındırır. `sendToVscode` gibi ana işleyici fonksiyonlar burada bulunur.
-   **`src/main.js`**: Uygulamanın ana giriş noktasıdır. `MutationObserver` kullanarak arayüzü izler ve özellikleri başlatır.
-   **`src/accordion.js`**: Kod bloğu akordiyonu ve ilgili yardımcı fonksiyonları (`forceLoadAndGetContent`, `collapseAccordion`) içerir.
-   **`src/messages.js`**: Mesaj daraltma işlevselliğini yönetir.

## 3. Temel Teknik Desenler

-   **Dinamik UI Enjeksiyonu**: `main.js` içindeki `MutationObserver`, sayfanın DOM değişikliklerini izler ve ilgili `enhance...` veya `configure...` fonksiyonlarını çağırarak arayüze yeni özellikler enjekte eder.
-   **Modüller Arası İletişim**: `accordion.js` modülü, `window.AIStudioAccordion` global nesnesi aracılığıyla `forceLoadAndGetContent` ve `collapseAccordion` gibi yardımcı fonksiyonları dışa aktarır. `handlers.js` içerisindeki `sendToVscode` fonksiyonu, bu global nesne üzerinden bu fonksiyonları çağırarak modüller arası iletişim kurar.
-   **Asenkron İş Akışı ile Akıllı IDE Entegrasyonu**:
    1.  `handlers.js`'deki `sendToVscode` fonksiyonu `async` olarak tanımlanmıştır.
    2.  Butona tıklandığında, önce `window.AIStudioAccordion.forceLoadAndGetContent` fonksiyonunu `await` ile çağırır. Bu fonksiyon, tembel yüklemeyi tetiklemek için kod bloğunu programatik olarak kaydırır ve içeriğin tamamı yüklendiğinde tam metni döndürür.
    3.  Ardından, `window.AIStudioAccordion.collapseAccordion` çağrılarak akordiyon kapatılır.
    4.  Son olarak, elde edilen tam kod içeriği kullanılarak IDE'ye gönderme işlemi gerçekleştirilir.
    5.  İşlem boyunca, kullanıcıya görsel geri bildirim sağlamak için butonun ikonu (`sync`, `check`) ve durumu (`disabled`) dinamik olarak değiştirilir.
-   **Prompt Alanı Geliştirme**: `main.js` içerisindeki `enhancePromptInputArea` fonksiyonu, prompt alanını bulur ve `ui.js`'deki `create...Button` fonksiyonlarını kullanarak "Git" ve "Dosya Analizi" düğmelerini oluşturup "Run" düğmesinin yanına ekler.
-   **Model Ayarları Otomasyonu**: `main.js`'deki `configureModelSettings`, ayarlar paneli DOM'a eklendiğinde tetiklenir ve Angular Material bileşenlerini (`mat-slide-toggle`, `mat-select`) programatik olarak `click()` ve `input` olayları ile kontrol ederek istenen değerlere ayarlar.