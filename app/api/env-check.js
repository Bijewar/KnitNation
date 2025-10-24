// pages/api/env-check.js

export default function handler(req, res) {
    res.status(200).json({
      cashfreeClientId: process.env.NEXT_PUBLIC_CASHFREE_CLIENT_ID,
      cashfreeClientSecret: process.env.NEXT_PUBLIC_CASHFREE_CLIENT_SECRET,
      baseUrl: process.env.NEXT_PUBLIC_BASE_URL
    });
  }
  