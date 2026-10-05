# PROTOTYPE - NOT FOR PRODUCTION
# Question: does the Legiony prototype play well on a real phone? A WebView wrapper around the HTML build.
# Date: 2026-10-02
"""Wrap the artifact page (it has no <html>/<head> of its own) into a full-screen page for the Android WebView."""
import sys
from pathlib import Path

src, out = Path(sys.argv[1]), Path(sys.argv[2])
game = src.read_text(encoding="utf-8")
# On a phone the game fills the screen: no frame, no outer gutter. The game's own fitBoard() scales the
# 500×889 design board to the screen; the flags below let it use the full screen and grow on tablets.
app_flags = "<script>window.FIT_PAD = 0; window.FIT_MAX = 4;</script>"
app_css = """<style>
  html, body { margin: 0 !important; overflow: hidden; overscroll-behavior: none; }
  .stage { padding: 0 !important; min-height: 100vh !important; align-items: center !important; }
  .phone { border: 0 !important; border-radius: 0 !important; box-shadow: none !important; }
</style>"""
page = ("<!doctype html>\n<html lang=\"ru\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover\">\n"
        "</head>\n<body>\n" + app_flags + "\n" + game + "\n" + app_css + "\n</body>\n</html>\n")
out.parent.mkdir(parents=True, exist_ok=True)
out.write_text(page, encoding="utf-8")
print("index.html:", len(page), "chars")
