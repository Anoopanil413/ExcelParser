import fs from 'fs'
import PDFParser from 'pdf2json'

export async function precisePdfExtractor(req, res) {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", errData => {
        console.error(errData.parserError);
        res.status(500).json({ error: 'Failed to parse PDF' });
    });

    pdfParser.on("pdfParser_dataReady", pdfData => {
        const extractedData = extractStructuredData(pdfData);
        res.json(extractedData);
        
        // Clean up the temporary file
        fs.unlinkSync(req.file.path);
    });

    pdfParser.loadPDF(req.file.path);
}

function extractStructuredData(pdfData) {
    const extractedData = {};
    const textContent = pdfData.Pages.flatMap(page => 
        page.Texts.map(text => decodeURIComponent(text.R[0].T))
    );

    // Define patterns for specific data points
    const patterns = {
        engineType: /^(\S+.+?)(?=\s+Name of vessel)/,
        vesselName: /Name of vessel\s+(.+?)(?=\s+Engine Builder)/,
        engineBuilder: /Engine Builder\s+(.+?)(?=\s+Engine No\.)/,
        engineNo: /Engine No\.\s+(.+?)(?=\s+Layout)/,
        power: /(\d+(?:\.\d+)?)\s*kW/,
        rpm: /(\d+(?:\.\d+)?)\s*RPM/,
        fuelOilPressure: /Fuel Oil Pressure\s*(\d+(?:\.\d+)?)\s*bar/,
        engineLoad: /Engine\s*Load\s*(\d+(?:\.\d+)?)\s*%/,
        // Add more patterns as needed
    };

    // Extract data using patterns
    const fullText = textContent.join(' ');
    for (const [key, pattern] of Object.entries(patterns)) {
        const match = fullText.match(pattern);
        if (match) {
            extractedData[key] = match[1].trim();
        }
    }

    // Extract table-like data
    extractedData.cylinderData = extractCylinderData(textContent);

    return extractedData;
}

function extractCylinderData(textContent) {
    const cylinderData = [];
    const cylinderHeaders = ['Cylinder No.', 'Pi', 'Pmax', 'Pcomp', 'Exhaust Gas Temp.'];
    
    let headerIndex = textContent.findIndex(line => 
        cylinderHeaders.every(header => line.includes(header))
    );

    if (headerIndex !== -1) {
        for (let i = headerIndex + 1; i < textContent.length; i++) {
            const line = textContent[i];
            const values = line.split(/\s+/).filter(v => v.trim() !== '');
            
            if (values.length >= cylinderHeaders.length) {
                cylinderData.push({
                    cylinderNo: values[0],
                    pi: values[1],
                    pmax: values[2],
                    pcomp: values[3],
                    exhaustGasTemp: values[4]
                });
            } else {
                break; // End of table data
            }
        }
    }

    return cylinderData;
}