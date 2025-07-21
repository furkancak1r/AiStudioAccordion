# prd.md
# Ürün Gereksinimleri Dokümanı: AiStudio Plan Yöneticisi

**Sürüm:** 1.1
**Tarih:** 15.07.2025

## 1. Giriş ve Amaç

Bu belge, Google AI Studio için geliştirilen "Plan Yöneticisi" Chrome uzantısının ürün gereksinimlerini tanımlar. Ürünün temel amacı, Google AI Studio'da karmaşık ve çok adımlı görevleri planlama, yönetme, yürütme ve yapılandırma sürecini basitleştirerek kullanıcı verimliliğini artırmaktır. Mevcut arayüzde eksik olan bu otomasyon ve planlama katmanı, kullanıcıların prompt'larını daha yapılandırılmış bir şekilde geliştirmelerine ve tekrarlı görevleri otomatikleştirmelerine olanak tanıyacaktır.

## 2. Hedef Kitle

Bu uzantı, aşağıdaki kullanıcı profillerini hedeflemektedir:

-   **Geliştiriciler**: AI Studio'yu API entegrasyonları, kod üretimi veya karmaşık problem çözümü için birincil araç olarak kullanan ve sık tekrarlanan komutları (örn: git) otomatikleştirmek isteyen yazılım mühendisleri.
-   **Araştırmacılar ve Veri Bilimcileri**: Modellerin yeteneklerini test etmek, tekrarlanabilir deneyler yapmak ve her oturumda model ayarlarını (düşünme bütçesi vb.) tutarlı tutmak isteyen kişiler.
-   **Power User'lar**: AI Studio'yu düzenli olarak içerik üretimi, metin analizi veya diğer ileri düzey görevler için kullanan ve iş akışlarını optimize etmek isteyen deneyimli kullanıcılar.

## 3. Kullanıcı Hikayeleri

-   **Bir geliştirici olarak**, bir görevi alt adımlara bölmek ve bu adımları AI Studio arayüzünde kolayca takip edebilmek istiyorum, böylece planımı kaybetmeden ilerleyebilirim.
-   **Bir geliştirici olarak**, sık kullandığım git komutlarını veya dosya analizi istemlerini tek tıkla gönderebilmek istiyorum, böylece tekrarlı yazma işlemlerinden kurtulabilirim.
-   **Bir araştırmacı olarak**, test etmek istediğim prompt varyasyonlarını bir liste olarak kaydedebilmek ve her birini tek tıklamayla çalıştırabilmek istiyorum, böylece deneylerimi hızlandırabilirim.
-   **Bir power user olarak**, panomdaki bir metni veya fikri, mevcut iş akışımı bozmadan hızla plan listeme ekleyebilmeliyim.
-   **Bir power user olarak**, her oturum başında modelin düşünme bütçesini ve medya çözünürlüğünü manuel olarak ayarlamak zorunda kalmamak, bu ayarların tercih ettiğim değerlerde otomatik olarak yüklenmesini istiyorum.
-   **Bir kullanıcı olarak**, bir plan aşamasının metnini düzenlemek istediğimde, dikkat dağıtmayan bir popup penceresinde bunu yapabilmeliyim.
-   **Bir kullanıcı olarak**, bir plan aşamasını, başına "go" komutunu manuel olarak yazmadan, doğrudan kopyalayabilmeli ve başka bir yerde kullanabilmeliyim.


## 4. Özellik Listesi

### 4.1. Entegre Plan Yöneticisi
-   **Açıklama**: Google AI Studio'nun sol navigasyon paneline, "History" bölümünün altına entegre edilmiş, daraltılıp genişletilebilen bir "Plan Aşamaları" bölümü.
-   **Gereksinimler**:
    -   Bölüm, bir başlık ve tıklanarak açılıp kapanabilen bir içerik alanından oluşmalıdır.
    -   Başlıkta "Plan Aşamaları" metni, "Tümünü Temizle", "Yeni Aşama Ekle" ve "Genişlet/Daralt" ikon butonları bulunmalıdır.
    -   Bölümün durumu (açık/kapalı) tarayıcı oturumu boyunca korunmalıdır.

### 4.2. Aşama Yönetimi
-   **Açıklama**: Kullanıcıların plan aşamalarını oluşturmasını, düzenlemesini, silmesini ve yönetmesini sağlayan temel işlevler.
-   **Gereksinimler**:
    -   **Ekleme**: Başlıktaki "+" butonu, düzenleme için bir modal penceresi açarak yeni bir boş aşama ekler.
    -   **Listeleme**: Her aşama, kompakt bir satırda, kısa bir metin önizlemesi ile listelenir. Farenin üzerine gelindiğinde aşamanın tam metni bir tooltip olarak gösterilir.
    -   **Düzenleme**: Her aşamanın yanındaki "Düzenle" ikonu, sayfanın ortasında içeriğin düzenlenebileceği bir modal penceresi açar.
    -   **Silme**: "Sil" ikonu, ilgili aşamayı listeden kaldırır.
    -   **Kopyalama**: "Kopyala" ikonu, aşama metnini başına "go " öneki eklenmiş olarak panoya kopyalar.

### 4.3. Tek Tıkla Çalıştırma
-   **Açıklama**: Bir plan aşamasını doğrudan ana prompt alanına gönderip çalıştırma özelliği.
-   **Gereksinimler**:
    -   Her aşamanın yanında bir "sağ ok" (Prompt'a Gönder) ikonu bulunmalıdır.
    -   Bu ikona tıklandığında, ilgili aşamanın metni `"go " + metin` formatında ana metin giriş alanına yazılmalı ve "Run" butonu otomatik olarak tetiklenmelidir.

### 4.4. Hızlı İçe Aktarma
-   **Açıklama**: Panodaki metni hızlıca yeni bir aşama olarak ekleme işlevi.
-   **Gereksinimler**:
    -   Plan yöneticisinin en altında "Panodan İçe Aktar" butonu bulunmalıdır.
    -   Bu butona tıklandığında, panodaki mevcut metin (herhangi bir format kontrolü yapılmaksızın) yeni bir aşama olarak listeye eklenmelidir.

## 5. Ek Otomasyon ve Arayüz Geliştirmeleri

### 5.1. Prompt Alanı Kısayol Düğmeleri
-   **Açıklama**: Ana prompt giriş alanının yanına, sık kullanılan komutları tek tıkla göndermek için ikon tabanlı düğmeler ekler.
-   **Gereksinimler**:
    -   **Git Düğmesi**: Tıklandığında, prompt alanını temizler ve `"git add . git commit -m "" git push kodlarını ver"` metnini yazıp otomatik olarak gönderir.
    -   **Dosya Analizi Düğmesi**: Tıklandığında, prompt alanındaki mevcut metnin sonuna `" burası ile ilgili tüm dosyaları tespit et..."` ile başlayan analiz istemini ekler ve gönderir.

### 5.2. Otomatik Model Ayarları Yapılandırması
-   **Açıklama**: Ayarlar paneli açıldığında veya sayfa yüklendiğinde, belirli model ayarlarını otomatik olarak tercih edilen değerlere getirir.
-   **Gereksinimler**:
    -   **Thinking Budget**: "Set thinking budget" seçeneği her zaman etkinleştirilmelidir (toggle 'on'). Değeri, maksimum olan `32768`'e ayarlanmalıdır.
    -   **Media Resolution**: Açılır menüden "Medium" seçeneği otomatik olarak seçilmelidir.

## 6. Kapsam Dışı (Non-Goals)

-   **Cihazlar Arası Senkronizasyon**: Plan aşamaları ve ayarlar yalnızca mevcut tarayıcı oturumunda (`sessionStorage`) veya yerel depolamada (`localStorage`) saklanacaktır. Google Hesabı ile senkronizasyon yapılmayacaktır.
-   **Otomatik İçerik Tarama**: Uzantı, sayfa içeriğini veya kullanıcı girdilerini otomatik olarak tarayıp aşama önermeyecektir. Tüm aşamalar manuel olarak eklenecektir.
-   **Gelişmiş Metin Biçimlendirme**: Aşamalar yalnızca düz metin olarak saklanacaktır. Markdown veya zengin metin desteği bulunmayacaktır.