param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\.."),
  [string]$EdgePath = ""
)

$ebooks = @(
  @{ Name = "guide-traitement-piscine";       File = "guide-traitement-piscine.pdf" },
  @{ Name = "solutions-problemes-piscine";    File = "solutions-problemes-piscine.pdf" },
  @{ Name = "entretien-saisonnier-piscine";   File = "entretien-saisonnier-piscine.pdf" },
  @{ Name = "guide-equipements-piscine";      File = "guide-equipements-piscine.pdf" },
  @{ Name = "5-erreurs-piscine";              File = "5-erreurs-piscine.pdf" },
  @{ Name = "guide-piscine-sel-electrolyseur"; File = "guide-piscine-sel-electrolyseur.pdf" }
)

if (-not $EdgePath) {
  $possible = @(
    "${env:ProgramFiles}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe",
    "${env:LOCALAPPDATA}\Microsoft\Edge\Application\msedge.exe",
    "${env:ProgramFiles}\Google\Chrome\Application\chrome.exe",
    "${env:ProgramFiles(x86)}\Google\Chrome\Application\chrome.exe"
  )
  foreach ($p in $possible) {
    if (Test-Path $p) { $EdgePath = $p; break }
  }
}

if (-not (Test-Path $EdgePath)) {
  Write-Error "Aucun navigateur Chromium trouvé. Installez Edge ou Chrome, ou spécifiez le chemin avec -EdgePath."
  exit 1
}

function Convert-DocxToHtml {
  param([string]$DocxPath, [string]$EbookName)
  try {
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $zip = [System.IO.Compression.ZipFile]::OpenRead($DocxPath)
    $entry = $zip.GetEntry("word/document.xml")
    if (-not $entry) { return $null }

    $reader = New-Object System.IO.StreamReader($entry.Open())
    $xml = $reader.ReadToEnd()
    $reader.Dispose()
    $zip.Dispose()

    $xml = [System.Text.Encoding]::UTF8.GetString([System.Text.Encoding]::UTF8.GetBytes($xml))
    $xml = $xml -replace '<?xml[^>]*>', ''
    $xml = $xml -replace '<w:[^>]+>', ''
    $xml = $xml -replace '</w:[^>]+>', ''
    $xml = $xml -replace '<w:[^ ]+[^>]*/>', ''

    $text = [System.Net.WebUtility]::HtmlDecode($xml)
    $text = $text -replace '\s+', ' '
    $paragraphs = $text -split '<w:p[^>]*>'
    $htmlLines = @()
    foreach ($p in $paragraphs) {
      $line = $p -replace '<[^>]+>', ''
      $line = $line.Trim()
      if ($line -ne '') { $htmlLines += "<p>$line</p>" }
    }

    $title = $EbookName -replace '-', ' ' -replace '\b\w', { $_.Value.ToUpper() }
    return @"
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><title>$title</title></head>
<body>
$($htmlLines -join "`n")
</body>
</html>
"@
  } catch {
    return $null
  }
}

$total = $ebooks.Count
$current = 0

foreach ($ebook in $ebooks) {
  $current++
  $ebookDir = Join-Path $ProjectRoot "ebooks\$($ebook.Name)"

  if (-not (Test-Path $ebookDir)) {
    Write-Warning "Dossier introuvable : $ebookDir — Ignoré"
    continue
  }

  $htmlSrc = Join-Path $ebookDir "content.html"
  $docxSrc = Join-Path $ebookDir "content.docx"
  $dst = Join-Path $ebookDir $ebook.File

  Write-Progress -Activity "Génération des PDFs" -Status "$current/$total - $($ebook.Name)" -PercentComplete (($current/$total)*100)

  if (Test-Path $htmlSrc) {
    $absSrc = (Resolve-Path $htmlSrc).Path
    Write-Host "[$current/$total] Génération : $($ebook.File)..." -ForegroundColor Cyan
  } elseif (Test-Path $docxSrc) {
    Write-Host "[$current/$total] Conversion DOCX + génération : $($ebook.File)..." -ForegroundColor Cyan
    $htmlContent = Convert-DocxToHtml -DocxPath $docxSrc -EbookName $ebook.Name
    if (-not $htmlContent) {
      Write-Warning "Impossible de lire le contenu de $docxSrc — Ignoré"
      continue
    }
    $tempHtml = Join-Path $env:TEMP "$($ebook.Name).html"
    [System.IO.File]::WriteAllText($tempHtml, $htmlContent, [System.Text.Encoding]::UTF8)
    $absSrc = $tempHtml
  } else {
    Write-Warning "Aucun fichier source (content.html ou content.docx) trouvé dans $ebookDir — Ignoré"
    continue
  }

  $edgeArgs = @(
    "--headless=new"
    "--disable-gpu"
    "--no-sandbox"
    "--print-to-pdf=`"$dst`""
    "--no-margins"
    "--disable-print-preview"
    "file:///$($absSrc.Replace('\','/'))"
  )

  $proc = Start-Process -FilePath $EdgePath -ArgumentList $edgeArgs -NoNewWindow -Wait -PassThru

  if ($proc.ExitCode -eq 0 -or $proc.ExitCode -eq $null) {
    if (Test-Path $dst) {
      $size = (Get-Item $dst).Length / 1KB
      Write-Host "  ✓ PDF créé : $($ebook.File) ($([math]::Round($size,1)) KB)" -ForegroundColor Green
    } else {
      Write-Warning "  ? Le processus s'est terminé mais le PDF n'a pas été trouvé : $dst"
    }
  } else {
    Write-Error "  ✗ Échec (code: $($proc.ExitCode))"
  }

  if ($tempHtml -and (Test-Path $tempHtml)) {
    Remove-Item $tempHtml -Force
  }
}

Write-Progress -Activity "Génération des PDFs" -Completed
Write-Host "`n=== Terminé ===" -ForegroundColor Green
Write-Host "PDFs générés dans : $(Join-Path $ProjectRoot 'ebooks')" -ForegroundColor Green
