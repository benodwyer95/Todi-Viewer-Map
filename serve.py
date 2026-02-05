from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import os

ROOT = Path(__file__).resolve().parent

class Handler(SimpleHTTPRequestHandler):
    # avoid some windows path weirdness
    def translate_path(self, path):
        path = path.split('?',1)[0].split('#',1)[0]
        path = path.lstrip('/')
        full = (ROOT / path).resolve()
        # keep it inside ROOT
        try:
            full.relative_to(ROOT)
        except Exception:
            return str(ROOT)
        return str(full)

    def log_message(self, fmt, *args):
        # quieter logs
        print("%s - %s" % (self.address_string(), fmt % args))

if __name__ == "__main__":
    os.chdir(ROOT)
    host = "127.0.0.1"
    port = 8000
    print(f"Serving {ROOT} on http://{host}:{port}/")
    ThreadingHTTPServer((host, port), Handler).serve_forever()
