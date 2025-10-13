export const emailMessages = {
  verifyEmail: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 30px;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">        
            <tr>
                <td style="padding: 0 30px;">
                    <h2>Your verification code</h2>
                </td>
            </tr>
            <tr>
                <td style="text-align: center; padding: 20px;">
                    <span style="display: inline-block; padding: 10px 20px; background-color: #10263C; color: #fff; border-radius: 5px; font-size: 20px">{verificationCode}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                    <p>Best regards, <br /> ZO FIT Team</p>
                </td>
            </tr>
        </table>
    </div>`,
  resetPassword: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 30px;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">        
            <tr>
                <td style="padding: 0 30px;">
                    <h2>Your verification code</h2>
                </td>
            </tr>
            <tr>
                <td style="text-align: center; padding: 20px;">
                    <span style="display: inline-block; padding: 10px 20px; background-color: #10263C; color: #fff; border-radius: 5px; font-size: 20px">{verificationCode}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                    <p>If you have not sent a password recovery request, you can safely ignore this email.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                    <p>Best regards, <br /> ZO FIT Team</p>
                </td>
            </tr>
        </table>
    </div>`,
  registration: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 30px;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">        
            <tr>
                <td style="text-align: center; padding: 20px 0;">
                    <h2>Email Verification</h2>
                    <h3>Congratulations, you have become a member of the ZO FIT</h3>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                    <p>To complete your registration, please enter verification code</p>
                </td>
            </tr>
            <tr>
                <td style="text-align: center; padding: 20px;">
                    <span style="display: inline-block; padding: 10px 20px; background-color: #10263C; color: #fff; border-radius: 5px; font-size: 20px">{verificationCode}</span>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                    <p>If you didn't sign up for ZO FIT, you can safely ignore this email.</p>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                <p>Best regards, <br />ZO FIT Team</p>
                </td>
            </tr>
        </table>
    </div>`,
  socialRegistration: `<div style="font-family: Arial, sans-serif; background-color: #f4f4f4; text-align: center; padding: 30px;">
        <table style="max-width: 600px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">        
            <tr>
                <td style="text-align: center; padding: 20px 0;">
                    <h2>Welcome</h2>
                    <h3>Congratulations, you have become a member of the ZO FIT</h3>
                </td>
            </tr>
            <tr>
                <td style="padding: 0 20px;">
                <p>Best regards, <br />ZO FIT Team</p>
                </td>
            </tr>
        </table>
    </div>`,
};

export function generateEmailMessage(key: string, replacements: object) {
  const messageTemplate = emailMessages[key];

  if (!messageTemplate) {
    return 'Invalid key';
  }

  const processedMessage = Object.keys(replacements).reduce(
    (message, placeholder) => {
      const regex = new RegExp(`\\{${placeholder}\\}`, 'g');
      return message.replace(regex, replacements[placeholder]);
    },
    messageTemplate,
  );

  return processedMessage;
}
