#!/usr/bin/env bash
# PROTOTYPE - NOT FOR PRODUCTION
# Question: does the Legiony prototype play well on a real phone? A WebView wrapper around the HTML build.
# Date: 2026-10-02
#
# Builds legiony.apk offline with the Android SDK and JDK bundled in Unity's Android Build Support module.
# No Gradle: aapt2 → javac → d8 → zip → zipalign → apksigner.
# Usage: bash build.sh            (uses game/legiony.html next to this script)
set -euo pipefail
cd "$(dirname "$0")"

UNITY_ANDROID="${UNITY_ANDROID:-/c/Program Files/Unity/Hub/Editor/2022.3.62f2/Editor/Data/PlaybackEngines/AndroidPlayer}"
SDK="$UNITY_ANDROID/SDK"
BT="$SDK/build-tools/34.0.0"
PLATFORM="$SDK/platforms/android-34/android.jar"
JDK="$UNITY_ANDROID/OpenJDK/bin"
export JAVA_HOME="$UNITY_ANDROID/OpenJDK"
export PATH="$JDK:$PATH"

rm -rf build && mkdir -p build/res build/classes build/dex build/assets

echo "== page"
python make_index.py game/legiony.html build/assets/index.html

echo "== resources"
"$BT/aapt2.exe" compile --dir res -o build/res/compiled.zip
"$BT/aapt2.exe" link -o build/base.apk -I "$PLATFORM" --manifest AndroidManifest.xml \
  -A build/assets --min-sdk-version 21 --target-sdk-version 34 build/res/compiled.zip

echo "== code"
"$JDK/javac.exe" -source 8 -target 8 -bootclasspath "$PLATFORM" -encoding UTF-8 -Xlint:-options \
  -d build/classes src/com/legiony/prototype/MainActivity.java
# the .bat wrappers break on the space in "Program Files", so the jars are run directly
"$JDK/java.exe" -cp "$BT/lib/d8.jar" com.android.tools.r8.D8 --lib "$PLATFORM" --min-api 21 --output build/dex \
  build/classes/com/legiony/prototype/MainActivity.class

echo "== package"
python - <<'PY'
import zipfile, shutil
shutil.copy('build/base.apk', 'build/unsigned.apk')
with zipfile.ZipFile('build/unsigned.apk', 'a', zipfile.ZIP_DEFLATED) as z:
    z.write('build/dex/classes.dex', 'classes.dex')
PY
"$BT/zipalign.exe" -p -f 4 build/unsigned.apk build/aligned.apk

echo "== sign (debug key)"
if [ ! -f debug.keystore ]; then
  "$JDK/keytool.exe" -genkeypair -keystore debug.keystore -storepass android -keypass android \
    -alias legiony -keyalg RSA -keysize 2048 -validity 10000 -dname "CN=Legiony Prototype,O=Prototype,C=RU"
fi
"$JDK/java.exe" -jar "$BT/lib/apksigner.jar" sign --ks debug.keystore --ks-pass pass:android --key-pass pass:android \
  --out legiony.apk build/aligned.apk
"$JDK/java.exe" -jar "$BT/lib/apksigner.jar" verify --verbose legiony.apk | head -5
ls -la legiony.apk
