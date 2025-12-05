from flask import Flask, send_from_directory
import os

app = Flask(__name__, static_folder='.')

@app.route('/')
def landing():
    return send_from_directory('.', 'landing.html')

@app.route('/app')
def app_page():
    return send_from_directory('.', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('.', path)

if __name__ == '__main__':
    print("🚀 Task Management System is running!")
    print("📍 Open your browser and go to: http://localhost:5000")
    print("⏹️  Press CTRL+C to stop the server")
    app.run(debug=True, host='0.0.0.0', port=5000)
