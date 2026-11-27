#!/bin/sh
# Builds the single deployable file from these source parts. Run:  sh build.sh
# Output: ../netlify-deploy/index.html
cd "$(dirname "$0")"
{
  cat 01_head.html
  cat 02_core.js 03_ui.js 04_admin.js 05_main.js 06_assess.js 07_results.js 08_cloud.js
  printf '\n</script>\n</body>\n</html>\n'
} > ../netlify-deploy/index.html
echo "Built ../netlify-deploy/index.html"
