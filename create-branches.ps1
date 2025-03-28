$gitPath = "C:\Program Files\Git\bin\git.exe"

# Define feature branches to create
$branches = @(
    "feature/invoices",
    "feature/search",
    "feature/menu"
)

# Make sure we're on master/main branch first
& "$gitPath" checkout master

# Create each branch
foreach ($branch in $branches) {
    Write-Host "Creating branch: $branch"
    & "$gitPath" checkout -b $branch
    
    # Push the branch to GitHub
    & "$gitPath" push -u origin $branch
    
    # Go back to master for next branch
    & "$gitPath" checkout master
}

Write-Host "`nBranches created successfully! Here are all your branches:"
& "$gitPath" branch -a

Write-Host "`nTo switch to a branch, use:"
Write-Host "& `"$gitPath`" checkout branch-name" 