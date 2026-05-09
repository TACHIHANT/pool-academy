param(
  [string]$ProjectRoot = (Resolve-Path "$PSScriptRoot\.."),
  [string]$EdgePath = "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
)

$ebooks = @(
  @{ Name = "guide-traitement-piscine";       File = "guide-traitement-piscine.pdf" },
  @{ Name = "solutions-problemes-piscine";    File = "solutions-problemes-piscine.pdf" },
  @{ Name = "entretien-saisonnier-piscine";   File = "entretien-saisonnier-piscine.pdf" },
  @{ Name = "guide-equipements-piscine";      File = "guide-equipements-piscine.pdf" }
)

if (!(Test-Path $EdgePath)) {
  Write-Error "Microsoft Edge introuvable à : $EdgePath"
  Write-Host "Veuillez installer Microsoft Edge ou spécifier le chemin correct." -ForegroundColor Yellow
  exit 1
}

$total = $ebooks.Count
$current = 0

foreach ($ebook in $ebooks) {
  $current++
  $src = Join-Path $ProjectRoot "ebooks\$($ebook.Name)\content.html"
  $dst = Join-Path $ProjectRoot "ebooks\$($ebook.Name)\$($ebook.File)"
  $absSrc = (Resolve-Path $src).Path

  Write-Progress -Activity "Génération des PDFs" -Status "$current/$total - $($ebook.Name)" -PercentComplete (($current/$total)*100)

  if (!(Test-Path $absSrc)) {
    Write-Warning "Source introuvable : $absSrc — Ignoré"
    continue
  }

  Write-Host "[$current/$total] Génération : $($ebook.File)..." -ForegroundColor Cyan

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
}

Write-Progress -Activity "Génération des PDFs" -Completed
Write-Host "`n=== Terminé ===" -ForegroundColor Green
Write-Host "PDFs générés dans : $(Join-Path $ProjectRoot 'ebooks')" -ForegroundColor Green
