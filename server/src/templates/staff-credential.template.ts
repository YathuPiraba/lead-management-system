export const getStaffCredentialsTemplate = (
  username: string,
  password: string,
  firstName: string,
  loginUrl: string,
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
            .credentials-container {
                margin: 20px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 5px;
                border-left: 4px solid #4A90E2;
            }
            .credential-item {
                margin: 10px 0;
                padding: 10px;
                background: white;
                border-radius: 3px;
                border: 1px solid #e9ecef;
            }
            .credential-label {
                color: #666;
                font-size: 14px;
                margin-bottom: 5px;
            }
            .credential-value {
                font-size: 16px;
                font-weight: bold;
                color: #4A90E2;
                word-break: break-all;
            }
            .warning-text {
                background-color: #fff3cd;
                border: 1px solid #ffeeba;
                color: #856404;
                padding: 12px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
            }
            .important-note {
                color: #721c24;
                background-color: #f8d7da;
                border: 1px solid #f5c6cb;
                padding: 12px;
                border-radius: 4px;
                margin: 20px 0;
                font-size: 14px;
            }
            .footer {
                text-align: center;
                margin-top: 20px;
                color: #666;
                font-size: 12px;
                padding: 20px;
                border-top: 1px solid #eee;
            }
            .action-required {
                background-color: #4A90E2;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                display: inline-block;
                margin: 10px 0;
                font-weight: bold;
            }
        </style>
    </head>
    <body>
        <div class="email-container">
            <table class="header-table" role="presentation" cellpadding="0" cellspacing="0">
                <tr>
                    <td class="header-cell">
                        <img src="https://res.cloudinary.com/dytx4wqfa/image/upload/v1728032282/pnfqgpmqybjcrlctedp0.jpg" alt="Logo" class="header-logo" />
                        <h2 style="color: white; margin: 10px 0 0;">Welcome to the IMB Team!</h2>
                    </td>
                </tr>
            </table>
            <div class="content">
                <h2>Hello, ${firstName}! 🎉</h2>
                <p>Your staff account has been successfully created. Below are your login credentials:</p>
                
                <div class="credentials-container">
                    <div class="credential-item">
                        <div class="credential-label">Username</div>
                        <div class="credential-value">${username}</div>
                    </div>
                    <div class="credential-item">
                        <div class="credential-label">Temporary Password</div>
                        <div class="credential-value">${password}</div>
                    </div>
                </div>
    
                <div class="action-required">
                    Action Required: Password Change
                </div>
                
                <div class="warning-text">
                    For security purposes, you will be required to change your password when you log in for the first time.
                </div>
                
                <div class="important-note">
                    <strong>Important:</strong> For security reasons, please do not share these credentials with anyone. This email contains sensitive information.
                </div>
                
                <p>To get started:</p>
                <ol>
                    <li>Visit our login page: <a href="${loginUrl}" target="_blank">Login Page</a></li>
                    <li>Enter your username and temporary password</li>
                    <li>You will be prompted to create a new password</li>
                    <li>Choose a strong password that you haven't used before</li>
                </ol>
            </div>
            <div class="footer">
                <p>This is an automated message, please do not reply.</p>
                <p>If you didn't expect this email, please contact your administrator immediately.</p>
            </div>
        </div>
    </body>
    </html>
  `;
