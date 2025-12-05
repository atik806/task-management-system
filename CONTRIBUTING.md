# Contributing to TaskFlow

Thank you for considering contributing to TaskFlow! We welcome contributions from everyone.

## 🚀 Getting Started

1. **Fork the Repository**
   - Click the "Fork" button at the top right of the repository page

2. **Clone Your Fork**
   ```bash
   git clone https://github.com/YOUR-USERNAME/taskflow.git
   cd taskflow
   ```

3. **Create a Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

## 💻 Development Setup

1. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

2. **Configure Firebase**
   - Follow the setup guide in `firebase-setup-guide.md`
   - Update Firebase config in `app.js` and `landing.js`

3. **Run Development Server**
   ```bash
   python server.py
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:5000`

## 📝 Making Changes

### Code Style

- Use consistent indentation (2 spaces for HTML/CSS/JS)
- Follow existing code patterns
- Add comments for complex logic
- Keep functions small and focused

### Commit Messages

Use clear, descriptive commit messages:

```
feat: Add task search functionality
fix: Resolve drag-and-drop issue on mobile
docs: Update README with new features
style: Improve button hover effects
refactor: Simplify task rendering logic
```

### Testing

Before submitting:

- [ ] Test all features work correctly
- [ ] Check responsive design on mobile
- [ ] Verify dark mode compatibility
- [ ] Test in different browsers (Chrome, Firefox, Safari)
- [ ] Check browser console for errors
- [ ] Verify Firebase integration works

## 🔄 Submitting Changes

1. **Commit Your Changes**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

2. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

3. **Create Pull Request**
   - Go to the original repository
   - Click "New Pull Request"
   - Select your fork and branch
   - Fill in the PR template
   - Submit for review

## 📋 Pull Request Guidelines

### PR Title
Use conventional commit format:
- `feat: Add new feature`
- `fix: Fix bug description`
- `docs: Update documentation`
- `style: Improve UI/UX`
- `refactor: Code improvements`

### PR Description
Include:
- What changes were made
- Why the changes were needed
- Screenshots (for UI changes)
- Testing steps
- Related issues (if any)

### Example PR Description
```markdown
## Description
Added task search functionality to quickly find tasks by title or description.

## Changes
- Added search input in top bar
- Implemented search filter logic
- Added keyboard shortcut (Ctrl+K)
- Updated documentation

## Screenshots
[Add screenshots here]

## Testing
1. Click search icon or press Ctrl+K
2. Type search query
3. Verify filtered results
4. Test with different queries

## Related Issues
Closes #123
```

## 🐛 Reporting Bugs

### Before Reporting
- Check existing issues
- Verify it's reproducible
- Test in different browsers

### Bug Report Template
```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment:**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Version: [e.g., 2.0]

**Additional context**
Any other relevant information.
```

## 💡 Feature Requests

### Feature Request Template
```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution you'd like**
What you want to happen.

**Describe alternatives you've considered**
Other solutions you've thought about.

**Additional context**
Mockups, examples, or references.
```

## 🎯 Areas for Contribution

### High Priority
- [ ] Task search and filtering
- [ ] Recurring tasks
- [ ] Mobile app optimization
- [ ] Performance improvements
- [ ] Accessibility enhancements

### Medium Priority
- [ ] Task templates
- [ ] File attachments
- [ ] Comments on tasks
- [ ] Email notifications
- [ ] Export/import data

### Low Priority
- [ ] Themes and customization
- [ ] Keyboard shortcuts
- [ ] Statistics dashboard
- [ ] Integration with other tools

## 📚 Documentation

Help improve documentation:
- Fix typos and errors
- Add examples and tutorials
- Improve setup guides
- Create video tutorials
- Translate to other languages

## 🤝 Code of Conduct

### Our Standards
- Be respectful and inclusive
- Welcome newcomers
- Accept constructive criticism
- Focus on what's best for the community
- Show empathy towards others

### Unacceptable Behavior
- Harassment or discrimination
- Trolling or insulting comments
- Personal or political attacks
- Publishing others' private information
- Other unprofessional conduct

## 📞 Getting Help

Need help contributing?

- **Discord**: [Join our community]
- **Email**: [Contact email]
- **Issues**: Ask questions in GitHub issues
- **Discussions**: Use GitHub Discussions

## 🏆 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in the README
- Given contributor badge

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TaskFlow! 🎉
