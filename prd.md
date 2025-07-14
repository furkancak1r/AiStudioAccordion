# Ürün Gereksinimleri Dokümanı: AiStudio Plan Yöneticisi

**Sürüm:** 1.0
**Tarih:** 14.07.2025

## 1. Giriş ve Amaç

Bu belge, Google AI Studio için geliştirilen "Plan Yöneticisi" Chrome uzantısının ürün gereksinimlerini tanımlar. Ürünün temel amacı, Google AI Studio'da karmaşık ve çok adımlı görevleri planlama, yönetme ve yürütme sürecini basitleştirerek kullanıcı verimliliğini artırmaktır. Mevcut arayüzde eksik olan bu planlama katmanı, kullanıcıların prompt'larını daha yapılandırılmış bir şekilde geliştirmelerine olanak tanıyacaktır.

## 2. Hedef Kitle

Bu uzantı, aşağıdaki kullanıcı profillerini hedeflemektedir:

-   **Geliştiriciler**: AI Studio'yu API entegrasyonları, kod üretimi veya karmaşık problem çözümü için birincil araç olarak kullanan yazılım mühendisleri.
-   **Araştırmacılar ve Veri Bilimcileri**: Modellerin yeteneklerini test etmek ve tekrarlanabilir deneyler yapmak için yapılandırılmış prompt setleri oluşturan kişiler.
-   **Power User'lar**: AI Studio'yu düzenli olarak içerik üretimi, metin analizi veya diğer ileri düzey görevler için kullanan ve iş akışlarını optimize etmek isteyen deneyimli kullanıcılar.

## 3. Kullanıcı Hikayeleri

-   **Bir geliştirici olarak**, bir görevi alt adımlara bölmek ve bu adımları AI Studio arayüzünde kolayca takip edebilmek istiyorum, böylece planımı kaybetmeden ilerleyebilirim.
-   **Bir araştırmacı olarak**, test etmek istediğim prompt varyasyonlarını bir liste olarak kaydedebilmek ve her birini tek tıklamayla çalıştırabilmek istiyorum, böylece deneylerimi hızlandırabilirim.
-   **Bir power user olarak**, panomdaki bir metni veya fikri, mevcut iş akışımı bozmadan hızla plan listeme ekleyebilmeliyim.
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

## 5. Kapsam Dışı (Non-Goals)

-   **Cihazlar Arası Senkronizasyon**: Plan aşamaları yalnızca mevcut tarayıcı oturumunda (`sessionStorage`) saklanacaktır. Google Hesabı ile senkronizasyon yapılmayacaktır.
-   **Otomatik İçerik Tarama**: Uzantı, sayfa içeriğini veya kullanıcı girdilerini otomatik olarak tarayıp aşama önermeyecektir. Tüm aşamalar manuel olarak eklenecektir.
-   **Gelişmiş Metin Biçimlendirme**: Aşamalar yalnızca düz metin olarak saklanacaktır. Markdown veya zengin metin desteği bulunmayacaktır.