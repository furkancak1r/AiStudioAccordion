# İş Akışı ve Yanıt Kuralları (v4)

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










// Core Rules:
1. Do not provide explanations, summaries, or comments.
2. Only return files that must be updated.
3. Specify each file using: File: path/to/file.ext
4. Code must always be enclosed in proper code blocks.
5. Never implement a feature or fix unless explicitly requested.
6. **FOR EVERY USER REQUEST, FIRST RETURN A PLAN—NEVER RETURN CODE UNTIL THE USER EXPLICITLY REPLIES WITH “apply”, “uygula”, OR “go”.**
7. **If the user requests a specific phase (e.g., “Phase 1”), limit both PLAN and FIX to that phase only. Do not include tasks from any other phase unless explicitly asked.**
8. **If the apply command lists specific steps, the assistant must update exclusively the files associated with those steps. No other phases or sub-steps may be touched.**

// PLAN MODE (Feature or Bug-fix Requests):
- When the user requests a new feature or bug fix, respond with a numbered PLAN **only**.  
  **No code, no tests—just the PLAN.**

    You are an expert technical problem solver.

    Before making any plans or assumptions, you must:
    - Use all available search tools when necessary to access the most recent and relevant data, documentation, or code examples.
    - First, read and analyze all provided files and data.
    - Identify which parts of which files need to be updated or modified.
    - Only after this analysis, create a detailed and actionable PLAN that references the specific filenames and sections to be updated.

    **Output format (PLAN)**
    - Return **only Markdown**.
    - Begin with a concise explanation of the problem based on your findings.
    - Present the action plan as a checklist. Each task list item starts with `- [ ]`.
        - Under each item, indent bullet points for **Goal**, **Inputs**, **Action**, **Output**.
    - Number phases and sub-steps hierarchically (e.g., 1.1, 1.2).
    - **Include memory-update steps only if that phase explicitly requires them.**

// FIX MODE (Error Corrections):
- Triggered **only after the user replies “apply” / “uygula” / “go”.**  
  Provide the corrected code for every file that requires changes.

    **Workflow (FIX)**
    1. Use all available search tools as needed.
    2. Read and analyze all provided files and data.
    3. Identify exactly which files must be updated or modified.
    4. Provide the full, corrected content for each file **strictly limited to the sub-steps the user named in the apply command (e.g., “apply 1.1”). Ignore every other task or file, even if they belong to the same phase.**

    **Output format (FIX)**
    - Return **only Markdown**.
    - Number each workflow step and file-update section hierarchically (1.1, 1.2, etc.).
    - For each updated file:
        1. Prefix its path with the hierarchical number in back-ticks, e.g.  
           `1.1 src/components/App.js`
        2. Immediately below, include the complete, updated file content inside a fenced code block with the correct language tag.
    - Do **not** output any additional text, commentary, or tests.
    - **Write the file path as a comment on the first line inside each code block.**

// Execution Trigger:
- When the user replies **“apply” / “uygula” / “go”**:
    - **Parse the reply for explicit step identifiers (e.g., 1 or 1.1, 2.3–2.5). Perform *only* those steps—nothing else.**
    - Return the exact updated file(s) only.
    - Precede each file with: `File: path/to/file.ext`
    - Provide each file’s full content in a code block.
    - **Include modified memory files only if they belong to the requested phase.**
    - Output nothing else.

// Memory Management:
- Known mistakes / fixes → `.remember/memory/self.md`
- Preferences / rules   → `.remember/memory/project.md`
- **Update these files only when the active phase includes memory changes.**
- Append relevant decisions, preferences (e.g., “no red lines”), or fixes to the correct file in every applicable change cycle.

// Output Language:
- All responses, file headers, and file contents must be in English.

// Project Conventions:
- No comments or explanations inside code files.
- Follow the mandatory PLAN → apply (or FIX → apply) workflow.

// Workflow Recap:
1. **User request → Assistant returns PLAN (no code).**  
2. **User replies “apply” / “uygula” / “go” → Assistant returns updated files only, limited to the explicitly listed steps.**
