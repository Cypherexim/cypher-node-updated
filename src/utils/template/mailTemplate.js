export const template = (name, url) => `
    <table width="600" align="center" style="width:600px;font-family: 'sf_ui_displaylight', sans-serif" border="0" cellspacing="6" cellpadding="4">
        <tbody>
            <tr>
                <th align="left" valign="middle" style="padding: 15px 22px;" scope="col"><a href="https://www.Cypher.com/"><img src="https://cypherexim-files.s3.amazonaws.com/cypher_logo.png" width="180" height="" alt="" /></a></th>
                <th align="right" valign="middle" style="padding: 15px 0px; " scope="col"><a href="https://www.Cypher.com/"><img src="https://Cypher-email-template.s3.ap-south-1.amazonaws.com/logo/ministry.png" width="160" height="" alt="" /></a></th>
                <th align="right" valign="middle" style="padding: 15px 22px 15px 15px;" scope="col"><a href="https://www.Cypher.com/"><img src="https://Cypher-email-template.s3.ap-south-1.amazonaws.com/logo/aicte-2.png" width="50" height="" alt="" /></a></th>
            </tr>
        </tbody>    
    </table>
    
    <table width="600" align="center" style="width:600px; font-family: 'sf_ui_displaylight', sans-serif" border="0" align="center">
        <tbody>
            <tr>
                <td style=" padding: 14px;">
                    <h4 style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:600">
                        Hello ${name},
                    </h4>

                    <p style="color:#4CBFA6; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:600;">
                        Greetings from Cypher!
                    </p>

                    <p style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:300;">
                        Thank you for choosing our services. Your requested report is ready for download, click on the given link below: 
                    </p>

                    <a style="text-decoration: underline;font-style: italic" href="${url}" target="_blank">
                        <span style="color: blue;">click here</span>
                    </a>
                
                    <br>
                
                    <p style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:300;">
                        Please note that the download link provided is set to expire in 7 days after your download is complete. Ensure that you download the data promptly to avoid any inconvenience.
                    </p>

                    <p style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:300;">
                        In the event that you need to download the data after the link has expired, kindly click on the link and submit a request. You can expect a response within 24 hours, and we will provide you with a new link promptly.
                    </p>
                    
                    <p style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:300;">
                        If you have any further questions or require assistance, feel free to reach out to our team. 
                    </p>

                    <p style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:300;">
                        We appreciate your prompt attention to this matter.
                    </p>

                    <p style="color:#000; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:600;">
                        Best Regards,
                    </p>
                    
                    <p style="color:#4CBFA6;; font-size:14px !important; line-height:22px !important;-webkit-text-size-adjust:100%; font-family: 'Roboto', sans-serif; font-weight:600;">Cypher Team</p>
                </td>
            </tr>
        </tbody>
    </table>

    
    <table width="600px" style="width:600px;height:100% ;border-collapse: collapse; font-family: 'sf_ui_displaylight', sans-serif" border="0" align="center">
        <tbody>
            <tr>
                <td>
                    <div align="left" valign="top" style="text-align: center; font-weight: bold;padding: 5px 30px;" scope="col">
                        <h3 style="color:#4CBFA6;margin-bottom: 0;margin-top: 0;font-size: 12px;text-align:center;font-weight:normal">
                            <a style="text-decoration: none;" href="https://www.Cypherexim.com" target="_blank">
                                <span style="color: #4CBFA6;font-weight: 600;">www.Cypherexim.com</span>
                            </a> |
                            <span style="color: #4CBFA6;font-weight: 600;">Cypher™️</span> 
                        </h3>
                    </div>
                </td>
            </tr>
        </tbody>
    </table>`;

