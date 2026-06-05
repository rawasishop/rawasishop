$mk = 'C:\Program Files\ImageMagick-7.1.2-Q16-HDRI\magick.exe'
$ff = 'C:\Users\larbi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-8.1.1-full_build\bin\ffmpeg.exe'
$assets = 'c:\Users\larbi\Desktop\rawasishop-repo\assets'
$vidDir = 'c:\Users\larbi\Desktop\rawasishop-repo\video'

$images = @(
  (Join-Path $assets 'product-main.png'),
  (Join-Path $assets 'g-usage.jpg'),
  (Join-Path $assets 'g-lifestyle.jpg'),
  (Join-Path $assets 'g-features.jpg')
)

$i = 0
foreach ($img in $images) {
  $i++
  $out = Join-Path $vidDir "slide$i.jpg"
  & $mk -size 1080x1920 gradient:'#fff5f8-#ffffff' $img -resize 980x980 -gravity center -composite -quality 92 $out
}

$list = Join-Path $vidDir 'list.txt'
@"
file slide1.jpg
duration 4
file slide2.jpg
duration 4
file slide3.jpg
duration 4
file slide4.jpg
duration 4
file slide4.jpg
"@ | Set-Content -Encoding ASCII $list

$outVideo = Join-Path $vidDir 'ad-rawasishop-vertical.mp4'
Push-Location $vidDir
& $ff -y -f concat -safe 0 -i list.txt -vf "scale=1080:1920:force_original_aspect_ratio=decrease,pad=1080:1920:(ow-iw)/2:(oh-ih)/2,format=yuv420p" -r 25 -t 16 $outVideo
Pop-Location
Write-Host "Done: $outVideo"
