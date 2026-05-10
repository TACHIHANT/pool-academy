Add-Type -AssemblyName System.Windows.Forms
Add-Type -AssemblyName System.Drawing

$svgFiles = @('cover-traitement.svg', 'cover-solutions.svg', 'cover-saisonnier.svg', 'cover-equipements.svg')
$srcDir = 'D:\khalid.AI\pool-academy-20260508T231955Z-3-001\pool-academy\images'
$tempDir = [System.IO.Path]::GetTempPath()

foreach ($file in $svgFiles) {
    Write-Host "Converting $file..."
    $svgPath = Join-Path $srcDir $file
    $pngName = [System.IO.Path]::GetFileNameWithoutExtension($file) + '.png'
    $pngPath = Join-Path $srcDir $pngName

    $svgContent = [System.IO.File]::ReadAllText($svgPath)

    # Write temp HTML with SVG inline
    $htmlContent = "<html><head><meta http-equiv='X-UA-Compatible' content='IE=edge'></head><body style='margin:0;padding:0;overflow:hidden'>$svgContent</body></html>"
    $htmlPath = Join-Path $tempDir "temp_svg_$([System.IO.Path]::GetRandomFileName()).html"
    [System.IO.File]::WriteAllText($htmlPath, $htmlContent, [System.Text.Encoding]::UTF8)

    $form = New-Object System.Windows.Forms.Form
    $form.WindowState = 'Normal'
    $form.StartPosition = 'Manual'
    $form.Location = New-Object System.Drawing.Point(-3000, -3000)
    $form.Width = 420
    $form.Height = 580
    $form.ShowInTaskbar = $false

    $webBrowser = New-Object System.Windows.Forms.WebBrowser
    $webBrowser.Width = 420
    $webBrowser.Height = 580
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
        Start-Sleep -Milliseconds 2000
        [System.Windows.Forms.Application]::DoEvents()
        try {
            $bitmap = New-Object System.Drawing.Bitmap(400, 560)
            $rect = New-Object System.Drawing.Rectangle(10, 10, 400, 560)
            $webBrowser.DrawToBitmap($bitmap, $rect)
            $bitmap.Save($pngPath, [System.Drawing.Imaging.ImageFormat]::Png)
            $bitmap.Dispose()
            $size = (Get-Item $pngPath).Length
            Write-Host "  -> Saved $pngName ($size bytes)"
        } catch {
            Write-Host "  -> DrawToBitmap error: $_"
        }
    } else {
        Write-Host "  -> TIMEOUT for $file (readyState=$($webBrowser.ReadyState))"
    }

    $form.Close()
    $form.Dispose()
    Remove-Item $htmlPath -Force -ErrorAction SilentlyContinue
    [System.Windows.Forms.Application]::DoEvents()
}

Write-Host 'Done!'
