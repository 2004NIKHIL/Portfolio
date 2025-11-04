# Experiment Project

This is a small static website project (HTML/CSS/JS) located in this repository.

Contents:
- `HTML/` - the HTML files (entry: `index.html`)
- `CSS/` and `assets/style.css` - styles
- `JS/` - JavaScript files
- `assets/` - images and audio

How to push this project to GitHub (create a new repository on GitHub, then run locally):

1. (Optional) Create a new repo on GitHub via the website or `gh` CLI.
2. Add the remote and push the `main` branch:

```bash
cd "/Users/nikhilkumar/Desktop/Project's/Experiment project"
# replace <REMOTE_URL> with your GitHub repo URL (https or ssh)
git remote add origin <REMOTE_URL>
git push -u origin main
```

To host on GitHub Pages (static site):
- On the repository settings -> Pages, set the source to `main` branch and `/ (root)` folder.
- Or create a `gh-pages` branch and enable Pages from that branch.

If you want, tell me the GitHub repo URL or grant permission and I can add the remote and push for you.
