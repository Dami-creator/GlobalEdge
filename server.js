const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

app.post('/verify-payment', async (req, res) => {
    const { reference } = req.body;

    if (!reference) {
        return res.status(400).json({ error: 'Reference required' });
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
        return res.status(500).json({ error: 'PAYSTACK_SECRET_KEY not set' });
    }

    try {
        const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${secretKey}` } }
        );

        const data = response.data;

        if (data.status && data.data.status === 'success') {
            console.log('✅ Payment verified:', reference);
            console.log('📦 Applicant:', data.data.metadata.full_name);
            console.log('📧 Email:', data.data.metadata.email);
            return res.json(data);
        } else {
            return res.status(400).json(data);
        }
    } catch (error) {
        return res.status(500).json({
            error: 'Verification failed',
            details: error.response?.data || error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
