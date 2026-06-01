import Checkout from "../../models/checkout/checkout.model.js";
import Payment from "../../models/payment/payment.model.js";
import dotenv from "dotenv";
dotenv.config();

export const initializePayment = async (req, res) => {
  const userId = req.user._id;
  const { checkoutId } = req.body;
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;
  const frontendBaseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

  if (!userId) {
    return res
      .status(401)
      .json({ success: false, message: "User not authorized." });
  }

  if (!checkoutId) {
    return res
      .status(400)
      .json({ success: false, message: "Checkout Id is required" });
  }

  if (!paystackSecretKey) {
    return res.status(500).json({
      success: false,
      message: "Payment gateway is not configured. Missing PAYSTACK_SECRET_KEY.",
    });
  }

  try {
    const checkout = await Checkout.findOne({ user: userId, _id: checkoutId });
    if (!checkout) {
      return res
        .status(400)
        .json({ success: false, message: "Checkout not found" });
    }

    const reference = `pay_${Date.now()}`;
    console.log("reference:", reference);

    const payment = await Payment.create({
      user: userId,
      checkout: checkoutId,
      reference,
      amount: checkout.total * 100,
    });

    const paystackRes = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
          Authorization: `Bearer ${paystackSecretKey}`,
        },
        body: JSON.stringify({
          email: checkout.billing.email,
          amount: payment.amount,
          reference,
          callback_url: `${frontendBaseUrl}/user/payment`,
        }),
      },
    );

    const data = await paystackRes.json();

    if (!data.status) {
      return res.status(400).json({
        success: false,
        message: data.message,
      });
    }

    return res.status(200).json({
      success: true,
      message: data.message,
      authorization_url: data.data.authorization_url,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: `Internal server error: ${err.message}`,
    });
  }
};

export const verifyPayment = async (req, res) => {
  const reference = req.query.reference || req.query.trxref;
  const paystackSecretKey = process.env.PAYSTACK_SECRET_KEY;

  if (!reference) {
    return res
      .status(400)
      .json({ success: false, message: "Payment reference is required." });
  }

  if (!paystackSecretKey) {
    return res.status(500).json({
      success: false,
      message: "Payment gateway is not configured. Missing PAYSTACK_SECRET_KEY.",
    });
  }

  try {
    const payment = await Payment.findOne({ reference });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found." });
    }

    const paystackRes = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${paystackSecretKey}`,
        },
      },
    );

    const data = await paystackRes.json();
    console.log("verify data response:", data);

    if (!data?.status || !data?.data) {
      payment.status = "failed";
      await payment.save();
      return res.status(400).json({
        success: false,
        message: data?.message || "Unable to verify payment with Paystack.",
      });
    }

    if (data.data.status === "success") {
      payment.status = "success";
      payment.gatewayResponse = data.data;
      await payment.save();

      await Checkout.findByIdAndUpdate(payment.checkout, {
        status: "paid",
      });

      return res.status(200).json({
        success: true,
        message: "Payment verified successfully",
      });
    } else {
      payment.status = "failed";
      await payment.save();
      return res
        .status(400)
        .json({ success: false, message: "Payment failed" });
    }
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};
