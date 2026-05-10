Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$tempDir = [System.IO.Path]::GetTempPath()
$srcDir = 'D:\khalid.AI\pool-academy-20260508T231955Z-3-001\pool-academy\images'

$files = @(
    @{name='hero.svg'; w=600; h=250},
    @{name='favicon.svg'; w=32; h=32}
)

foreach ($f in $files) {
    $file = $f.name
    $w = $f.w
    $h = $f.h
    Write-Host "Converting $file..."
    $svgPath = Join-Path $srcDir $file
    $pngName = [System.IO.Path]::GetFileNameWithoutExtension($file) + '.png'
    $pngPath = Join-Path $srcDir $pngName

    $svgContent = [System.IO.File]::ReadAllText($svgPath)
    $htmlContent = "<html><head><meta http-equiv='X-UA-Compatible' content='IE=edge'></head><body style='margin:0;padding:0;overflow:hidden'>$svgContent</body></html>"
    $htmlPath = Join-Path $tempDir "temp_svg_$([System.IO.Path]::GetRandomFileName()).html"
    [System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)

    $form = New-Object System.Windows.Forms.Form
    $form.WindowState = 'Normal'
    $form.StartPosition = 'Manual'
    $form.Location = New-Object System.Drawing.Point(-3000, -3000)
    $form.Width = ($w + 20)
    $form.Height = ($h + 20)
    $form.ShowInTaskbar = $false

    $webBrowser = New-Object System.Windows.Forms.WebBrowser
    $webBrowser.Width = ($w + 20)
    $webBrowser.Height = ($h + 20)
    $webBrowser.ScrollBarsEnabled = $false
    $webBrowser.ScriptErrorsSuppressed = $true

    $form.Controls.Add($webBrowser)
    $form.Add_Shown({ $form.Activate(); $webBrowser.Navigate("file:///$htmlPath") })
    $form.Show()

    $timeout = 90
    $loaded = $false
    while ($timeout -gt 0) {
        [System.Windows.Forms.Application]::DoEvents()
        $timeout--
        try {
            if ($webBrowser.ReadyState -eq 'Complete') {
                $loaded = $true
                break
            }
        } catch { }
        Start-Sleep -Milliseconds 300
    }

    if ($loaded) {
        Start-Sleep -Milliseconds 1500
        [System.Windows.Forms.Application]::DoEvents()
        try {
            $bitmap = New-Object System.Drawing.Bitmap($w, $h)
            $rect = New-Object System.Drawing.Rectangle(10, 10, $w, $h)
            $webBrowser.DrawToBitmap($bitmap, $rect)
            $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $bitmap.Dispose()
            Write-Host "  -> Saved $pngName"
        } catch { Write-Host "  -> Error: $_" }
    } else {
        Write-Host "  -> TIMEOUT for $file"
    }

    $form.Close()
    $form.Dispose()
    Remove-Item $htmlPath -Force -ErrorAction SilentlyContinue
    [System.Windows.Forms.Application]::DoEvents()
}

Write-Host 'Done!'
