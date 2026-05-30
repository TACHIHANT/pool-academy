$root = $PSScriptRoot
$partialsDir = Join-Path $root "partials"

$partials = @{}
$partials.head     = Get-Content (Join-Path $partialsDir "head.html") -Raw -Encoding UTF8
$partials.header   = Get-Content (Join-Path $partialsDir "header.html") -Raw -Encoding UTF8
$partials.shareBar = Get-Content (Join-Path $partialsDir "share-bar.html") -Raw -Encoding UTF8
$partials.footer   = Get-Content (Join-Path $partialsDir "footer.html") -Raw -Encoding UTF8
$partials.scripts  = Get-Content (Join-Path $partialsDir "scripts.html") -Raw -Encoding UTF8

$sections = @(
  @{ start = "<!--HEAD-->";     end = "<!--END-HEAD-->";     content = $partials.head }
  @{ start = "<!--HEADER-->";   end = "<!--END-HEADER-->";   content = $partials.header }
  @{ start = "<!--SHARE-BAR-->";end = "<!--END-SHARE-BAR-->";content = $partials.shareBar }
  @{ start = "<!--FOOTER-->";   end = "<!--END-FOOTER-->";   content = $partials.footer }
  @{ start = "<!--SCRIPTS-->";  end = "<!--END-SCRIPTS-->";  content = $partials.scripts }
)

$exclude = @("merci.html", "free-guide.html", "404.html")
$pages = Get-ChildItem -Path $root -Filter "*.html" | Where-Object { $exclude -notcontains $_.Name }

$updated = 0
foreach ($page in $pages) {
  $html = Get-Content $page.FullName -Raw -Encoding UTF8
  $changed = $false

  foreach ($sec in $sections) {
    $startIdx = $html.IndexOf($sec.start)
    $endIdx = $html.IndexOf($sec.end)
    if ($startIdx -ge 0 -and $endIdx -gt $startIdx) {
      $before = $html.Substring(0, $startIdx + $sec.start.Length)
      $after = $html.Substring($endIdx)
      $html = $before + "`n" + $sec.content + "`n" + $after
      $changed = $true
    }
  }

  if ($changed) {
    [System.IO.File]::WriteAllText($page.FullName, $html, [System.Text.UTF8Encoding]::new($false))
    $updated++
    Write-Host "OK $($page.Name)"
  }
}

Write-Host "Done: $updated page(s) updated."
