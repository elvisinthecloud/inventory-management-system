$gitPath = "C:\Program Files\Git\bin\git.exe"

Write-Host "=== Checking current branch ==="
& "$gitPath" branch

Write-Host "`n=== Switching to master ==="
& "$gitPath" checkout master

Write-Host "`n=== Creating feature/dashboard branch ==="
& "$gitPath" checkout -b feature/dashboard

Write-Host "`n=== Pushing branch to GitHub ==="
& "$gitPath" push -u origin feature/dashboard 