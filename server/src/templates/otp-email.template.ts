export const getOTPEmailTemplate = (
  otp: string,
  expiresInMinutes: number,
  userName: string,
) => `
<!DOCTYPE html>
<html>
<head>
    <style>
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            font-family: Arial, sans-serif;
            padding: 20px;
            background-color: #f7f7f7;
        }
        .header-table {
            width: 100%;
            background-color: #4A90E2;
            border-radius: 5px 5px 0 0;
        }
        .header-cell {
            padding: 20px;
            text-align: center;
        }
        .header-logo {
            max-width: 100px;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .otp-container {
            text-align: center;
            margin: 20px 0;
            padding: 10px;
            background: rgba(0, 0, 0, 0.1);
            border-radius: 5px;
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4A90E2;
            letter-spacing: 5px;
            margin: 0;
        }
        .expiry-text {
            color: #666;
            text-align: center;
            font-size: 14px;
        }
        .footer {
            text-align: center;
            margin-top: 20px;
            color: #666;
            font-size: 12px;
        }
    </style>
</head>
<body>
    <div class="email-container">
        <table class="header-table" role="presentation" cellpadding="0" cellspacing="0">
            <tr>
                <td class="header-cell">
                    <img src="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg" alt="Logo" class="header-logo" />
                    <h2 style="color: white; margin: 10px 0 0;">Password Reset OTP</h2>
                </td>
            </tr>
        </table>
        <div class="content">
            <p>Hello,${userName}</p>
            <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
            </div>
            
            <p class="expiry-text">This OTP will expire in ${expiresInMinutes} minutes.</p>
            
            <p>If you didn't request this, please ignore this email or contact support if you have concerns.</p>
        </div>
        <div class="footer">
            <p>This is an automated email, please do not reply.</p>
        </div>
    </div>
</body>
</html>
`;
