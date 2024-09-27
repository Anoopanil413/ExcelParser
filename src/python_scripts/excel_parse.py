import sys
import pandas as pd
import json

def process_excel(file_path):
    print(f"Processing file: {file_path}")  
    try:
        all_sheets = pd.read_excel(file_path, sheet_name=None)
        print(f"Sheets found: {list(all_sheets.keys())}") 

        json_data = {}

        for sheet_name, df in all_sheets.items():
            df = df.select_dtypes(exclude=['datetime'])  
            
            # Fill NaN values for object columns
            for col in df.select_dtypes(include=['object']):
                df[col] = df[col].fillna('')  # Create a new Series instead of using inplace

            # Fill NaN values for numeric columns
            for col in df.select_dtypes(include=['float64', 'int64']):
                df[col] = df[col].fillna(0)  # Create a new Series instead of using inplace

            # Convert the DataFrame to JSON format
            json_data[sheet_name] = df.to_dict(orient='records')

        # Convert the entire dictionary to a JSON string
        json_output = json.dumps(json_data)
        print(json_output)  # Print the JSON output

    except Exception as e:
        # Print errors to stderr
        print(f"Error: {str(e)}", file=sys.stderr)

if __name__ == '__main__':
    # Take the Excel file path as an argument
    excel_file_path = sys.argv[1]
    process_excel(excel_file_path)
