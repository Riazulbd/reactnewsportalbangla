# বাংলা সংবাদ পোর্টাল - Deployment Guide

## ✅ সবচেয়ে সহজ পদ্ধতি (Install Server at Once)

আমরা একটি **Monolith Image (v2.0.0)** তৈরি করেছি যার ভেতরে **PostgreSQL Database** আগে থেকেই ইন্সটল করা আছে। আপনাকে আলাদাভাবে ডাটাবেস সেটআপ করতে হবে না।

### Docker Image
```
eaglearrowsbd/newsportal:v2.0.0
```

### এই ইমেজটিতে যা যা আছে:
1. **Frontend:** React Application
2. **Backend:** Node.js Express API
3. **Database:** PostgreSQL (Pre-installed)
4. **Server:** Nginx

---

## 🚀 Easypanel বা Coolify তে সেটআপ

1. **Service Type:** Docker Image / Application
2. **Image:** `eaglearrowsbd/newsportal:v2.0.0`
3. **Port:** `80` (External)

### Environment Variables
আপনার **কোনো Environment Variable লাগবে না**।
(ডাটাবেস কানেকশন স্বয়ংক্রিয়ভাবে `localhost`-এ সেট করা আছে)

### Persistent Data (Data যাতে মুছে না যায়)
আপনার ডাটাবেস ঠিক রাখতে একটি Volume Mount করুন:

- **Volume Path:** `/var/lib/postgresql/data`

---

## 🛠 ম্যানুয়াল Docker Run

```bash
docker run -d \
  --name newsportal \
  -p 80:80 \
  -v news_data:/var/lib/postgresql/data \
  eaglearrowsbd/newsportal:v2.0.0
```

---

## 🔧 Troubleshooting

যদি API কাজ না করে, তবে Container-এর ভেতরে Seed কমান্ড চালান:
```bash
docker exec -it newsportal node /app/backend/seed.js
```
(প্রথমবার চালু হলে Database অটোমেটিক সেটআপ হয়, কিন্তু ডাটা সিড করতে হতে পারে)
