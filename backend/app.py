from flask import Flask, jsonify, send_from_directory
import pandas as pd
import os

app = Flask(__name__, static_folder='../frontend/dist')

def load_data():
    try:
        # Read the CSV file
        df = pd.read_csv('../China Ports - 5 debt to China.csv', skiprows=2)
        
        # Clean up the data
        df = df.dropna(subset=['Country Name', 'Debt to China'])
        
        # Convert to dictionary
        data = df.to_dict('records')
        return data
    except Exception as e:
        print(f"Error loading data: {e}")
        return []

@app.route('/api/ports', methods=['GET'])
def get_ports():
    data = load_data()
    return jsonify(data)

@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve(path):
    if path != "" and os.path.exists(app.static_folder + '/' + path):
        return send_from_directory(app.static_folder, path)
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(debug=True) 