import http.server
import socketserver
import webbrowser
import os

PORT = 8083

class CyberHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

if __name__ == '__main__':
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = CyberHTTPRequestHandler
    
    with socketserver.TCPServer(("", PORT), handler) as httpd:
        print("=" * 65)
        print(" [!] TECHFEST 2026 ACTIVITY-3: PARALLAX ODYSSEY INITIALIZED")
        print(f" [+] Local Server: http://localhost:{PORT}")
        print(" [i] Press Ctrl+C in terminal to stop server.")
        print("=" * 65)
        
        try:
            webbrowser.open(f"http://localhost:{PORT}")
        except Exception:
            pass
            
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n[-] Parallax Odyssey server shutting down.")
