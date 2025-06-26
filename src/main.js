import crypto from 'crypto';

export default async function (req, res) {
  try {
    // Make sure req.payload exists and is a string
    if (!req.payload) {
      res.status(400).json({ error: 'Missing payload' });
      return;
    }

    const { userId } = JSON.parse(req.payload);

    if (!userId) {
      res.status(400).json({ error: 'Missing userId' });
      return;
    }

    const transaction_uuid = `premium-${userId}-${Date.now()}`;
    const total_amount = '299';
    const product_code = process.env.MERCHANT_ID;
    const secret = process.env.ESEWA_SECRET;
    const baseSuccessURL = process.env.SUCCESS_URL;
    const baseFailureURL = process.env.FAILURE_URL;

    const signData = `total_amount=${total_amount},transaction_uuid=${transaction_uuid},product_code=${product_code}`;
    const signature = crypto
      .createHmac('sha256', secret)
      .update(signData)
      .digest('base64');

    res.status(200).json({
      esewaUrl: 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
      payload: {
        amount: total_amount,
        tax_amount: '0',
        product_delivery_charge: '0',
        product_service_charge: '0',
        total_amount,
        transaction_uuid,
        product_code,
        success_url: `${baseSuccessURL}?userId=${userId}&txn=${transaction_uuid}`,
        failure_url: baseFailureURL,
        signed_field_names: 'total_amount,transaction_uuid,product_code',
        signature,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message || 'Unexpected error' });
  }
}
