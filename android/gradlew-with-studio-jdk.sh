#!/usr/bin/env bash
# Run ./gradlew using Android Studio's bundled JBR (JDK 17) so Gradle does not pick up Java 25 from PATH.
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

# Git Bash: LOCALAPPDATA may be unset; derive from USERPROFILE (e.g. C:\Users\You)
_local="${LOCALAPPDATA:-}"
if [[ -z "$_local" && -n "$USERPROFILE" ]]; then
  _local="${USERPROFILE//\\//}/AppData/Local"
fi

candidates=(
  "/c/Program Files/Android/Android Studio/jbr"
  "/c/Program Files (x86)/Android/Android Studio/jbr"
  "${_local}/Programs/Android/Android Studio/jbr"
  "/Applications/Android Studio.app/Contents/jbr/Contents/Home"
)

for j in "${candidates[@]}"; do
  if [[ -n "$j" && -d "$j" && (-x "$j/bin/java" || -x "$j/bin/java.exe") ]]; then
    export JAVA_HOME="$j"
    echo "Using JAVA_HOME=$JAVA_HOME"
    exec ./gradlew "$@"
  fi
done

echo "Could not find Android Studio JBR. Install Android Studio, or set JAVA_HOME to JDK 17 or 21, then run: ./gradlew $*"
exit 1
