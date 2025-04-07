### Script PRO all-in-one: 
➡️ Langsung deploy, verifikasi, delay random, kirim notifikasi Telegram  
➡️ Loop otomatis terus 🎯

### 📁 Struktur Folder:
```
.
├── contracts/
│   └── HokiReceh.sol
├── scripts/
│   ├── hoki-pro-deployer.js
├── hardhat.config.js
├── .env
```

---

### 🟢 Jalankan dengan:
```bash
npx hardhat run scripts/hoki-pro-deployer.js --network tea-sepolia
```

---

### ✅ Pastikan `.env` kamu berisi:
```
BOT_TOKEN=123456:ABCDEFyourbottoken
CHAT_ID=123456789
```

---

Kalau kamu mau tambah fitur auto-screenshot, log ke file `.txt`, atau notif error spesifik, tinggal bilang aja, gue bantu pasangin biar makin PRO 😎
