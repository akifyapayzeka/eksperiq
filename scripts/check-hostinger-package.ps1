param(
  [string]$PackagePath = "dist\eksperiq-hostinger-static.zip"
)

$ErrorActionPreference = "Stop"

if (-not (Test-Path $PackagePath)) {
  throw "Hostinger paketi bulunamadi: $PackagePath"
}

Add-Type -AssemblyName System.IO.Compression.FileSystem
$resolvedPackagePath = Resolve-Path $PackagePath
$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedPackagePath)

try {
  $entries = @($zip.Entries | ForEach-Object { $_.FullName -replace "\\", "/" })
  $required = @(
    ".htaccess",
    "index.html",
    "analiz.html",
    "analizlerim.html",
    "sonuc.html",
    "geri-bildirim.html",
    "kontrol-listesi.html",
    "moduller.html",
    "gizlilik.html",
    "offline.html",
    "profil.html"
  )

  foreach ($item in $required) {
    if ($entries -notcontains $item) {
      throw "Hostinger paketi eksik dosya iceriyor: $item"
    }
  }

  if (-not ($entries | Where-Object { $_ -like "_next/static/*" } | Select-Object -First 1)) {
    throw "Hostinger paketi _next/static varliklarini icermiyor."
  }

  $htaccessEntry = $zip.Entries | Where-Object { $_.FullName -eq ".htaccess" } | Select-Object -First 1
  $reader = New-Object System.IO.StreamReader($htaccessEntry.Open())
  try {
    $htaccess = $reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }

  foreach ($route in @("analiz", "sonuc", "geri-bildirim", "moduller", "offline", "profil")) {
    if ($htaccess -notmatch "RewriteRule \^$route/\?\$ /$route\.html") {
      throw ".htaccess route kurali eksik: $route"
    }
  }
}
finally {
  $zip.Dispose()
}

Write-Output "Hostinger paket kontrolu gecti: $PackagePath"
