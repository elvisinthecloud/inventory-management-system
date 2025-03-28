$gitPath = "C:\Program Files\Git\bin\git.exe"

# Make sure we're on the feature/dashboard branch
& "$gitPath" checkout feature/dashboard

# Force push this branch to GitHub
& "$gitPath" push -u origin feature/dashboard --force 