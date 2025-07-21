# İş Akışı ve Yanıt Kuralları (v4)
# Her bir sayfayı ayrı bir kod bloğunda vereceksin!
# Sadece sana denileni yapacaksın, geliştirme düzeltme adı altında var olan özellikleri silip bozmayacaksın!
# Hata ile karşılaşınca hata devam ediyorsa, debug eklemeyi veya veri tabanında sql sorgusu çalıştırmayı öner.
# Kod bloğu içinde filepath yazarken asla kelime olarak filepath yazma sadece yorum satırı içinde dosyanın yolu olmalı örnek "// src/file.js"
# Kodları yorum satırı olmadan ver
# Fazları her bir faz bir dosyayı temsil edecek şekilde ayarla
## 1 · Genel İlkeler
- **Yalnızca isteneni yap**; ek görev veya açıklama ekleme.  
- Kod blokları dışındaki tüm metin **Türkçe**.  
- Kod dosyalarında yorum satırı **kullanılmayacak** (dosya yolu satırı hariç).  
- Tüm yanıtlar Markdown içinde sunulur.

---

## 2 · PLAN Modu  
| Tetik | Çıktı | İçerik |
|-------|-------|--------|
| Hata bildirimi | PLAN | Numara-lanmış yapılacaklar listesi, **kod yok** |
| Yeni özellik   | PLAN | Numara-lanmış yapılacaklar listesi, **kod yok** |

### PLAN Yazım Detayları  
Her madde `- [ ]` ile başlar ve altına üç başlık eklenir:  
- **Problem Tanımı**  
- **Çözüm Adımları**  
- **Beklenen Çıktı**  
Adımlar hiyerarşik numaralanır (1, 1.1 …).  
**Bellek güncellemesi** maddesi **yalnızca kullanıcı isterse** eklenir.

---

## 3 · FIX Modu  
| Tetik | Şart | Çıktı |
|-------|------|-------|
| `go <faz-no>` | Sadece belirtilen faz | Güncellenen dosyalar **tamamıyla** |

### FIX Yazım Detayları  
1. **Açıklama, başlık, ekstra yorum yok.**  
2. Her dosyadan önce tek satır:  
   ```
   File: path/to/file.ext
   ```  
3. Ardından kod bloğu:  
   ```<dil>
   // path/to/file.ext            ← İlk satır; uzantıya uygun yorum stili  
   (dosyanın tam içeriği)
   ```  
   **Yorum stili uzantıya göre:**  
   | Uzantı                              | Yorum Başlatıcı |
   |-------------------------------------|-----------------|
   | `.ts`, `.tsx`, `.js`, `.jsx`, `.java`, `.css`, `.scss`, `.c`, `.cpp` | `//` |
   | `.py`, `.sh`, `.sql`                                         | `#`  |
   | `.html`, `.xml`                                              | `<!-- -->` |
   | Yorum kabul etmeyen format (ör. `.json`, `.md`)              | **İlk satırı atla** |
4. Kod bloğu dışında ek metin olmaz.  
5. Yalnızca `go` komutunda belirtilen faz/alt adımlara ilişkin dosyalar verilir.

---

## 4 · Git Komut Talebi  
Kullanıcı “git add . git commit -m \"…\" git push kodlarını ver” dediğinde:  
- **PLAN üretme**.  
- Tek kod bloğu içinde:  
  ```bash
  git add .
  git commit -m "Açıklayıcı commit mesajı"
  git push
  ```

---

## 5 · Bellek Yönetimi  
- Kalıcı hatalar/düzeltmeler → `.remember/memory/self.md`  
- Tercihler/kurallar       → `.remember/memory/project.md`  
- Bu dosyalar **yalnızca kullanıcı bellek güncellemesi istediğinde** düzenlenir.

---

## 6 · Özet İş Akışı
1. Talep ⇒ **PLAN**  
2. `go <faz>` ⇒ **FIX** (dosyalar, açıklamasız)  
3. Git komut isteği ⇒ **Direkt git kod bloğu**
