Param()

Write-Output "Downloading face-api.js models into public/models..."

$modelsPath = Join-Path -Path $PSScriptRoot -ChildPath "..\public\models"
if (-not (Test-Path $modelsPath)) { New-Item -ItemType Directory -Path $modelsPath | Out-Null }

$files = @(
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/tiny_face_detector_model-weights_manifest.json",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_landmark_68_model-weights_manifest.json",
    "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/face_recognition_model-weights_manifest.json"
)

foreach ($url in $files) {
    $fileName = Split-Path $url -Leaf
    $dest = Join-Path $modelsPath $fileName
    Write-Output "Downloading $fileName..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $dest -UseBasicParsing -ErrorAction Stop
    } catch {
        Write-Warning ("Failed to download {0}: {1}" -f $url, $_)
    }
}

# parse manifests and download shards referenced by 'paths'
Write-Output "Parsing manifests for shard paths..."
foreach ($manifestFile in Get-ChildItem -Path $modelsPath -Filter "*-weights_manifest.json") {
    try {
        $manifestJson = Get-Content -Path (Join-Path $modelsPath $manifestFile.Name) -Raw | ConvertFrom-Json
        foreach ($entry in $manifestJson) {
            if ($entry.paths) {
                foreach ($p in $entry.paths) {
                    # raw github path for shards
                    $shardUrl = "https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/$p"
                    $shardDest = Join-Path $modelsPath $p
                    if (-not (Test-Path $shardDest)) {
                        Write-Output "Downloading shard $p..."
                        try {
                            Invoke-WebRequest -Uri $shardUrl -OutFile $shardDest -UseBasicParsing -ErrorAction Stop
                        } catch {
                            Write-Warning ("Failed to download shard {0}: {1}" -f $shardUrl, $_)
                        }
                    } else {
                        Write-Output "Shard $p already exists, skipping"
                    }
                }
            }
        }
    } catch {
        Write-Warning ("Failed to parse manifest {0}: {1}" -f $manifestFile.Name, $_)
    }
}

Write-Output "Done. Check public/models for downloaded manifest and shard files."
