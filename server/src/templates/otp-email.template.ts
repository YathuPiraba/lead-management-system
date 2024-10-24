export const getOTPEmailTemplate = (otp: string, expiresInMinutes: number) => `
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
        .header {
            background-color: #4A90E2;
            color: white;
            padding: 20px;
            text-align: center;
            border-radius: 5px 5px 0 0;
        }
        .content {
            background-color: white;
            padding: 20px;
            border-radius: 0 0 5px 5px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #4A90E2;
            text-align: center;
            padding: 20px;
            letter-spacing: 5px;
            margin: 20px 0;
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
        <div class="header">
            <h2>Password Reset OTP</h2>
        </div>
        <div class="content">
            <p>Hello,</p>
            <p>You have requested to reset your password. Please use the following OTP to proceed:</p>
            
            <div class="otp-code">${otp}</div>
            
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
