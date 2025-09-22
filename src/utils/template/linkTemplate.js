export const downloadingTemplate = (linksArr) => {
    let linkListHtml = "";
    linksArr.forEach(linkItem => {
        linkListHtml += `<p><a href="${linkItem.filePath}" style="color: #007bff;">${linkItem.workspacename}</a></p>`;
    });

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Download File</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: Arial, sans-serif;
            background-color: #f9f9f9;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            overflow: hidden;
        }
        .header {
            background-color: #4cbfa6;
            color: #ffffff;
            text-align: center;
            padding: 20px;
        }
        .header h1 {
            margin: 0;
            font-size: 24px;
        }
        .content {
            padding: 20px;
            color: #333333;
        }
        .content p {
            margin: 0 0 10px;
            line-height: 1.6;
        }
        .footer {
            background-color: #f9f9f9;
            text-align: center;
            padding: 10px;
            font-size: 14px;
            color: #666666;
        }
    </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your File is Ready</h1>
            </div>
            <div class="content">
                <p>Dear Subscriber,</p>
                <p>Your requested file is now available for download. Please download the files before they are expired after 7 days as of now. Click the link below to download the files:</p>      
                ${linkListHtml}
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} Cypher. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>`;
}
