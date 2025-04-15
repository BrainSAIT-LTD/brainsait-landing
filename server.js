require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname)));

// إعداد Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: true,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// نقطة نهاية API للنشرة البريدية
app.post('/api/newsletter/subscribe', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'البريد الإلكتروني مطلوب' });
    }

    try {
        // إرسال رسالة تأكيد الاشتراك
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: email,
            subject: 'مرحباً بك في النشرة البريدية لبراين سايت',
            html: `
                <div dir="rtl" style="text-align: right;">
                    <h2>مرحباً بك في النشرة البريدية لبراين سايت</h2>
                    <p>شكراً لاشتراكك في نشرتنا البريدية. سنقوم بإرسال آخر الأخبار والتحديثات إليك.</p>
                    <p>مع تحيات فريق براين سايت</p>
                </div>
            `
        });

        // إرسال إشعار للإدارة
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: 'اشتراك جديد في النشرة البريدية',
            text: `تم تسجيل اشتراك جديد في النشرة البريدية:\n${email}`
        });

        res.json({ message: 'تم الاشتراك بنجاح' });
    } catch (error) {
        console.error('خطأ في إرسال البريد:', error);
        res.status(500).json({ error: 'حدث خطأ في معالجة طلبك' });
    }
});

// نقطة نهاية API لنموذج الاتصال
app.post('/api/contact', async (req, res) => {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة' });
    }

    try {
        await transporter.sendMail({
            from: process.env.SMTP_FROM,
            to: process.env.ADMIN_EMAIL,
            subject: `رسالة جديدة من ${name}: ${subject || 'بدون موضوع'}`,
            html: `
                <div dir="rtl" style="text-align: right;">
                    <h3>رسالة جديدة من نموذج الاتصال</h3>
                    <p><strong>الاسم:</strong> ${name}</p>
                    <p><strong>البريد الإلكتروني:</strong> ${email}</p>
                    <p><strong>الموضوع:</strong> ${subject || 'بدون موضوع'}</p>
                    <p><strong>الرسالة:</strong></p>
                    <p>${message}</p>
                </div>
            `
        });

        res.json({ message: 'تم إرسال رسالتك بنجاح' });
    } catch (error) {
        console.error('خطأ في إرسال البريد:', error);
        res.status(500).json({ error: 'حدث خطأ في معالجة طلبك' });
    }
});

app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ ${PORT}`);
});
