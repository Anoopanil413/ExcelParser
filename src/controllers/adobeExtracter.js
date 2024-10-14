
//   const AdmZip = require('adm-zip')

  import { 
    ServicePrincipalCredentials,
    PDFServices,
    MimeType,
    ExtractPDFParams,
    ExtractElementType,
    ExtractPDFJob,
    ExtractPDFResult,
    SDKError,
  ServiceUsageError,
  ServiceApiError
} from '@adobe/pdfservices-node-sdk';
    import admZip from 'adm-zip';
    import fs from 'fs';
    // import AdmZip from 'adm-zip'; 
    export async function handleAdobeConverter(req, res) {
        if (!req.file) {
          return res.status(400).json({ error: 'No file uploaded' });
        }
      
        let readStream;
        try {
          // Initialize Adobe PDF Services credentials
          const credentials = new ServicePrincipalCredentials({
            clientId: process.env.PDF_SERVICES_CLIENT_ID,
            clientSecret: process.env.PDF_SERVICES_CLIENT_SECRET
          });
      
          // Initialize PDF Services
          const pdfServices = new PDFServices({ credentials });
      
          // Read uploaded file using multer
          readStream = fs.createReadStream(req.file.path); // req.file contains the uploaded file information
          const inputAsset = await pdfServices.upload({
            readStream,
            mimeType: MimeType.PDF
          });
      
    // Modify parameters to extract both text and tables
    const params = new ExtractPDFParams({
      elementsToExtract: [ExtractElementType.TEXT, ExtractElementType.TABLES],
      getStylingInfo: true,      });
  
      // Create and submit the job to Adobe PDF Services
      const job = new ExtractPDFJob({ inputAsset, params });
      const pollingURL = await pdfServices.submit({ job });
      const pdfServicesResponse = await pdfServices.getJobResult({
        pollingURL,
        resultType: ExtractPDFResult
      });
  
      // Get the resulting asset (zip file)
      const resultAsset = pdfServicesResponse.result.resource;
      const streamAsset = await pdfServices.getContent({ asset: resultAsset });

              // Creates a write stream and copy stream asset's content to it
              const outputFilePath = createOutputFilePath();
              console.log(`Saving asset at ${outputFilePath}`);
      
  
      // Create output zip file
      // const outputFilePath = "./ExtractTableInfoFromPDF.zip";
      const writeStream = fs.createWriteStream(outputFilePath);
      streamAsset.readStream.pipe(writeStream);
  
      // writeStream.on('finish', async () => {
      //   // Once the zip is written, extract the JSON data
      //   let zip = new admZip(outputFilePath);
      //   let jsondata = zip.readAsText('structuredData.json');
      //   let data = JSON.parse(jsondata);
      //   console.log(jsondata,"myjsondata")
  
      //   // Extract table data
      //   const tableData = data.elements.filter(element => element.Table);
  
      //   // Structure the table data into a usable format
      //   let extractedTables = [];
      //   tableData.forEach(tableElement => {
      //     let tableRows = [];
      //     tableElement.Table.Rows.forEach(row => {
      //       let rowData = row.Cells.map(cell => cell.Text);
      //       tableRows.push(rowData);
      //     });
      //     extractedTables.push({
      //       title: tableElement.Title, // Optional: If the table has a title
      //       rows: tableRows
      //     });
      //   });
  
      //   // Send the extracted table data as JSON response
      //   res.status(200).json({
      //     extractedTables
      //   });
      //       // Clean up: Delete the zip file after use
      //       // fs.unlinkSync(outputFilePath);
      //     });
        } catch (err) {
          if (err instanceof SDKError || err instanceof ServiceUsageError || err instanceof ServiceApiError) {
            console.log("Exception encountered while executing operation", err);
            res.status(500).json({ error: "Failed to extract PDF data" });
        } else {
            console.log("Exception encountered while executing operation", err);
            res.status(500).json({ error: "Failed to extract PDF data" });
        }          
        } finally {
          readStream?.destroy();
        }
      }


      function createOutputFilePath() {
        const filePath = "./output/ExtractTextTableInfoWithStylingInfoFromPDF/";
        const date = new Date();
        const dateString = date.getFullYear() + "-" + ("0" + (date.getMonth() + 1)).slice(-2) + "-" +
            ("0" + date.getDate()).slice(-2) + "T" + ("0" + date.getHours()).slice(-2) + "-" +
            ("0" + date.getMinutes()).slice(-2) + "-" + ("0" + date.getSeconds()).slice(-2);
        fs.mkdirSync(filePath, {recursive: true});
        return (`${filePath}extract${dateString}.zip`);
    }