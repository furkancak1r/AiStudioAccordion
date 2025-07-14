# AI Studio Copy

Panodan kopyalanan markdown kodunu otomatik olarak belirtilen dosya yoluna yazan VS Code eklentisi.

## Özellikler

- Markdown formatındaki kodun ilk satırındaki yorum satırından dosya yolunu otomatik algılar
- Hem `//` hem de `#` yorum formatlarını destekler
- Gerekli dizinleri otomatik oluşturur
- Kodu belirtilen dosyaya yazar ve VS Code'da açar
- Türkçe hata mesajları

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

## Gereksinimler

- VS Code 1.102.0 veya üstü
- Aktif bir çalışma klasörü (workspace)

## Bilinen Sorunlar

- İlk satırda geçerli dosya yolu bulunmazsa hata verir
- Çalışma klasörü yoksa çalışmaz

---

**Keyifli kodlamalar!**