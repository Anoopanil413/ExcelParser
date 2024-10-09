

import fs from 'fs'
import { createRequire } from 'module';

import { createWorker } from 'tesseract.js';
import pdf from 'pdf-poppler';
import path from 'path'
import { fileURLToPath } from 'url';


const __filename = fileURLToPath(import.meta.url);




const require = createRequire(import.meta.url);
const pdfParse = require('pdf-parse');

export async function pdfParserCont (req,res){
    console.log('Uploaded file path:', req.file);

    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    console.log('Uploaded file path:', req.file.path);


    try {
        const dataBuffer = fs.readFileSync(req.file.path);
        const data = await pdfParse(dataBuffer);
        
        const extractedData = extractDataFromText(data.text);
        
        // Delete the temporary file
        fs.unlinkSync(req.file.path);
        
        res.json(extractedData);
    } catch (error) {
        console.error("Error parsing PDF:", error);
        res.status(500).json({ error: 'Failed to parse PDF' });
    }

}






export async function pdfParserEffect(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
const __dirname = path.dirname(__filename);


    const inputPath = req.file.path;
    const outputDir = path.join(__dirname, '../temp');


    try {
        // Ensure the output directory exists
        if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
        }

        // Convert PDF to images
        const images = await convertPdfToImages(inputPath, outputDir);

        // Process images with Tesseract
        const extractedData = await processImagesWithTesseract(images);

        // Clean up temporary files
        cleanup(inputPath, images);

        res.json(extractedData);
    } catch (error) {
        console.error('Error processing PDF:', error);
        res.status(500).json({ error: 'Failed to process PDF' });
    }
}


async function convertPdfToImages(pdfPath, outputDir) {
    const opts = {
        format: 'png',
        out_dir: outputDir,
        out_prefix: 'page',
        page: null
    };

    try {
        await pdf.convert(pdfPath, opts);
        return fs.readdirSync(outputDir)
            .filter(file => file.startsWith('page') && file.endsWith('.png'))
            .map(file => path.join(outputDir, file));
    } catch (error) {
        console.error('Error converting PDF to images:', error);
        throw error;
    }
}

async function processImagesWithTesseract(images) {
    const worker = await createWorker('eng');
    const extractedData = {};

    for (const image of images) {
        const { data: { text } } = await worker.recognize(image);
        Object.assign(extractedData, extractDataFromTexttes(text));
    }

    await worker.terminate();
    return extractedData;
}

function extractDataFromTexttes(text) {
    const data = {};
    const lines = text.split('\n').map(line => line.trim());

    const patterns = {
        engineType: /Engine Type\s*(.+)/i,
        vesselName: /Name of vessel\s*(.+)/i,
        engineBuilder: /Engine Builder\s*(.+)/i,
        engineNo: /Engine No\.\s*(.+)/i,
        power: /(\d+(?:\.\d+)?)\s*kW/i,
        rpm: /(\d+(?:\.\d+)?)\s*RPM/i,
        fuelOilPressure: /Fuel Oil Pressure\s*(\d+(?:\.\d+)?)\s*bar/i,
        engineLoad: /Engine\s*Load\s*(\d+(?:\.\d+)?)\s*%/i,
        // Add more patterns as needed
    };

    for (const line of lines) {
        for (const [key, pattern] of Object.entries(patterns)) {
            const match = line.match(pattern);
            if (match) {
                data[key] = match[1].trim();
            }
        }
    }

    console.log("datadata",data)

    return data;
}

function cleanup(inputPath, images) {
    fs.unlinkSync(inputPath);
    images.forEach(fs.unlinkSync);
}




function extractDataFromText(text) {
    const lines = text.split('\n').map(line => line.trim());
    const data = {};

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Extract key-value pairs
        if (line.includes(':')) {
            const [key, value] = line.split(':').map(item => item.trim());
            data[key] = value;
        }
        
        // Extract table-like data
        if (line.match(/^\d+(\s+\d+)+$/)) {
            const tableData = line.split(/\s+/).map(Number);
            data[`Table_${i}`] = tableData;
        }
        
        // Extract specific fields
        if (line.startsWith('Engine Type')) data.engineType = line.split(' ').slice(2).join(' ');
        if (line.startsWith('Name of vessel')) data.vesselName = line.split(' ').slice(3).join(' ');
        if (line.startsWith('Engine Builder')) data.engineBuilder = line.split(' ').slice(2).join(' ');
        if (line.startsWith('Engine No.')) data.engineNo = line.split(' ').slice(2).join(' ');
        
        // Add more specific extractions based on the PDF structure
    }

    return data;
}