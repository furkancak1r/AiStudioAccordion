# AI Studio Copy

Panodan kopyalanan markdown kodunu otomatik olarak belirtilen dosya yoluna yazan VS Code eklentisi.

## Özellikler

- Markdown formatındaki kodun ilk satırındaki yorum satırından dosya yolunu otomatik algılar
- Hem `//` hem de `#` yorum formatlarını destekler
- Gerekli dizinleri otomatik oluşturur
- Kodu belirtilen dosyaya yazar ve VS Code'da açar
- Türkçe hata mesajları
- Problems (Hatalar/Uyarılar) listesini kod parçalarıyla birlikte panoya kopyalar

## Kullanım

1. Kodu şu formatta panoya kopyalayın:
```
// src/components/Button.tsx
import React from 'react';

const Button = () => {
  return <button>Click me</button>;
};

export default Button;
```

2. VS Code'da `Ctrl+Shift+P` ile komut paletini açın
3. "Paste Markdown Code to File" komutunu arayın ve çalıştırın
4. Kod otomatik olarak `src/components/Button.tsx` dosyasına yazılacak

### Problems (Hatalar) çıktısını kodla kopyalama

1. `Ctrl+Shift+P` ile komut paletini açın
2. "AI Studio: Copy Problems With Code" komutunu seçin
3. "Active file" veya "Entire workspace" kapsamını seçin
4. İlgili sorunlar, mesajları ve kod parçacıklarıyla panoya kopyalanır

## Gereksinimler

- VS Code 1.102.0 veya üstü
- Aktif bir çalışma klasörü (workspace)

## Bilinen Sorunlar

- İlk satırda geçerli dosya yolu bulunmazsa hata verir
- Çalışma klasörü yoksa çalışmaz
- Problems görünümünde seçim yakalama desteklenmediği için komut kapsamı "aktif dosya" veya "tüm çalışma alanı" olarak çalışır

---

**Keyifli kodlamalar!**
