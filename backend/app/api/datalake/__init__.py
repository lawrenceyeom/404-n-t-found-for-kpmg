from fastapi import APIRouter
from .mock_data import get_datalake_data
from fastapi import Query
from fastapi.responses import JSONResponse
import os
import json
import codecs
import traceback

datalake_router = APIRouter()

datalake_router.get("/")(get_datalake_data)

# Add a dedicated route for opinion data
@datalake_router.get("/opinion")
def get_opinion_data(company: str = Query(...)):
    """Direct API endpoint to retrieve opinion data for a company.
    
    Args:
        company: The company identifier (aura, beta, crisis)
    
    Returns:
        JSON response with the opinion data
    """
    # Define the path to the opinion data files
    data_dir = os.path.join(os.path.dirname(__file__), 'data')
    
    # Use the complete file for CRISIS company to avoid encoding issues
    if company.lower() == 'crisis':
        filepath = os.path.join(data_dir, "opinion_crisis_complete.json")
    else:
        filepath = os.path.join(data_dir, f"opinion_{company}.json")
    
    print(f"Attempting to load file: {filepath}")
    
    if not os.path.exists(filepath):
        print(f"Error: File does not exist: {filepath}")
        return JSONResponse(
            status_code=404,
            content={"error": f"Opinion data file for company '{company}' not found at {filepath}"}
        )
    
    # Try multiple potential encodings
    encodings_to_try = ['utf-8', 'utf-8-sig', 'gbk', 'gb2312', 'latin-1']
    last_error = None
    
    for encoding in encodings_to_try:
        try:
            print(f"Trying to read {filepath} with encoding: {encoding}")
            with codecs.open(filepath, encoding=encoding) as f:
                content = f.read()
                # Debug: print the first 100 characters of the file
                print(f"First 100 chars: {content[:100]}")
                data = json.loads(content)
                print(f"Successfully loaded JSON with encoding: {encoding}")
                return JSONResponse(content=data)
        except UnicodeDecodeError as e:
            print(f"UnicodeDecodeError with encoding {encoding}: {str(e)}")
            # If this encoding doesn't work, try the next one
            last_error = f"UnicodeDecodeError with encoding {encoding}: {str(e)}"
            continue
        except json.JSONDecodeError as e:
            print(f"JSONDecodeError: {str(e)}")
            # JSON parsing error
            last_error = f"JSONDecodeError: {str(e)}"
            return JSONResponse(
                status_code=500,
                content={"error": f"Error parsing JSON data: {str(e)}"}
            )
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            # Log the full exception for debugging
            error_details = traceback.format_exc()
            print(error_details)
            last_error = f"Unexpected error: {str(e)}"
            return JSONResponse(
                status_code=500,
                content={"error": f"Error loading opinion data: {str(e)}", "details": error_details}
            )
    
    # If we've tried all encodings and none worked
    print(f"All encodings failed. Last error: {last_error}")
    return JSONResponse(
        status_code=500,
        content={"error": f"Could not decode file with any of the attempted encodings. Last error: {last_error}"}
    ) 