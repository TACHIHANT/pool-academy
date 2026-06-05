param(
  [string]$Message = "Auto-update"
)

Write-Host "=== PoolProUS Auto Deploy ===" -ForegroundColor Cyan

# 1. Generate all TikTok videos
Write-Host "Step 1/4: Generating videos..." -ForegroundColor Yellow
& ".\scripts\generate-videos.ps1" -Product "all"

# 2. Build the site (inject partials)
Write-Host "Step 2/4: Building site..." -ForegroundColor Yellow
& ".\build.ps1"

# 3. Git commit
Write-Host "Step 3/4: Committing to git..." -ForegroundColor Yellow
git add -A
git commit -m "$Message"

# 4. Push to GitHub
Write-Host "Step 4/4: Pushing to GitHub Pages..." -ForegroundColor Yellow
git push

Write-Host "=== DONE! Site live at https://poolacademy.site/ ===" -ForegroundColor Green
