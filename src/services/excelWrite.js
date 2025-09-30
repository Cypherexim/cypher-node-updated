import Stream from "stream";
import ExcelJs from "exceljs";
import { Upload } from "@aws-sdk/lib-storage";
import { S3Client } from "@aws-sdk/client-s3";

import db from "../config/database.js"
import { sendSESEmail } from "./mail.js";
import { errorFileWriter } from "./fileWrite.js";
import environment from "../config/environment.js";
import { getAwsSecretValues } from "../utils/utility.js";
import { template } from "../utils/template/mailTemplate.js";
import { getDataHeaders, getheaderarray } from "../utils/common.js";


export const writeExcelFileService = async(result, dataDetails) => {
    const updateDownloadWorkspace = `UPDATE public.userdownloadtransaction SET "recordIds"= $1, "filePath"= $2, "status"= $3, "errorlog"= $4, "expirydate" = $5 WHERE "Id"= $6`;
    const getNameByUserId = `SELECT "FullName", "Email" FROM public."Cypher" where "UserId"=$1`;
    const updateDownloadCount = `UPDATE public.userplantransaction SET "Downloads" = $1 WHERE "UserId"= $2`;
    
    try {
        const {UserId, direction, filename, id, fromDate, toDate, HsCode, totalDownloadCost, recordIds} = dataDetails;


        const stream = new Stream.PassThrough();
        const workbook = new ExcelJs.stream.xlsx.WorkbookWriter({
            stream: stream,
            useStyles: true,
            useSharedStrings: true,
        });

        const worksheet = workbook?.addWorksheet('Data', { views: [{ state: "frozen", ySplit: 7 }], });

        worksheet.getRow(1).hidden = true;
        worksheet.mergeCells('C2:AH6');
        worksheet.getCell('A2').value = 'DIRECTION :';
        worksheet.getCell('B2').value = direction?.toUpperCase();

        if(HsCode) {
            worksheet.getRow(3).getCell(1).value = 'HSCODE :';
            worksheet.getRow(3).getCell(2).value = HsCode?.toString();
        } else { worksheet.getRow(3).hidden = true; }

        worksheet.getRow(4).getCell(1).value = 'FROM :';
        worksheet.getRow(4).getCell(2).value = fromDate;
        worksheet.getRow(5).getCell(1).value = 'TO :';
        worksheet.getRow(5).getCell(2).value = toDate;
        worksheet.getRow(6).getCell(1).value = 'TOTAL RECORDS :';
        worksheet.getRow(6).getCell(2).value = result?.rows?.length;

        const cells = ['A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'A5', 'B5', 'A6', 'B6'];
        for(let i=0; i<cells?.length; i++) {
            worksheet.getCell(cells[i]).style.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        }

        // Set column headers
        delete result?.rows[0]?.RecordID;
        const headers = getheaderarray(result?.rows[0]);

        worksheet.getRow(7).values = headers;
        worksheet.columns = getDataHeaders(result?.rows[0]);
        worksheet.getRow(7).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'f6be00' }
        }

        worksheet?.columns?.forEach((col) => {
            col.alignment = { horizontal: 'left' }
            col.style.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
        });

        // Add autofilter on each column
        worksheet.autoFilter = 'A7:AH7';

        for(let i=0; i<result?.rows?.length; i++) worksheet?.addRow(result?.rows[i])?.commit();

        worksheet.commit();    

        const secretKeys = await getAwsSecretValues();
        const s3 = new S3Client({
            region: environment?.region,
            credentials: {
                accessKeyId: secretKeys["AccessKey"],
                secretAccessKey: secretKeys["Secretaccesskey"],
            }
        });
        
        const params = { Bucket: 'cypher-download-files', Key: `${filename}.xlsx`, Body: stream };
        const options = {partSize: 5 * 1024 * 1024, queueSize: 5};                  

        const upload = new Upload({
            client: s3,
            params,
            ...options
        });
        
        const uploadResultPromise = upload.done();

        await workbook.commit(); //finalize the workbook (push data into stream)

        const uploadResult = await uploadResultPromise; // Wait for upload to finish

        if(!uploadResult) {
            await db?.query(updateDownloadWorkspace, [{}, '', 'Error', `Error: ${uploadResult?.$metadata?.httpStatusCode}:${uploadResult?.Message}`, id]);
        } else {
            const mailResponse = await db.query(getNameByUserId, [UserId]);
            const { Email, FullName } = mailResponse?.rows[0];
            const { downloadSubject, downloadsourceemail } = environment?.mail;
            sendSESEmail(Email, template(FullName, uploadResult?.Location), downloadSubject, downloadsourceemail);

            const expiryInMilliseconds = (60*60*24*7)*1000;
            const expirydate = new Date(Date.now() + expiryInMilliseconds);

            await db?.query(updateDownloadCount, [totalDownloadCost, UserId]);
            await db?.query(updateDownloadWorkspace, [recordIds, uploadResult?.Location, 'Completed', '', expirydate, id]);
        }

        stream.end();
    } catch (error) {
        await errorFileWriter(error?.stack);
        await db?.query(updateDownloadWorkspace, [{}, '', 'Error', `Error: ${error?.message}`, id]);        
    }
};
