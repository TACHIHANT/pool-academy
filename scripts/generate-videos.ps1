param(
  [Parameter(Position=0)]
  [ValidateSet("all","thermometer","led","fountain")]
  [string]$Product = "all"
)

$ffmpeg = "C:\Users\khali\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe"
$font = "C\:/Windows/Fonts/arialbd.ttf"
$videos = @(
  "C:\Users\khali\OneDrive\Desktop\tiktok-videos\pool-blue-waves.mp4",
  "C:\Users\khali\OneDrive\Desktop\tiktok-videos\pool-splash-vertical.mp4",
  "C:\Users\khali\OneDrive\Desktop\tiktok-videos\pool-underwater-waves.mp4"
)
$photos = "C:\Users\khali\OneDrive\Desktop\payhip photo"
$output = "C:\Users\khali\OneDrive\Desktop\tiktok-videos"
$products = @()

if ($Product -in @("all","thermometer")) {
  $products += @{
    name = "thermometer"
    title = "Digital Pool Thermometer"
    features = @("Solar powered", "No batteries", "Waterproof LCD", "Accurate reading")
    hashtag = "#poolthermometer #poolmaintenance #poolusa"
    images = @("$photos\2c420f424a928460687cd2a09e48.jpeg")
    price = "24.99"
  }
}
if ($Product -in @("all","led")) {
  $products += @{
    name = "led"
    title = "Solar LED Pool Light"
    features = @("No wiring", "No electricity", "Changes colors", "Auto on/off")
    hashtag = "#poollights #solarpool #backyardideas #poolusa #california"
    images = @(
      "$photos\2c420f424a928460687cd2a09e48.jpeg",
      "$photos\80c2e33e44709d3312980be75ddd.jpeg",
      "$photos\8fa6d31f45498adadb61075258e4.png",
      "$photos\c0cf8e644d81bb567b8ccb134d8c.jpeg",
      "$photos\10e4bb834b8696728f52362e91dd.jpeg"
    )
    price = "19.99"
  }
}
if ($Product -in @("all","fountain")) {
  $products += @{
    name = "fountain"
    title = "Solar Power Fountain"
    features = @("6 spray nozzles", "180L/H flow", "No batteries", "Bird bath ready")
    hashtag = "#solarfountain #gardenideas #backyard #poolusa"
    images = @(
      "$photos\CJJT2421592_1780580588131\1_b3376e70-7332-4aeb-963d-10a2771da850.png",
      "$photos\CJJT2421592_1780580588131\2_bb7c0565-5b17-416a-a468-9c23057ceae3.png",
      "$photos\CJJT2421592_1780580588131\3_d7d05713-edea-4ed0-a417-510b9e7c469b.png"
    )
    price = "14.99"
  }
}

foreach ($p in $products) {
  Write-Host "=== Generating video for $($p.name) ===" -ForegroundColor Green
  $bg = $videos | Get-Random
  $out = "$output\$($p.name)-ad-vertical.mp4"
  $imgCount = $p.images.Count
  $duration = [math]::Min(15, 2 + $imgCount * 3 + 2)
  $segDuration = [math]::Max(2.5, ($duration - 4) / $imgCount)

  $argsList = @("-y")
  $argsList += "-i"; $argsList += $bg
  foreach ($img in $p.images) { $argsList += "-i"; $argsList += $img }
  $argsList += "-t"; $argsList += "$duration"

  $filter = "[0:v]trim=0:$duration,setpts=PTS-STARTPTS,scale=720:1280[bg];"
  $chain = "bg"
  $i = 1
  foreach ($img in $p.images) {
    $filter += "[$i:v]scale=500:500,setsar=1[img$i];"
    $start = [math]::Round(1.5 + ($i-1) * $segDuration, 1)
    $end = [math]::Round($start + $segDuration, 1)
    if ($i -eq $imgCount) { $end = [math]::Min($end, $duration - 1.5) }
    $filter += "[$chain][img$i]overlay=(W-w)/2:(H-h)/2-30:enable='between(t,$start,$end)'[v$i];"
    $chain = "v$i"
    $i++
  }

  $drawtexts = @()
  $drawtexts += "drawtext=fontfile=$font:text='$($p.title)':fontsize=38:fontcolor=lime:x=(w-text_w)/2:y=80:enable='between(t,1.5,$($duration-2))'"
  $drawtexts += "drawtext=fontfile=$font:text='STOP SCROLLING':fontsize=52:fontcolor=white:x=(w-text_w)/2:y=120:enable='between(t,0,1.5)'"
  $drawtexts += "drawtext=fontfile=$font:text='TAP LINK IN BIO':fontsize=48:fontcolor=yellow:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,$($duration-2),$duration)'"

  $fIdx = 0
  $featDuration = [math]::Max(2, ($duration - 4) / $p.features.Count)
  foreach ($feat in $p.features) {
    $fStart = [math]::Round(2 + $fIdx * $featDuration, 1)
    $fEnd = [math]::Min($fStart + $featDuration, $duration - 2)
    $yPos = 200 + $fIdx * 60
    $drawtexts += "drawtext=fontfile=$font:text='$feat':fontsize=26:fontcolor=white:x=(w-text_w)/2:y=$yPos:enable='between(t,$fStart,$fEnd)'"
    $fIdx++
  }
  $filter += "[$chain]" + ($drawtexts -join ",")
  $argsList += "-filter_complex"; $argsList += $filter
  $argsList += $out

  Write-Host "  Generating..." -ForegroundColor DarkGray
  & $ffmpeg $argsList 2>&1 | Out-Null

  if (Test-Path $out) {
    Write-Host "  ✅ Created: $out" -ForegroundColor Cyan
    Write-Host "  📝 Post on TikTok with:" -ForegroundColor Yellow
    Write-Host "    Want to upgrade your pool? Check out the $($p.title)!" 
    Write-Host "    🔗 Link in bio"
    Write-Host "    $($p.hashtag)"
  } else {
    Write-Host "  ❌ Failed to create video" -ForegroundColor Red
  }
  Write-Host ""
}

Write-Host "=== DONE ===" -ForegroundColor Green
