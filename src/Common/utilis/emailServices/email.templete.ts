export const emailTemplete = function(otp:number)  { 
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>[App Name] – Confirm Your Email</title>
    <link
      href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&family=DM+Sans:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      background-color: #0e0a1a;
      font-family: &quot;DM Sans&quot;, sans-serif;
    "
  >
    <table
      width="100%"
      cellpadding="0"
      cellspacing="0"
      border="0"
      style="background-color: #0e0a1a; padding: 40px 16px"
    >
      <tr>
        <td align="center">
          <!-- Card -->
          <table
            width="560"
            cellpadding="0"
            cellspacing="0"
            border="0"
            style="
              max-width: 560px;
              width: 100%;
              border-radius: 20px;
              overflow: hidden;
              background: linear-gradient(160deg, #1a1030 0%, #120d25 100%);
              border: 1px solid rgba(150, 100, 255, 0.18);
              box-shadow: 0 0 60px rgba(120, 60, 255, 0.15);
            "
          >
            <!-- Top Glow -->
            <tr>
              <td
                style="
                  background: linear-gradient(90deg, #7c3aed, #a855f7, #c084fc);
                  height: 4px;
                "
              ></td>
            </tr>

            <!-- Logo -->
            <tr>
              <td align="center" style="padding: 44px 40px 28px">
                <div style="display: inline-block; margin-bottom: 16px">
                  <table>
                    <tr>
                      <td
                        style="
                          width: 52px;
                          height: 52px;
                          background: linear-gradient(135deg, #7c3aed, #a855f7);
                          border-radius: 14px;
                          text-align: center;
                        "
                      >
                        <span style="font-size: 26px; line-height: 52px"
                          >🚀</span
                        >
                      </td>
                    </tr>
                  </table>
                </div>

                <br />

                <span
                  style="
                    font-size: 32px;
                    color: #7c5cbf;
                    letter-spacing: 3px;
                    text-transform: uppercase;
                    font-weight: 800;
                  "
                >
                  Social Media Platform
                </span>
              </td>
            </tr>

            <!-- Divider -->
            <tr>
              <td style="padding: 0 40px">
                <div
                  style="
                    height: 1px;
                    background: linear-gradient(
                      90deg,
                      transparent,
                      rgba(150, 100, 255, 0.3),
                      transparent
                    );
                  "
                ></div>
              </td>
            </tr>

            <!-- Content -->
            <tr>
              <td style="padding: 36px 40px 20px; text-align: center">
                <p
                  style="
                    margin: 0 0 8px;
                    font-size: 22px;
                    font-weight: 700;
                    color: #f0eaff;
                  "
                >
                  Confirm Your Email
                </p>

                <p
                  style="
                    margin: 0;
                    font-size: 15px;
                    color: #9478c8;
                    line-height: 1.6;
                  "
                >
                  Welcome 🎉<br />
                  Enter the code below to activate your account and start
                  connecting.
                </p>
              </td>
            </tr>

            <!-- OTP -->
            <tr>
              <td align="center" style="padding: 20px 40px 32px">
                <table>
                  <tr>
                    <td
                      style="
                        background: linear-gradient(
                          135deg,
                          rgba(124, 58, 237, 0.2),
                          rgba(168, 85, 247, 0.1)
                        );
                        border: 1.5px solid rgba(168, 85, 247, 0.4);
                        border-radius: 16px;
                        padding: 22px 48px;
                        text-align: center;
                      "
                    >
                      <span
                        style="
                          font-family: &quot;Cairo&quot;, sans-serif;
                          font-size: 46px;
                          font-weight: 900;
                          letter-spacing: 12px;
                          color: #e9d5ff;
                        "
                      >
                        ${otp}
                      </span>

                      <span
                        style="
                          font-size: 11px;
                          color: #7c5cbf;
                          letter-spacing: 2px;
                          text-transform: uppercase;
                          display: block;
                          margin-top: 6px;
                        "
                      >
                        Verification Code
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Security Note -->
            <tr>
              <td style="padding: 0 40px 32px">
                <table width="100%">
                  <tr>
                    <td
                      style="
                        background: rgba(239, 68, 68, 0.08);
                        border: 1px solid rgba(239, 68, 68, 0.2);
                        border-radius: 12px;
                        padding: 14px 18px;
                      "
                    >
                      <p style="margin: 0; font-size: 13px; color: #f87171">
                        ⚠️ <strong>Do not share this code</strong> with anyone.
                        We will never ask for it.
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Info -->
            <tr>
              <td style="padding: 0 40px 36px; text-align: center">
                <p
                  style="
                    margin: 0;
                    font-size: 13.5px;
                    color: #6b4fa0;
                    line-height: 1.7;
                  "
                >
                  This code expires in <strong>10 minutes</strong>.<br />
                  If you didn’t create an account, you can safely ignore this
                  email.
                </p>
              </td>
            </tr>
            </tr> 
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`}
