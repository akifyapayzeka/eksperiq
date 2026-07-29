param(
  [string]$OutputPath = "dist\eksperiq-hostinger-static.zip"
)

$ErrorActionPreference = "Stop"

npm run build

$outDir = Resolve-Path "out"
$distDir = Split-Path -Parent $OutputPath

if ($distDir -and -not (Test-Path $distDir)) {
  New-Item -ItemType Directory -Path $distDir | Out-Null
}

$htaccessPath = Join-Path $outDir ".htaccess"
$htaccess = @"
DirectoryIndex index.html
Options -MultiViews

RewriteEngine On
RewriteCond %{REQUEST_FILENAME} -f [OR]
RewriteCond %{REQUEST_FILENAME} -d
RewriteRule ^ - [L]
RewriteRule ^analiz/?$ /analiz.html [L]
RewriteRule ^sonuc/?$ /sonuc.html [L]
RewriteRule ^nasil-calisir/?$ /nasil-calisir.html [L]
RewriteRule ^hakkinda/?$ /hakkinda.html [L]
RewriteRule ^gizlilik/?$ /gizlilik.html [L]
RewriteRule ^kullanim-kosullari/?$ /kullanim-kosullari.html [L]
RewriteRule ^moduller/?$ /moduller.html [L]
RewriteRule . /404.html [L]
"@

Set-Content -Path $htaccessPath -Value $htaccess -Encoding UTF8

if (Test-Path $OutputPath) {
  Remove-Item -LiteralPath $OutputPath -Force
}

Compress-Archive -Path (Join-Path $outDir "*") -DestinationPath $OutputPath -Force

Write-Output "Hostinger package created: $OutputPath"
