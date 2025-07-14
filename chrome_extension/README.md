# Kod Bloğu Akordiyonu (Dinamik) & Kod Parçacığı Kenar Çubuğu / Dynamic Code Block Accordion & Snippet Sidebar

## English

**Dynamic Code Block Accordion & Snippet Sidebar** is a Chrome extension that enhances code viewing on any webpage. It now provides **three** main features:

1.  **Accordion for `<pre>` blocks (Angular-specific)**
2.  **Sidebar for triple-backtick (``` ``` ) snippets**
3.  **Full-Code Copy button inside AI Studio’s toolbar**

### Features

#### Accordion for `<pre>` blocks (Angular-specific)
- Automatically wraps `<pre>` blocks containing Angular's `_ngcontent-ng-c` attribute with a collapsible container.
- Toggle button (▼/▲) in the top-right of the `<pre>` block to expand/collapse.
- Floating close button (▲) at the bottom-right of an expanded block, which also scrolls the block into view on collapse.
- Smooth scroll animations when opening and closing.

#### Sidebar for triple-backtick snippets
- Adds a draggable floating button (`{}`) to toggle a dedicated sidebar.  
  The button’s position is saved and restored across sessions.
- Scans the entire page for code snippets enclosed in triple backticks (e.g., ```javascript … ```).
- Lists all snippets with a short preview and a **Copy** button.
- Clicking a snippet opens a full-code view with its own **Copy** button and a **Back to List** link.

#### Full-Code Copy button (NEW v1.4)
- Inserts an extra icon (📋) beside AI Studio’s native **Copy to clipboard** / **Download** buttons.
- Copies the **entire content** of the associated `<code>` block, even if scrolled or truncated.
- Shows a quick “✔” feedback for two seconds, then reverts.

### Installation
1. Clone or download this repository.  
2. Open Chrome and navigate to `chrome://extensions/`.  
3. Enable **Developer mode**.  
4. Click **Load unpacked** and select this project folder.  
5. Visit any supported page to see the extension in action.

### Usage

| Feature | How to use |
|---------|------------|
| Accordion | Click the ▼ button at the top-right of an Angular `<pre>` block to expand it. Click the ▲ button at the bottom-right to collapse and auto-scroll into view. |
| Snippet Sidebar | Click the floating `{}` button to open/close the sidebar. In the list, use **Copy** to copy a snippet or click the preview to open full view. |
| Full-Code Copy | Hover over AI Studio’s toolbar under a code card: click the new 📋 button to copy the entire `<code>` section. A ✔ confirms success. |

---

## Türkçe

**Dinamik Kod Bloğu Akordiyonu & Kod Parçacığı Kenar Çubuğu**, herhangi bir web sayfasındaki kod görüntüleme deneyimini geliştiren bir Chrome uzantısıdır. Artık **üç** ana özellik sunar:

1.  **`<pre>` blokları için akordiyon** (Angular’a özgü)  
2.  **Üçlü backtick (``` ``` ) parçacıkları için kenar çubuğu**  
3.  **AI Studio araç çubuğuna tam-kod kopyalama düğmesi**

### Özellikler

#### `<pre>` blokları için akordiyon
- Angular'ın `_ngcontent-ng-c` özniteliğini içeren `<pre>` bloklarını otomatik olarak daraltılabilir bir sarmalayıcı içine alır.
- `<pre>` bloğunun sağ üstünde ▼/▲ geçiş düğmesi.
- Genişletilmiş bloğun sağ alt köşesinde kapanış düğmesi (▲); daraltıldığında bloğu görünür alana kaydırır.
- Açma/kapama sırasında yumuşak kaydırma efektleri.

#### Üçlü backtick parçacıkları için kenar çubuğu
- Sürüklenebilir `{}` düğmesiyle özel kenar çubuğunu açıp kapatın.  
  Konumu kaydedilir ve sonradan geri yüklenir.
- Sayfayı üçlü backtick ile çevrili kodlar için tarar, listeler ve hızlı kopyalama sunar.
- Parçacığa tıklayınca ayrıntılı görünüm ve ek **Kopyala** düğmesi.

#### Tam-Kod Kopyala düğmesi (YENİ v1.4)
- AI Studio’nun **Kopyala** / **İndir** düğmelerinin hemen yanına 📋 simgesi ekler.
- İlgili `<code>` bloğundaki **tüm** içeriği kopyalar, kısıtlama olmaksızın.
- 2 saniyeliğine ✔ işaretiyle başarılı kopyalama bildirimi verir.

### Kurulum
1. Depoyu klonlayın veya indirin.  
2. Chrome’da `chrome://extensions/` sayfasını açın.  
3. **Geliştirici modu**nu etkinleştirin.  
4. **Paketlenmemiş yükle** butonuna tıklayıp proje klasörünü seçin.  
5. Desteklenen bir sayfayı ziyaret ederek uzantıyı deneyin.

### Kullanım

| Özellik | Nasıl kullanılır |
|---------|-----------------|
| Akordiyon | Angular `<pre>` bloğunun sağ üstündeki ▼ düğmesine tıklayın. Genişletildiğinde sağ altta beliren ▲ düğmesi ile kapatın. |
| Tam-Kod Kopyala | AI Studio kartının altındaki araç çubuğunda yeni 📋 simgesine tıklayın. ✔ ile kopyalama onayı alın. |
