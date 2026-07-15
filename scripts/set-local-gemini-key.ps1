$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$envPath = Join-Path $projectRoot ".env.local"
$utf8WithoutBom = New-Object System.Text.UTF8Encoding($false)

try {
  $Host.UI.RawUI.WindowTitle = "Aurora Gemini Key Setup"
  Write-Host "Aurora Gemini local secure setup" -ForegroundColor Cyan
  Write-Host "Paste the new API key and press Enter. The key will not be displayed."

  $secureKey = Read-Host "GEMINI_API_KEY" -AsSecureString
  $keyPointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secureKey)
  try {
    $plainKey = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($keyPointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($keyPointer)
  }

  if ([string]::IsNullOrWhiteSpace($plainKey) -or $plainKey.Contains("`r") -or $plainKey.Contains("`n")) {
    throw "API key is empty or invalid."
  }

  $sourceLines = if (Test-Path -LiteralPath $envPath) {
    [IO.File]::ReadAllLines($envPath)
  }
  else {
    @()
  }

  $updatedLines = New-Object System.Collections.Generic.List[string]
  $keyWritten = $false
  $modelWritten = $false
  $originsWritten = $false

  foreach ($line in $sourceLines) {
    if ($line -match '^GEMINI_API_KEY=') {
      if (-not $keyWritten) {
        $updatedLines.Add("GEMINI_API_KEY=$plainKey")
        $keyWritten = $true
      }
      continue
    }

    if ($line -match '^GEMINI_MODEL=') {
      if (-not $modelWritten) {
        $updatedLines.Add("GEMINI_MODEL=gemini-3.1-flash-lite")
        $modelWritten = $true
      }
      continue
    }

    if ($line -match '^AI_ALLOWED_ORIGINS=') {
      if (-not $originsWritten) {
        $updatedLines.Add("AI_ALLOWED_ORIGINS=http://localhost:4173")
        $originsWritten = $true
      }
      continue
    }

    $updatedLines.Add($line)
  }

  if (-not $keyWritten) {
    $updatedLines.Insert(0, "GEMINI_API_KEY=$plainKey")
  }
  if (-not $modelWritten) {
    $updatedLines.Add("GEMINI_MODEL=gemini-3.1-flash-lite")
  }
  if (-not $originsWritten) {
    $updatedLines.Add("AI_ALLOWED_ORIGINS=http://localhost:4173")
  }

  [IO.File]::WriteAllLines($envPath, $updatedLines, $utf8WithoutBom)
  $plainKey = $null
  Remove-Variable plainKey -ErrorAction SilentlyContinue

  Write-Host "Done. The key was saved to the Git-ignored .env.local file." -ForegroundColor Green
  Write-Host "The script did not display or log the key."
  Read-Host "Press Enter to close" | Out-Null
}
catch {
  $plainKey = $null
  Remove-Variable plainKey -ErrorAction SilentlyContinue
  Write-Host "Setup failed: $($_.Exception.Message)" -ForegroundColor Red
  Read-Host "Press Enter to close" | Out-Null
  exit 1
}
