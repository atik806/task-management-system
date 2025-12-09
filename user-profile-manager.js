// ==================== USER PROFILE MANAGER ====================
// Manages user profiles in Firestore for invitation system

import { doc, setDoc, getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// ==================== CREATE OR UPDATE USER PROFILE ====================

async function createOrUpdateUserProfile(user) {
    const db = window.db;
    if (!db || !user) {
        console.log('⚠️ Cannot create profile: No db or user');
        return;
    }

    try {
        console.log('👤 Creating/updating user profile for:', user.email);

        const userRef = doc(db, 'users', user.uid);
        
        // Check if profile exists
        const userDoc = await getDoc(userRef);
        
        const userData = {
            uid: user.uid,
            email: user.email.toLowerCase(),
            displayName: user.displayName || user.email.split('@')[0],
            photoURL: user.photoURL || null,
            lastLogin: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (!userDoc.exists()) {
            // Create new profile
            userData.createdAt = new Date().toISOString();
            console.log('➕ Creating new user profile');
        } else {
            console.log('🔄 Updating existing user profile');
        }

        await setDoc(userRef, userData, { merge: true });
        
        console.log('✅ User profile saved');
        return userData;
    } catch (error) {
        console.error('❌ Error creating user profile:', error);
        // Don't throw - profile creation is not critical
    }
}

// ==================== GET USER BY EMAIL ====================

async function getUserByEmail(email) {
    const db = window.db;
    if (!db) {
        console.log('⚠️ Cannot get user: No db');
        return null;
    }

    try {
        const { collection, query, where, getDocs } = await import('https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js');
        
        const usersQuery = query(
            collection(db, 'users'),
            where('email', '==', email.toLowerCase())
        );
        
        const snapshot = await getDocs(usersQuery);
        
        if (snapshot.empty) {
            return null;
        }
        
        const userDoc = snapshot.docs[0];
        return { id: userDoc.id, ...userDoc.data() };
    } catch (error) {
        console.error('❌ Error getting user:', error);
        return null;
    }
}

// ==================== EXPORT ====================

window.userProfileManager = {
    createOrUpdateUserProfile,
    getUserByEmail
};

console.log('✅ User Profile Manager Loaded');
