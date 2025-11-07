Param(
  [string]$Root = '.',
  [string]$Prefix = 'http://localhost:8000/'
)

Add-Type -AssemblyName System.Net
Add-Type -AssemblyName System.IO

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($Prefix)
$listener.Start()
Write-Host "Serving $Root at $Prefix"

while ($true) {
  try {
    $context = $listener.GetContext()
    $request = $context.Request
    $response = $context.Response

    $relativePath = $request.Url.AbsolutePath.TrimStart('/')
    if ([string]::IsNullOrWhiteSpace($relativePath)) { $relativePath = 'index.html' }

    $fullPath = Join-Path $Root $relativePath
    if (!(Test-Path $fullPath)) {
      $response.StatusCode = 404
      $bytes = [System.Text.Encoding]::UTF8.GetBytes("Not Found")
      $response.OutputStream.Write($bytes, 0, $bytes.Length)
      $response.Close()
      continue
    }

    $bytes = [System.IO.File]::ReadAllBytes($fullPath)
    $contentType = 'application/octet-stream'
    if ($fullPath.EndsWith('.html')) { $contentType = 'text/html' }
    elseif ($fullPath.EndsWith('.css')) { $contentType = 'text/css' }
    elseif ($fullPath.EndsWith('.js')) { $contentType = 'application/javascript' }
    elseif ($fullPath.EndsWith('.png')) { $contentType = 'image/png' }
    elseif ($fullPath.EndsWith('.jpg') -or $fullPath.EndsWith('.jpeg')) { $contentType = 'image/jpeg' }
    elseif ($fullPath.EndsWith('.svg')) { $contentType = 'image/svg+xml' }

    $response.ContentType = $contentType
    $response.ContentLength64 = $bytes.Length
    $response.OutputStream.Write($bytes, 0, $bytes.Length)
    $response.Close()
  } catch {
    Write-Host "Server error: $_"
  }
}
