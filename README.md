# Kod Bloğu Akordiyonu (Dinamik) & Kod Parçacığı Kenar Çubuğu / Dynamic Code Block Accordion & Snippet Sidebar

## English

**Dynamic Code Block Accordion & Snippet Sidebar** is a Chrome extension that enhances code viewing on any webpage. It provides two main features:
1.  It collapses and expands `<pre>` code blocks containing Angular’s `_ngcontent-ng-c` attribute.
2.  It adds a sidebar to easily find, view, and copy code snippets enclosed in triple backticks (``` ```).

### Features

**Accordion for `<pre>` blocks (Angular-specific):**
- Automatically wraps `<pre>` blocks containing Angular's `_ngcontent-ng-c` attribute with a collapsible container.
- Toggle button (▼/▲) in the top-right of the `<pre>` block to expand/collapse.
- Floating close button (▲) at the bottom-right of an expanded `<pre>` block, which also scrolls the block into view on collapse.
- Smooth scroll animations when opening and closing `<pre>` blocks.

**Sidebar for Triple Backtick (``` ```) Code Snippets:**
- Adds a draggable floating button (icon: `{}`) to toggle a dedicated sidebar. The button's position is saved and restored across sessions.
- The sidebar scans the entire page content for code snippets enclosed in triple backticks (e.g., ```javascript ... ```).
- Lists all found snippets with a short preview and a direct "Copy" button for quick copying.
- Clicking a snippet card in the list opens a full-code view within the sidebar for detailed inspection.
- The full-code view also includes a "Copy" button and a button to navigate back to the snippet list.
- User-friendly interface to browse discovered snippets, view them in detail, and copy their content.
- Sidebar can be closed using its own '✕' button or by toggling the floating `{}` button.

### Installation
1. Clone or download this repository.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable “Developer mode”.
4. Click “Load unpacked” and select this project folder.
5. Visit any page to see the extension in action. The accordion will work on pages with Angular-generated `<pre>` blocks, and the snippet sidebar will work on any page with triple-backticked code blocks.

### Usage

**Accordion Feature:**
- Click the ▼ button at the top-right of an Angular `<pre>` code block (one with `_ngcontent-ng-c` attribute) to expand it.
- Click the ▲ button that appears at the bottom-right (when the block is expanded) to close it and scroll it back into view.

**Snippet Sidebar Feature:**
- Click the floating `{}` button (initially top-right, but draggable) to open the snippet sidebar. Click again to close it.
- To move the `{}` button, simply click and drag it to your preferred position on the screen. Its position will be remembered for future use.
- Once the sidebar is open, it will display a list of code snippets found on the page (those enclosed in ``` ```).
- Browse the list. For each snippet, you can see a preview.
- Click the "Copy" button next to any snippet in the list to copy its full content to your clipboard.
- Click on a snippet card (the preview area) to open a detailed view of the full code within the sidebar.
- In the full view:
    - Use its "Copy Kodu Kopyala" button to copy the entire snippet.
    - Click "Listeye Dön" (Return to List) to go back to the list of snippets.
- To close the sidebar, you can either click the floating `{}` button again or click the '✕' button at the top of the sidebar.

## Türkçe

**Dinamik Kod Bloğu Akordiyonu & Kod Parçacığı Kenar Çubuğu**, herhangi bir web sayfasındaki kod görüntüleme deneyimini geliştiren bir Chrome uzantısıdır. İki ana özellik sunar:
1.  Angular’ın `_ngcontent-ng-c` özniteliğini içeren `<pre>` kod bloklarını daraltıp genişletir.
2.  Üçlü backtick (``` ```) ile çevrelenmiş kod parçacıklarını kolayca bulmak, görüntülemek ve kopyalamak için bir kenar çubuğu ekler.

### Özellikler

**`<pre>` Blokları için Akordiyon (Angular'a özgü):**
- Angular'ın `_ngcontent-ng-c` özniteliğini içeren `<pre>` bloklarını otomatik olarak daraltılabilir bir sarmalayıcı içine alır.
- `<pre>` bloğunun sağ üstünde genişletme/daraltma için bir geçiş düğmesi (▼/▲).
- Genişletilmiş bir `<pre>` bloğunun sağ alt köşesinde kayan bir kapatma düğmesi (▲) bulunur; bu düğme, daraltıldığında bloğu görünüme kaydırır.
- `<pre>` bloklarını açarken ve kapatırken yumuşak kaydırma animasyonları.

**Üçlü Backtick (``` ```) Kod Parçacıkları için Kenar Çubuğu:**
- Özel bir kenar çubuğunu açıp kapatmak için sürüklenebilir bir kayan düğme (ikon: `{}`) ekler. Düğmenin konumu kaydedilir ve oturumlar arasında geri yüklenir.
- Kenar çubuğu, tüm sayfa içeriğini üçlü backtick (örn. ```javascript ... ```) ile çevrelenmiş kod parçacıkları için tarar.
- Bulunan tüm parçacıkları kısa bir önizleme ve hızlı kopyalama için doğrudan bir "Kopyala" düğmesiyle listeler.
- Listedeki bir parçacık kartına tıklamak, ayrıntılı inceleme için kenar çubuğu içinde tam kod görünümünü açar.
- Tam kod görünümü ayrıca bir "Kopyala" düğmesi ve parçacık listesine geri dönmek için bir düğme içerir.
- Keşfedilen parçacıklara göz atmak, bunları ayrıntılı olarak görüntülemek ve içeriklerini kopyalamak için kullanıcı dostu arayüz.
- Kenar çubuğu, kendi '✕' düğmesi kullanılarak veya kayan `{}` düğmesiyle kapatılabilir.

### Kurulum
1. Depoyu klonlayın veya indirin.
2. Chrome’u açıp `chrome://extensions/` adresine gidin.
3. “Geliştirici modu”nu etkinleştirin.
4. “Paketlenmemiş yükle”ye tıklayıp proje klasörünü seçin.
5. Uzantıyı çalışırken görmek için herhangi bir sayfayı ziyaret edin. Akordiyon, Angular tarafından oluşturulmuş `<pre>` blokları olan sayfalarda çalışacak ve kod parçacığı kenar çubuğu, üçlü backtick ile çevrelenmiş kod blokları olan herhangi bir sayfada çalışacaktır.

### Kullanım

**Akordiyon Özelliği:**
- Bir Angular `<pre>` kod bloğunu ( `_ngcontent-ng-c` özniteliğine sahip olan) genişletmek için sağ üst köşesindeki ▼ düğmesine tıklayın.
- Blok genişletildiğinde sağ alt köşede beliren ▲ düğmesine tıklayarak kapatın ve bloğun tekrar görünüme kaydırılmasını sağlayın.

**Kod Parçacığı Kenar Çubuğu Özelliği:**
- Kod parçacığı kenar çubuğunu açmak için kayan `{}` düğmesine (başlangıçta sağ üstte, ancak sürüklenebilir) tıklayın. Kapatmak için tekrar tıklayın.
- `{}` düğmesini taşımak için, üzerine tıklayıp ekranınızda tercih ettiğiniz bir konuma sürüklemeniz yeterlidir. Konumu gelecekteki kullanımlar için hatırlanacaktır.
- Kenar çubuğu açıldığında, sayfada bulunan (``` ``` içine alınmış) kod parçacıklarının bir listesini görüntüler.
- Listeye göz atın. Her parçacık için bir önizleme görebilirsiniz.
- Listedeki herhangi bir parçacığın yanındaki "Kopyala" düğmesine tıklayarak tam içeriğini panonuza kopyalayın.
- Kenar çubuğu içinde tam kodun ayrıntılı bir görünümünü açmak için bir parçacık kartına (önizleme alanı) tıklayın.
- Tam görünümde:
    - Tüm parçacığı kopyalamak için "Kodu Kopyala" düğmesini kullanın.
    - Parçacık listesine geri dönmek için "Listeye Dön" düğmesine tıklayın.
- Kenar çubuğunu kapatmak için ya kayan `{}` düğmesine tekrar tıklayabilir ya da kenar çubuğunun üstündeki '✕' düğmesine tıklayabilirsiniz.