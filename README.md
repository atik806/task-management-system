# 📋 TaskFlow - Modern Task Management Dashboard

A full-stack task management application with drag-and-drop functionality, calendar view, notes system, and dark mode. Built with HTML, CSS, JavaScript, and Firebase.

![TaskFlow Dashboard](https://img.shields.io/badge/Status-Active-success)
![Version](https://img.shields.io/badge/Version-2.0-blue)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

### 🎯 Core Functionality
- ✅ **User Authentication** - Secure login/register with email or Google
- ✅ **Multi-User Workspaces** - Collaborate with team members in shared workspaces
- ✅ **Role-Based Permissions** - Owner, Admin, and Member roles with different access levels
- ✅ **Real-Time Collaboration** - See changes instantly as team members work
- ✅ **Invite System** - Invite members via email with secure invite links
- ✅ **Task Management** - Create, edit, delete, and organize tasks
- ✅ **Drag & Drop** - Move tasks between categories with smooth animations
- ✅ **Custom Categories** - Create unlimited custom task categories
- ✅ **Priority Levels** - Low, Medium, High priority with color coding
- ✅ **Deadline Tracking** - Set and track task deadlines

### 📊 Multiple Views
- **Dashboard** - Kanban-style board with drag-and-drop
- **My Tasks** - Filtered list view (All, Today, Upcoming, Overdue, Completed)
- **Calendar** - Monthly calendar with task visualization
- **Notes** - Separate notes system for important information

### 🎨 User Experience
- 🌙 **Dark Mode** - Toggle between light and dark themes
- 📱 **Responsive Design** - Works on desktop, tablet, and mobile
- 🎭 **Modern UI** - Clean, professional interface with smooth animations
- 🎨 **Color Coding** - Visual priority and category indicators
- ⚡ **Real-time Sync** - Changes saved instantly to Firebase

### 📝 Notes System
- Create unlimited notes with rich content
- 5 color themes for organization
- Grid and list view modes
- Word count and timestamps
- Separate from tasks for better organization

### 👥 Workspace Collaboration
- **Create Workspaces** - Unlimited workspaces for different teams/projects
- **Invite Members** - Send email invites with unique links
- **Role Management** - Assign Owner, Admin, or Member roles
- **Member Management** - Add, remove, and change member roles
- **Workspace Switching** - Easily switch between workspaces
- **Real-Time Sync** - All members see updates instantly
- **Secure Access** - Role-based permissions and data isolation

---

## 🚀 Quick Start

### Prerequisites

- Python 3.x (for local server)
- Firebase account (free tier works)
- Modern web browser

### 🏢 New: Multi-User Workspace System

TaskFlow now supports team collaboration! See **[WORKSPACE-README.md](WORKSPACE-README.md)** for:
- Complete workspace system documentation
- Integration guide
- Quick start for teams
- Real-time collaboration features

**Quick Links:**
- 📖 [Workspace System Overview](WORKSPACE-README.md)
- 🚀 [Quick Start Guide](WORKSPACE-QUICK-START.md)
- ✅ [Integration Checklist](WORKSPACE-INTEGRATION-CHECKLIST.md)
- 📚 [Complete Documentation](WORKSPACE-SYSTEM.md)

### Installation

1. **Clone or Download the Project**
   ```bash
   git clone <your-repo-url>
   cd taskflow
   ```

2. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure Firebase**
   
   a. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
   
   b. Enable Authentication:
   - Go to Authentication → Sign-in method
   - Enable Email/Password
   - Enable Google (optional)
   
   c. Enable Firestore Database:
   - Go to Firestore Database
   - Create database in test mode
   - Set up security rules (see below)
   
   d. Get your Firebase config:
   - Go to Project Settings → General
   - Scroll to "Your apps" → Web app
   - Copy the configuration

4. **Update Firebase Config**
   
   Edit `app.js` and `landing.js`, replace the firebaseConfig:
   ```javascript
   const firebaseConfig = {
       apiKey: "YOUR_API_KEY",
       authDomain: "YOUR_AUTH_DOMAIN",
       projectId: "YOUR_PROJECT_ID",
       storageBucket: "YOUR_STORAGE_BUCKET",
       messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
       appId: "YOUR_APP_ID"
   };
   ```

5. **Set Firestore Security Rules**
   
   Go to Firestore Database → Rules and paste:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /tasks/{taskId} {
         allow read, write: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && 
                          request.auth.uid == request.resource.data.userId;
       }
       
       match /categories/{categoryId} {
         allow read, write: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && 
                          request.auth.uid == request.resource.data.userId;
       }
       
       match /notes/{noteId} {
         allow read, write: if request.auth != null && 
                               request.auth.uid == resource.data.userId;
         allow create: if request.auth != null && 
                          request.auth.uid == request.resource.data.userId;
       }
     }
   }
   ```
   
   See `COMPLETE-FIRESTORE-RULES.txt` for the complete rules.

6. **Run the Application**
   ```bash
   python server.py
   ```
   
   Open your browser and navigate to: `http://localhost:5000`

---

## 📖 Usage Guide

### Getting Started

1. **Create an Account**
   - Click "Login / Sign Up" on landing page
   - Register with email or Google
   - You'll be redirected to the dashboard

2. **Add Your First Task**
   - Click "+ Add Task" button
   - Fill in title, description, deadline, and priority
   - Choose a category
   - Click "Create Task"

3. **Organize Tasks**
   - Drag tasks between columns
   - Tasks auto-save when moved
   - Use priority colors to identify important tasks

### Dashboard View

**Default Categories:**
- **To Do** - New tasks start here
- **In Progress** - Tasks you're working on
- **Completed** - Finished tasks

**Custom Categories:**
- Click "+ Add Category"
- Choose a name and icon
- New column appears instantly
- Drag tasks to any category

**Drag & Drop:**
- Click and hold any task card
- Drag to desired column
- Release to drop
- Changes save automatically

### My Tasks View

**Filters:**
- **All Tasks** - View everything
- **Today** - Tasks due today
- **Upcoming** - Future tasks
- **Overdue** - Past due tasks
- **Completed** - Finished tasks

**Quick Actions:**
- Mark tasks complete
- Reopen completed tasks
- Delete tasks
- View by deadline

### Calendar View

**Features:**
- Monthly calendar grid
- Navigate between months
- Click days to view tasks
- Color-coded task indicators
- Task details panel

**Task Indicators:**
- Green dot = Low priority
- Yellow dot = Medium priority
- Red dot = High priority
- "+X more" for multiple tasks

### Notes View

**Create Notes:**
- Click "+ New Note"
- Add title and content
- Choose color theme
- Save note

**View Modes:**
- **Grid View** - Card layout (default)
- **List View** - Compact list

**Color Themes:**
- Yellow - General notes
- Blue - Ideas/brainstorming
- Green - Completed/positive
- Pink - Important/urgent
- Purple - Creative/special

### Dark Mode

- Click moon/sun icon in sidebar
- Toggles between light and dark
- Preference saved automatically
- All views support dark mode

---

## 🛠️ Technology Stack

### Frontend
- **HTML5** - Structure and semantics
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Application logic
- **Font Awesome** - Icons
- **SortableJS** - Drag and drop functionality

### Backend
- **Firebase Authentication** - User management
- **Firestore Database** - Data storage
- **Firebase Hosting** - Deployment (optional)

### Server
- **Python Flask** - Local development server

---

## 📁 Project Structure

```
taskflow/
├── index.html                          # Main application page
├── landing.html                        # Landing page
├── app.js                              # Main application logic
├── landing.js                          # Landing page logic
├── workspace.js                        # Workspace system core
├── workspace-ui-controller.js          # Workspace UI controller
├── styles.css                          # Application styles
├── landing.css                         # Landing page styles
├── workspace-styles.css                # Workspace-specific styles
├── workspace-ui.html                   # Workspace UI components
├── server.py                           # Flask development server
├── requirements.txt                    # Python dependencies
├── README.md                           # This file
├── WORKSPACE-SYSTEM.md                 # Workspace system documentation
├── WORKSPACE-MIGRATION.md              # Migration guide
├── firestore-workspace-rules.txt       # Workspace security rules
├── FIRESTORE-RULES.md                  # Firestore security rules guide
├── COMPLETE-FIRESTORE-RULES.txt        # Complete rules copy-paste
├── NEW-FEATURES.md                     # Feature documentation
├── NOTES-GUIDE.md                      # Notes feature guide
├── TROUBLESHOOTING.md                  # Common issues and solutions
├── QUICK-FIX.md                        # Quick fixes for common problems
└── firebase-setup-guide.md             # Firebase setup instructions
```

---

## 🎨 Features in Detail

### Task Management
- **Create** - Add tasks with title, description, deadline, priority
- **Edit** - Update task details anytime
- **Delete** - Remove tasks with confirmation
- **Move** - Drag between categories
- **Filter** - View by status, date, priority
- **Search** - Find tasks quickly (coming soon)

### Categories
- **Default** - To Do, In Progress, Completed
- **Custom** - Create unlimited categories
- **Icons** - Choose from multiple icons
- **Delete** - Remove custom categories (tasks move to To Do)
- **Organize** - Drag tasks between any categories

### Calendar
- **Monthly View** - See full month at a glance
- **Navigation** - Move between months
- **Task Dots** - Visual indicators on days
- **Click Days** - View tasks for specific date
- **Today Highlight** - Current day marked
- **Task Details** - See all tasks for selected day

### Notes
- **Unlimited** - Create as many notes as needed
- **Rich Content** - Long-form text support
- **Colors** - 5 themes for organization
- **Views** - Grid or list layout
- **Word Count** - Track note length
- **Timestamps** - Last updated date
- **Search** - Find notes quickly (coming soon)

### Dark Mode
- **Toggle** - Switch with one click
- **Persistent** - Saves preference
- **Complete** - All views supported
- **Smooth** - Animated transitions
- **Accessible** - Maintains readability

---

## 🔒 Security

### Authentication
- Email/password with Firebase Auth
- Google OAuth integration
- Secure session management
- Password reset functionality

### Data Protection
- User-specific data isolation
- Firestore security rules
- HTTPS encryption
- No data sharing between users

### Privacy
- No tracking or analytics
- Data stored in your Firebase project
- You control all data
- Can export or delete anytime

---

## 🚀 Deployment

### Firebase Hosting (Recommended)

1. **Install Firebase CLI**
   ```bash
   npm install -g firebase-tools
   ```

2. **Login to Firebase**
   ```bash
   firebase login
   ```

3. **Initialize Project**
   ```bash
   firebase init hosting
   ```

4. **Deploy**
   ```bash
   firebase deploy
   ```

### Other Options
- **Netlify** - Drag and drop deployment
- **Vercel** - Git-based deployment
- **GitHub Pages** - Free static hosting
- **Custom Server** - Use your own hosting

---

## 🐛 Troubleshooting

### Common Issues

**Tasks not saving:**
- Check Firestore rules are configured
- Verify you're logged in
- Check browser console for errors
- See `TROUBLESHOOTING.md`

**Categories not working:**
- Update Firestore rules to include categories
- Refresh the page
- Check Firebase Console

**Notes permission error:**
- Add notes rules to Firestore
- See `COMPLETE-FIRESTORE-RULES.txt`
- Publish rules and wait 30 seconds

**Dark mode not saving:**
- Check localStorage is enabled
- Clear browser cache
- Try incognito mode

**Drag and drop not working:**
- Ensure SortableJS is loaded
- Check browser console
- Try refreshing page

For detailed solutions, see:
- `TROUBLESHOOTING.md` - General issues
- `QUICK-FIX.md` - Quick solutions
- `FIRESTORE-RULES.md` - Rules setup

---

## 📚 Documentation

### Core Documentation
- **README.md** - Main documentation (this file)
- **WORKSPACE-SYSTEM.md** - Complete workspace system guide
- **WORKSPACE-MIGRATION.md** - Migration guide for existing apps
- **NEW-FEATURES.md** - Dark mode, My Tasks, Calendar features
- **NOTES-GUIDE.md** - Complete notes system guide

### Setup Guides
- **firebase-setup-guide.md** - Firebase configuration
- **firebase-google-auth-setup.md** - Google sign-in setup
- **FIRESTORE-RULES.md** - Security rules setup
- **firestore-workspace-rules.txt** - Workspace security rules

### Troubleshooting
- **TROUBLESHOOTING.md** - Common issues and solutions
- **QUICK-FIX.md** - Quick fixes for common problems

---

## 🎯 Roadmap

### ✅ Completed Features
- [x] Multi-user workspace system
- [x] Role-based permissions
- [x] Real-time collaboration
- [x] Invite system with email links
- [x] Member management
- [x] Workspace switching

### Upcoming Features
- [ ] Task search and advanced filtering
- [ ] Recurring tasks
- [ ] Task templates
- [ ] File attachments
- [ ] Comments on tasks
- [ ] Task assignments and mentions
- [ ] Activity feed and notifications
- [ ] Mobile app (React Native)
- [ ] Desktop app (Electron)
- [ ] Email notifications
- [ ] Task reminders
- [ ] Time tracking
- [ ] Productivity statistics
- [ ] Export/import data
- [ ] Keyboard shortcuts
- [ ] Rich text editor for notes
- [ ] Note tags and categories
- [ ] Task dependencies
- [ ] Gantt chart view
- [ ] API for integrations
- [ ] Workspace templates
- [ ] Custom workspace themes

---

## 🤝 Contributing

Contributions are welcome! Here's how:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Test all features before submitting
- Update documentation
- Add comments for complex logic

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**TaskFlow Team**

- Website: [Your Website]
- Email: [Your Email]
- GitHub: [Your GitHub]

---

## 🙏 Acknowledgments

- **Firebase** - Backend infrastructure
- **Font Awesome** - Icon library
- **SortableJS** - Drag and drop functionality
- **Inspiration** - Trello, Asana, Notion

---

## 📞 Support

Need help? Check these resources:

1. **Documentation** - Read the guides in this repo
2. **Issues** - Check existing GitHub issues
3. **Firebase Docs** - [firebase.google.com/docs](https://firebase.google.com/docs)
4. **Stack Overflow** - Search for similar problems

---

## 🌟 Show Your Support

If you find this project helpful, please consider:
- ⭐ Starring the repository
- 🐛 Reporting bugs
- 💡 Suggesting features
- 📢 Sharing with others

---

## 📊 Stats

- **Version:** 2.0
- **Last Updated:** December 2024
- **Status:** Active Development
- **Language:** JavaScript
- **Framework:** Vanilla JS + Firebase

---

**Built with ❤️ for productivity enthusiasts**

Happy task managing! 🚀✨
