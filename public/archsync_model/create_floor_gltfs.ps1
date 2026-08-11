$basePath = "c:\Users\corsair\Desktop\vibecoding\TD_UE_BNO055_3dprint_Building\3d_assets"
$srcFile = Join-Path $basePath "3d_building2.gltf"
$gltfText = Get-Content $srcFile -Raw
$gltf = $gltfText | ConvertFrom-Json

# Floor 1: only building_01 (node index 1)
$g1 = $gltfText | ConvertFrom-Json
$g1.nodes[0].children = @(1)
$g1 | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $basePath "3d_building2_floor1.gltf")

# Floor 2: building_01 + building_02 (node indices 1,2)
$g2 = $gltfText | ConvertFrom-Json
$g2.nodes[0].children = @(1,2)
$g2 | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $basePath "3d_building2_floor2.gltf")

# Floor 3: building_01 + building_02 + building_03 (node indices 1,2,3)
$g3 = $gltfText | ConvertFrom-Json
$g3.nodes[0].children = @(1,2,3)
$g3 | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $basePath "3d_building2_floor3.gltf")

# Floor 4: building_01 + building_02 + building_03 + building_04 (node indices 1,2,3,4)
$g4 = $gltfText | ConvertFrom-Json
$g4.nodes[0].children = @(1,2,3,4)
$g4 | ConvertTo-Json -Depth 10 | Set-Content (Join-Path $basePath "3d_building2_floor4.gltf")

Write-Host "Created floor GLTF variants successfully."
