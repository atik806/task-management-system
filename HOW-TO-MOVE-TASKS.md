# 📖 How to Move Tasks to Shared Workspaces

## Quick Guide

### Step 1: Find Your Task
Look at your personal task board and find the task you want to share with others.

### Step 2: Click the Move Button
On the task card, you'll see three buttons:
- **Edit** (blue)
- **Delete** (red)
- **Move** (purple) ← Click this one!

### Step 3: Choose a Workspace
A modal will pop up showing:
- Your task details (so you know what you're moving)
- All your shared workspaces

Click **"Move Here"** on the workspace you want.

### Step 4: Done!
- ✅ Task disappears from your personal board
- ✅ Task appears in the shared workspace
- ✅ All workspace members can now see it
- ✅ Success notification confirms the move

## Visual Guide

```
Personal Task Board
┌─────────────────────────────┐
│ My Task                     │
│ Description here...         │
│ 📅 Dec 15  [High]          │
│ [Edit] [Delete] [Move] ←   │
└─────────────────────────────┘
         ↓ Click Move
         
Modal Opens
┌─────────────────────────────────────┐
│ Move Task to Shared Workspace       │
├─────────────────────────────────────┤
│ Task Preview:                       │
│ ┌─────────────────────────────┐   │
│ │ My Task                     │   │
│ │ [High] 📅 Dec 15           │   │
│ └─────────────────────────────┘   │
│                                     │
│ Choose Workspace:                   │
│ ┌─────────────────────────────┐   │
│ │ [AB] Team Project           │   │
│ │      3 members              │   │
│ │            [Move Here →] ←  │   │
│ └─────────────────────────────┘   │
└─────────────────────────────────────┘
         ↓ Click Move Here
         
Success!
┌─────────────────────────────────────┐
│ ✅ Task moved to "Team Project"     │
│    successfully!                    │
└─────────────────────────────────────┘

Task now in Shared Workspace
All team members can see it!
```

## What Gets Moved?

Everything about your task:
- ✅ Title
- ✅ Description
- ✅ Priority (Low/Medium/High)
- ✅ Due date
- ✅ Status (To Do/In Progress/Completed)

## What Happens?

### For You:
1. Task disappears from your personal board
2. Task appears in the shared workspace
3. You can still edit/delete it there

### For Team Members:
1. Task appears in their shared workspace view
2. They see it instantly (real-time sync)
3. They can edit/update it too

## When to Move Tasks?

### Good Times to Move:
- ✅ Task needs team input
- ✅ Want to delegate to someone
- ✅ Task is part of a team project
- ✅ Need collaboration on the task

### Keep Personal When:
- ❌ Task is private/personal
- ❌ Only you need to work on it
- ❌ Doesn't involve the team

## Important Notes

### ⚠️ Things to Know:

1. **Can't Undo**
   - Moving is permanent
   - But you can manually move it back if needed

2. **Need Shared Workspace First**
   - Must have accepted an invitation
   - Must belong to at least one shared workspace

3. **Task Ownership**
   - You become the creator in the shared workspace
   - Original creation date is reset

4. **Real-Time**
   - Other members see it immediately
   - No need to refresh

## Troubleshooting

### "You don't have any shared workspaces yet"

**Problem:** No shared workspaces available

**Solution:**
1. Ask someone to invite you
2. Accept the invitation
3. Shared workspace will be created
4. Then you can move tasks

### Move Button Not Working

**Problem:** Button doesn't respond

**Solution:**
1. Refresh the page (F5)
2. Check you're logged in
3. Check browser console for errors

### Task Didn't Move

**Problem:** Task still in personal board

**Solution:**
1. Check if you got an error message
2. Verify you have permission
3. Check Firestore rules are deployed
4. Try again

### Can't See Moved Task

**Problem:** Task not visible in shared workspace

**Solution:**
1. Switch to the shared workspace (sidebar)
2. Check you selected the right workspace
3. Refresh the page
4. Check with other team members

## Tips & Tricks

### 💡 Pro Tips:

1. **Preview Before Moving**
   - Check the task preview in the modal
   - Make sure it's the right task

2. **Choose Right Workspace**
   - Read workspace names carefully
   - Check member count
   - Pick the most relevant one

3. **Organize First**
   - Update task details before moving
   - Add clear description
   - Set proper priority

4. **Communicate**
   - Tell team members you moved a task
   - Explain what needs to be done
   - Assign if needed

## Examples

### Example 1: Team Project Task
```
Personal Task: "Design new logo"
↓ Move to "Marketing Team" workspace
Result: All marketing team members can contribute
```

### Example 2: Delegating Work
```
Personal Task: "Review documentation"
↓ Move to "User A & User B" workspace
Result: User B can help with the review
```

### Example 3: Project Collaboration
```
Personal Task: "Plan Q1 strategy"
↓ Move to "Leadership Team" workspace
Result: All leaders can add input
```

## FAQ

**Q: Can I move a task back to personal?**
A: Not directly, but you can create a new personal task with the same details.

**Q: Will I lose the task history?**
A: The task gets a new ID in the shared workspace, so yes, the original history is not preserved.

**Q: Can I move tasks between shared workspaces?**
A: Not yet, but this feature may be added in the future.

**Q: What if I move the wrong task?**
A: You can delete it from the shared workspace and recreate it in your personal board.

**Q: Do other members get notified?**
A: They see the task appear in real-time, but there's no separate notification (yet).

**Q: Can I move completed tasks?**
A: Yes! All tasks can be moved regardless of status.

**Q: Is there a limit to how many tasks I can move?**
A: No limit! Move as many as you need.

## Need More Help?

Check these guides:
- `MOVE-TASK-FEATURE.md` - Technical documentation
- `SHARED-WORKSPACE-GUIDE.md` - Complete workspace guide
- `TEST-SHARED-WORKSPACE.md` - Testing guide

---

**Happy Collaborating! 🎉**

Moving tasks to shared workspaces makes teamwork easier and keeps everyone on the same page!
