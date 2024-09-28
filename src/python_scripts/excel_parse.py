import sys
import pandas as pd
import json

def process_excel(file_path):
    try:
        # Read all sheets in the Excel file
        all_sheets = pd.read_excel(file_path, sheet_name=None)

        json_data = {}

        for sheet_name, df in all_sheets.items():
            # Fill NaN values for all columns
            df = df.fillna('')  # Replace NaN with empty string for all columns
            
            # Convert the DataFrame to JSON-like dictionary format
            json_data[sheet_name] = df.to_dict(orient='records')

        # Convert the entire dictionary to a JSON string
        json_output = json.dumps(json_data, default=str)  # Use default=str to handle non-serializable types
        
        # Output the JSON string to stdout
        sys.stdout.write(json_output)

    except Exception as e:
        # Write the error to stderr for easier debugging in Node.js
        sys.stderr.write(f"Error: {str(e)}\n")

if __name__ == '__main__':
    if len(sys.argv) > 1:
        excel_file_path = sys.argv[1]
        process_excel(excel_file_path)
    else:
        sys.stderr.write("No file path provided.\n")
